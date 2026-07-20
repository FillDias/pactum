# Tickets: Cartões de Crédito

Spec aprovada em `docs/specs/cartoes-de-credito.md`. Ordem sequencial — cada ticket assume os anteriores concluídos.

## Backend (pactum-api)

### T1 — Migrations
`db/migrate/*_create_cartoes.rb`, `*_create_compras_cartao.rb`, `*_add_cartao_fields_to_lancamentos.rb` (ver spec para colunas/índices exatos, incluindo o índice único parcial `(compra_cartao_id, numero_parcela)`).
- Critério: `bin/rails db:migrate` limpo, `schema.rb` reflete as 3 mudanças.

### T2 — Models
`Cartao`, `CompraCartao` (associations, validações: `numero_parcelas` 1..48, `valor_total > 0`, `mes_referencia` 1..12), e `Lancamento` ganha `belongs_to :compra_cartao, optional: true`.
- Critério: testes de validação de model (specs) cobrindo os limites de `numero_parcelas` (0, 1, 48, 49) e `valor_total` (0, negativo).
- Depende de: T1.

### T3 — CartaoService
`listar/criar/atualizar/deletar`, mesmo formato de `InvestimentoService`. Sem materialização envolvida.
- Critério: specs cobrindo escopo eu/família (reaproveitar padrão de teste do `LancamentoService`, se existir) e a regra de mutação restrita a `user_id`.
- Depende de: T2.

### T4 — CompraCartaoService: CRUD + materialização
`criar` (materializa a 1ª parcela), `atualizar`/`cancelar` (só afeta parcelas futuras), `materializar_parcelas_do_mes!` (idempotente).
- Critério (TDD, seams já definidos na spec):
  - `materializar_parcelas_do_mes!` chamado duas vezes não duplica `Lancamento`.
  - Mês fora do intervalo da compra não materializa nada.
  - Valor da parcela = `valor_total / numero_parcelas`, arredondado para 2 casas. **Regra de arredondamento (confirmada)**: parcelas 1..N-1 usam o valor arredondado; a última parcela recebe `valor_total - (soma das N-1 anteriores)`, absorvendo a diferença de centavos — a soma das parcelas materializadas sempre bate exatamente com `valor_total`.
  - Cancelar uma `CompraCartao` não apaga/altera `Lancamento` já materializado.
- Depende de: T2.

### T5 — Integração com LancamentoService e SaldoService
`LancamentoService.listar` e `SaldoService.calcular` chamam `materializar_parcelas_do_mes!` antes de consultar `Lancamento`.
- Critério: spec de integração — criar uma `CompraCartao`, consultar saldo de um mês futuro dela, confirmar que a parcela aparece no saldo e é a única linha (sem duplicar em consultas repetidas).
- Depende de: T4.

### T6 — CompraCartaoService.comprometido_futuro
Projeção só-leitura, soma parcelas não materializadas de compras ativas, até a última parcela pendente.
- Critério: spec cobrindo compra com parcelas já parcialmente materializadas (só soma o restante) e compra cancelada (não entra na soma).
- Depende de: T4.

### T7 — Controllers e rotas
`CartoesController`, `ComprasCartaoController` (+ `cancelar` member route, `comprometido_futuro` collection route), mesmo padrão de `BaseController`.
- Critério: request specs cobrindo os 4 CRUDs + as duas rotas extras, incluindo caso de erro (ex: criar compra em cartão de outro usuário).
- Depende de: T3, T5, T6.

## Mobile (pactum)

### T8 — Types e constantes
`Cartao`, `CompraCartao` em `types/index.ts`; `compra_cartao_id`/`numero_parcela` opcionais em `Lancamento`; `Cartao` adicionado a `CATEGORIAS` em `constants/categories.ts`; lista de operadoras pré-definidas + "Outra" em `constants/categories.ts` (mesmo padrão de `CATEGORIAS_RECEITA`).
- Depende de: nada do backend — pode rodar em paralelo com T1–T7.

### T9 — Services mobile
`services/cartaoService.ts`, `services/compraCartaoService.ts` — mesmo padrão de `lancamentosService.ts` (funções soltas, `api.get/post/patch/delete`).
- Depende de: T7 (contrato dos endpoints), T8.

### T10 — Stores mobile
`store/cartaoStore.ts`, `store/compraCartaoStore.ts` — mesmo padrão zustand (`carregando`/`erro`/CRUD) de `financasStore.ts`/`metasStore.ts`.
- Depende de: T9.

### T11 — Viewmodels mobile
`useCartoesViewModel.ts` (cadastro/lista de cartões, seletor de operadora com "Outra"), `useCompraCartaoViewModel.ts` (form de compra parcelada, totais por cartão/mês, total geral, comprometido futuro).
- Critério (TDD, seguindo o padrão de `useReceitasViewModel.test.ts`): mock dos services, asserts sobre os stores reais — cobrir "criar compra materializa e aparece no total do mês", "comprometido futuro soma certo".
- Depende de: T10.

### T12 — UI mobile
Nova aba "Cartões" no tab bar: tela de lista/cadastro de cartão, tela/modal de lançar compra parcelada, exibição de total por cartão + total geral do mês + comprometido futuro.
- Depende de: T11.

### T13 — Testes finais e typecheck
`npx tsc --noEmit` limpo, `npx jest` completo, revisão manual do fluxo golden-path (cadastrar cartão → lançar compra 3x → conferir saldo do mês atual e dos 2 meses seguintes → cancelar e conferir que parcelas futuras somem).
- Depende de: T12.

---

Ordem de execução recomendada: **T1 → T2 → (T3 e T8 em paralelo) → T4 → T5 e T6 (paralelo) → T7 → T9 → T10 → T11 → T12 → T13**.

Aguardando sua confirmação para começar por T1.
