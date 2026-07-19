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
