---
name: data-apis
description: Higher-level Alchemy APIs for asset discovery, wallet analytics, transfer history, NFT data, and token pricing. Use when you need indexed blockchain data without raw RPC log scanning, including token balances, NFT ownership, portfolio views, price feeds, and transaction simulation.
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Data APIs

## Summary
Higher-level APIs for asset discovery, wallet analytics, transfer history, and pricing. These are optimized for analytics use cases and reduce the need for raw RPC log scanning.

## References (Recommended Order)
1. [token-api.md](references/token-api.md) - Token balances and token metadata for wallets and contracts.
2. [portfolio-apis.md](references/portfolio-apis.md) - Consolidated wallet views (tokens/NFTs/summary).
3. [transfers-api.md](references/transfers-api.md) - Transfer history and indexed movement data.
4. [nft-api.md](references/nft-api.md) - NFT ownership, metadata, and collection queries.
5. [prices-api.md](references/prices-api.md) - Token price data for current and historical pricing.
6. [simulation-api.md](references/simulation-api.md) - Pre-execution simulation for risk checks.

## How to Use This Skill
- Prefer these APIs when you want asset analytics or historical data without maintaining a custom indexer.
- If you need real-time updates, pair with the `webhooks` skill.

## Cross-References
- `node-apis` skill → `references/enhanced-apis.md` for related RPC-style endpoints.
- `recipes` skill for end-to-end workflows.

## Official Docs
- [Data APIs Overview](https://www.alchemy.com/docs/reference/data-overview)
