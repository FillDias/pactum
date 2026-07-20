# Spec: Cartões de Crédito

Status: **modelo pendente de confirmação** — não implementar até o usuário aprovar este documento.

Modelo de domínio em `docs/financas/CONTEXT.md` (termos: Cartão, Operadora, Compra no Cartão, Parcela, Comprometido Futuro). Decisões de arquitetura em `docs/adr/0003-cartao-parcela-materializacao-sob-consulta.md` e `docs/adr/0002-legacy-receitas-table-still-unioned-into-saldo.md` (contexto correlato descoberto durante a modelagem).

## Pactum Core: sem dependência (confirmado)

Analisei `/home/fillwo/Documentos/Projecto01/pactum-core` (`pactum-core-api`, Rails, e `pactum-core-engine`, Kotlin/Gradle) — nenhuma dependência, acoplamento ou ponto de integração com Cartões de Crédito:

- **Banco de dados próprio e isolado**: `pactum-core-api` roda em `pactum_core_api_development`, um banco Postgres separado do `pactum-api`. Seu `users` é uma tabela própria, criada sob demanda pelo fluxo `auth/sync` do ADR-0001 (casada só por e-mail, sem FK compartilhada) — não é a mesma tabela `users` do `pactum-api`.
- **Domínio exclusivo de investimentos**: os únicos models são `Portfolio`, `Security`, `Transaction`, `User`; as únicas rotas são `portfolios`, `transactions`, `positions`, `securities`, `calculations/{nav,cdi,twr,irr}`. Nenhuma menção a cartão, lançamento, despesa, saldo ou receita em nenhum arquivo de `app/`/`lib/` dos dois subprojetos (busquei com grep case-insensitive nos dois).
- **Autenticação**: o token-exchange do ADR-0001 (`auth/sync`) existe só para autenticar o usuário nas chamadas de `portfolios`/`securities`/`calculations` — Cartões de Crédito não precisa chamar `pactum-core-api` para nada, então não precisa desse token nem desse fluxo.

Conclusão: Cartões de Crédito é inteiramente um recurso do contexto **Finanças Pessoais** (`pactum-api` + mobile), sem nenhum ponto de contato com **Pactum Core**. Nenhuma mudança necessária em `pactum-core-api` ou `pactum-core-engine` para esta feature.

## Resumo do modelo

- **Cartão**: cadastro do cartão (operadora, apelido, limite). `user_id` + `familia_id` opcional, mesmo padrão de visibilidade do Lançamento — só o dono pode criar/editar/excluir, família só visualiza.
- **CompraCartao**: o plano de uma compra parcelada (valor total, número de parcelas, cartão, mês/ano de referência). Não pré-cria parcelas.
- **Parcela**: não é uma entidade persistida — é um `Lancamento` (tipo `despesa`, categoria `Cartao`) materializado sob consulta, com `compra_cartao_id` e `numero_parcela` apontando de volta pro plano.
- **Saldo**: nenhuma mudança de forma — continua somando só `Lancamento`. Parcelas materializadas entram automaticamente.
- **Comprometido Futuro**: projeção separada, só-leitura, calculada a partir dos planos de `CompraCartao`, sem tocar em `Lancamento`/Saldo.

## Backend (pactum-api)

### Migrations

1. `create_cartoes`
   ```
   t.uuid    :user_id, null: false
   t.uuid    :familia_id
   t.string  :apelido
   t.string  :operadora, null: false
   t.decimal :limite, precision: 10, scale: 2
   t.timestamps
   index [:user_id]
   index [:familia_id]
   ```
2. `create_compras_cartao`
   ```
   t.uuid    :user_id, null: false
   t.uuid    :familia_id
   t.uuid    :cartao_id, null: false
   t.string  :descricao, null: false
   t.decimal :valor_total, precision: 10, scale: 2, null: false
   t.integer :numero_parcelas, null: false            # 1..48
   t.integer :mes_referencia, null: false              # 1..12
   t.integer :ano_referencia, null: false
   t.datetime :cancelada_em                            # nil = ativa
   t.timestamps
   index [:cartao_id]
   index [:user_id]
   ```
3. `add_cartao_fields_to_lancamentos`
   ```
   t.uuid    :compra_cartao_id
   t.integer :numero_parcela
   index [:compra_cartao_id]
   unique index [:compra_cartao_id, :numero_parcela] where compra_cartao_id is not null
   ```

### Models

- `Cartao < ApplicationRecord` — `belongs_to :user`, `belongs_to :familia, optional: true`, `has_many :compras_cartao`. `OPERADORAS` = lista fixa só como referência (igual `Investimento::TIPOS`), sem `inclusion:` (permite "Outra" livre — mesmo padrão de `Lancamento.categoria`, que também não tem inclusion). Validação: `operadora` presence.
- `CompraCartao < ApplicationRecord` — `belongs_to :cartao`, `belongs_to :user`, `belongs_to :familia, optional: true`, `has_many :parcelas_lancamentos, class_name: 'Lancamento', foreign_key: :compra_cartao_id`. Validações: `numero_parcelas` entre 1 e 48, `valor_total > 0`, `mes_referencia` 1..12.
- `Lancamento` — adiciona `belongs_to :compra_cartao, optional: true`. Sem mudança de validação (categoria "Cartao" já está em `CATEGORIAS`).

