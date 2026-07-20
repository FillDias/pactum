# Finanças Pessoais

Tracks a user's (or família's) income, expenses, resulting balance, and savings goals.

## Language

**Lançamento**:
A record of a single financial movement in a given month/year — either money in or money out. The atomic unit of financial tracking; its `tipo` (Receita or Despesa) determines direction.
_Avoid_: entry, transaction (too generic)

**Receita**:
A Lançamento whose `tipo` is income — money coming in (salário, freela, bônus, etc). Not a separate entity from Lançamento.
_Avoid_: modeling Receita as its own concept split off from Lançamento/Despesa — the two must share one record so Saldo stays correct.

**Despesa**:
A Lançamento whose `tipo` is expense — money going out.
_Avoid_: gasto (used loosely in code/comments, but Despesa is the canonical term)

**Saldo**:
The net financial balance for a period: total Receitas minus total Despesas, scoped to a Usuário or a Família.
_Avoid_: balance, saldo familiar (that's just Saldo at Família escopo, not a separate concept)

**Meta**:
A savings goal with a target value (valor_alvo), current progress (valor_atual), and a deadline (prazo).
_Avoid_: objetivo, goal

**Escopo**:
The visibility scope applied when reading financial data — `eu` (just this Usuário) or `família` (all membros of the Família). Not a property of a Lançamento itself, just a query-time filter.
_Avoid_: modo, filtro

**Usuário**:
A person with an account. May optionally belong to a Família.

**Família**:
A group of Usuários who share visibility into each other's Lançamentos and Saldo when Escopo is `família`. Each membro has a papel (dono or membro).
_Avoid_: grupo, casal (the code uses "casal" in places, but a Família isn't limited to two people)

**Cartão**:
A credit card a Usuário registers: an Operadora, an optional apelido, and an optional limite. Owned by one Usuário; optionally visible to their Família under the same visibility-vs-mutation split as Lançamento — a Família membro can see a shared Cartão but only its owner can create Compras on it or edit/delete it.

**Operadora**:
The issuer of a Cartão — a fixed list (Inter, Sicredi, Sicoob, Itaú, Santander, 99Pay, BTG, RecargaPay) plus a free-text option for anything else. An attribute of a Cartão, not an entity of its own.

**Compra no Cartão**:
A purchase made on a Cartão, optionally split into 1–48 Parcelas. Holds the plan — valor total, número de parcelas, and the mês/ano the first Parcela lands in. The single source of truth for a parcelamento: editing or cancelling it only ever affects Parcelas not yet materialized, never ones that already landed in a closed month's Saldo.
_Avoid_: parcelamento (the act, not the record); the record itself is the Compra no Cartão

**Parcela**:
One month's installment of a Compra no Cartão. Not a persisted entity of its own — when a Parcela's month is reached, it is materialized as a Lançamento (Despesa, categoria Cartão) tracing back to its Compra no Cartão, so it flows through the same Saldo calculation as everything else.
_Avoid_: giving Parcela its own table/store — that reintroduces exactly the fragmentation Receita had before the fix

**Comprometido Futuro**:
The total value of a Cartão's (or all of a user's/família's Cartões') Parcelas that haven't been materialized yet — a read-only projection over Compras no Cartão. Not part of Saldo; Saldo only ever sums Lançamentos that already exist.
_Avoid_: projeção de saldo (it never touches Saldo)
