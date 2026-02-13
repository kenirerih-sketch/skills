---
id: recipes/get-prices-current-historical
title: 'Recipe: Get Current and Historical Prices'
summary: ''
tags:
  - alchemy
  - recipes
  - recipe
related:
  - data-apis/prices-api.md
updated: 2026-02-05
---
# Recipe: Get Current and Historical Prices

## Goal
Fetch current prices and historical price series for tokens.

## Inputs
- `symbols` (e.g., `ETH`, `BTC`)
- `startTime`, `endTime`
- `ALCHEMY_API_KEY`

## Steps
1. Query current prices by symbol.
2. Query historical prices for a time range.

## Example (Current)
```bash
curl -s "https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY/tokens/by-symbol?symbols=ETH,BTC"
```

## Example (Historical)
```bash
curl -s -X POST "https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY/tokens/historical" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ETH","startTime":"2024-01-01T00:00:00Z","endTime":"2024-01-02T00:00:00Z"}'
```

## Output
- Spot prices and historical time series.

## Related Files
- `../data-apis/prices-api.md`

## Official Docs
- [Prices API Reference](https://www.alchemy.com/docs/reference/prices-api)
