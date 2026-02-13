---
id: solana/yellowstone-grpc/subscribe-request
title: 'Subscribe Request'
summary: 'The subscribe request configures what streams and filters you want from Yellowstone.'
tags:
  - alchemy
  - solana
related:
  - solana/yellowstone-grpc/subscribe-accounts.md
  - solana/yellowstone-grpc/subscribe-transactions.md
updated: 2026-02-05
---
# Subscribe Request

## Summary
The subscribe request configures what streams and filters you want from Yellowstone.

## Key Fields (Conceptual)
- `accounts`: account filters and account updates.
- `transactions`: transaction stream with include/exclude filters.
- `blocks`: block data and metadata.
- `slots`: slot updates.

## Guidance
- Start with a minimal filter and expand.
- Apply server-side filters to reduce bandwidth.

## Related Files
- `subscribe-accounts.md`
- `subscribe-transactions.md`

## Official Docs
- [Yellowstone gRPC API Overview](https://www.alchemy.com/docs/reference/yellowstone-grpc-api-overview)
