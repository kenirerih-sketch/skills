---
name: solana
description: Solana-specific APIs including standard JSON-RPC, Digital Asset Standard (DAS) for NFTs and compressed assets, and wallet integration. Use when building Solana applications that need RPC access, NFT/asset queries, or Solana wallet tooling. For high-throughput streaming, see the yellowstone-grpc skill.
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Solana APIs

## Summary
Solana-specific APIs and streaming endpoints, including DAS (Digital Asset Standard) and Yellowstone gRPC.

## References (Recommended Order)
1. [solana-rpc.md](references/solana-rpc.md) - Standard Solana JSON-RPC usage patterns.
2. [das-api.md](references/das-api.md) - DAS endpoints for assets and metadata.
3. [wallets.md](references/wallets.md) - Solana wallet integration notes.

## Cross-References
- `yellowstone-grpc` skill for high-throughput streaming (accounts/transactions/blocks).
- `data-apis` skill for EVM assets.
- `wallets` skill → `references/solana-notes.md` for high-level wallet guidance.

## Official Docs
- [Solana API Quickstart](https://www.alchemy.com/docs/reference/solana-api-quickstart)
- [DAS APIs for Solana](https://www.alchemy.com/docs/reference/alchemy-das-apis-for-solana)
