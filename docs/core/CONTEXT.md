# Pactum Core

Tracks investment portfolios, holdings, and securities via an external Core service with its own authentication, separate from the app's primary login.

## Language

**Portfolio**:
A named collection of investment Positions, denominated in a single currency.

**Security**:
An investable instrument (stock, fixed income, etc.) identified by ticker. Fixed-income securities carry extra attributes: annual_rate, maturity_date, index_type.
_Avoid_: ativo, asset

**Position**:
The current holding of a Security within a Portfolio — quantity, average cost, current market value, and computed profit/loss. Derived from that Security's PortfolioTransactions, not stored directly.
_Avoid_: holding

**PortfolioTransaction**:
A single BUY or SELL event for a Security within a Portfolio: quantity, price, date, and broker.
_Avoid_: transaction (too generic outside this context), lançamento (this is not a Finanças Pessoais Lançamento — the two contexts don't share this concept)

**PortfolioSummary**:
An aggregated snapshot of a Portfolio's Positions and totals (total cost, total market value, total P/L) at read time.