### Services

- `CartaoService` — `listar/criar/atualizar/deletar`, mesmo formato de `InvestimentoService`/`LancamentoService` (métodos de classe, escopo por `user_id`/`familia_id` via `FamiliaService.membros_ids`).
- `CompraCartaoService`:
  - `criar(user, params)` — cria a `CompraCartao`, **e materializa a primeira parcela imediatamente** (mês de referência), já que ele com certeza está sendo "consultado" no momento da criação.
  - `materializar_parcelas_do_mes!(user_ids, mes, ano)` — para cada `CompraCartao` ativa (não cancelada) desses usuários cujo intervalo [mes_referencia..mes_referencia+numero_parcelas-1] cobre o mes/ano pedido, `find_or_create_by!` o `Lancamento` correspondente (idempotente via índice único). Chamado a partir de `LancamentoService.listar` e `SaldoService.calcular` antes de consultar `Lancamento`.
  - `atualizar(id, user_id, params)` — só permite editar campos que afetam parcelas **futuras não materializadas** (ex: `numero_parcelas`, `valor_total` recalcula parcelas restantes). Parcelas já materializadas não mudam.
  - `cancelar(id, user_id)` — seta `cancelada_em`; para de materializar parcelas futuras. Parcelas já materializadas continuam existindo como `Lancamento` normal (usuário pode excluir manualmente se quiser).
  - `comprometido_futuro(user, mes_atual, ano_atual)` — projeção: para cada `CompraCartao` ativa, soma `valor_total/numero_parcelas` das parcelas cujo número cai depois do mes/ano atual. **Não toca em `Lancamento`.**

### Controllers/Routes

```ruby
resources :cartoes,        only: [:index, :create, :update, :destroy]
resources :compras_cartao, only: [:index, :create, :update, :destroy] do
  member { post :cancelar }
end
get "cartoes/comprometido_futuro", to: "compras_cartao#comprometido_futuro"
```

Mesmo padrão de `BaseController`/`render_success`/`render_error` dos controllers existentes.

## Mobile (pactum)

- `types/index.ts`: adiciona `Cartao`, `CompraCartao`. `Lancamento` ganha `compra_cartao_id?: string | null` e `numero_parcela?: number | null`.
- `constants/categories.ts`: adiciona `Cartao` em `CATEGORIAS` (categoria de despesa) — já é aceito pelo backend, só falta no client.
- `services/cartaoService.ts`, `services/compraCartaoService.ts` — mesmo padrão de `lancamentosService.ts`/`investimentosService.ts` (funções soltas por operação).
- `store/cartaoStore.ts`, `store/compraCartaoStore.ts` — mesmo padrão zustand dos stores existentes (`carregando`/`erro`/CRUD).
- `viewmodels/useCartoesViewModel.ts` — lista de cartões, form de cadastro (operadora com lista fixa + "Outra" custom), CRUD.
- `viewmodels/useCompraCartaoViewModel.ts` — form de lançamento de compra parcelada (cartão, valor, parcelas 1–48, mês/ano referência, descrição), lista de compras por cartão/mês, total por cartão no mês, total geral no mês, comprometido futuro.
- Nova tela/rota: cadastro de cartão + lançamento de compra parcelada. (Precisa de decisão de UX — ver "Em aberto" abaixo.)
- Dashboard (`useDashboardViewModel.ts`): nenhuma mudança de cálculo — `saldoValor` já vem de `useSaldoStore`, que já vai refletir parcelas materializadas automaticamente pelo backend.

## Testes (seams sugeridos para TDD)

- `CompraCartaoService.materializar_parcelas_do_mes!` — idempotência (chamar duas vezes não duplica), parcela fora do intervalo não materializa, valor da parcela = valor_total/numero_parcelas.
- `CompraCartaoService.comprometido_futuro` — soma correta excluindo parcelas já materializadas/passadas.
- `SaldoService.calcular` — saldo do mês reflete parcela de cartão materializada, sem duplicar.
- Mobile: `useCompraCartaoViewModel` — igual ao padrão usado em `useReceitasViewModel.test.ts` (mock de services, asserts sobre store compartilhado).

## Fora de escopo (explicitamente adiado)

- Fechamento/pagamento de fatura (marcar fatura como paga, data de vencimento da fatura em si — o requisito fala em "mês de referência", não em ciclo de fatura com data de corte).
- Limite de crédito sendo validado/bloqueando lançamento (campo existe, mas sem regra de negócio associada ainda).
- Notificação/alerta de fatura próxima do vencimento (existe um padrão parecido em `alertasVencimento` no dashboard para investimentos de renda fixa — poderia ser reaproveitado depois, não nesta spec).

## Decisões de UX confirmadas

1. **Nova aba própria "Cartões"** no tab bar, mesmo padrão de Receitas/Investimentos — tela dedicada com lista de cartões, compras parceladas, totais e comprometido futuro.
2. **`comprometido_futuro` projeta até a última parcela pendente** de todas as compras ativas (sem corte fixo de meses) — no máximo 48 meses à frente para uma compra de 48x.

Falta só a sua confirmação final deste documento para eu quebrar em tickets sequenciais (migrations → models/services Rails → controllers/routes → mobile types/services/stores → mobile UI → testes).
