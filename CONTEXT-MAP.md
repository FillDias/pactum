# Context Map

## Contexts

- [Finanças Pessoais](./docs/financas/CONTEXT.md) — tracks a user's (or família's) income, expenses, balance, and savings goals
- [Pactum Core](./docs/core/CONTEXT.md) — tracks investment portfolios, holdings, and securities via an external Core service

## Relationships

- **Finanças Pessoais ↔ Pactum Core**: no data relationship today. `Receita.tipo` includes an `investimento` category (income *labeled* as investment-related), but this is not connected to any `Portfolio`/`Position` data from Pactum Core — the shared word "investimento" is a naming coincidence, not a link.
- Pactum Core authenticates separately from the app's primary login — it is a distinct bounded context, not just a different screen. See [ADR-0001](./docs/adr/0001-token-exchange-between-api-and-core.md) for why.
