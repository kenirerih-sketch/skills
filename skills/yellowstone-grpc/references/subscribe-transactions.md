---
id: solana/yellowstone-grpc/subscribe-transactions
title: 'Subscribe Transactions'
summary: 'Transaction streams deliver raw or decoded transaction data in near real-time.'
tags:
  - alchemy
  - solana
related:
  - solana/yellowstone-grpc/subscribe-request.md
  - solana/yellowstone-grpc/best-practices.md
updated: 2026-02-05
---
# Subscribe Transactions

## Summary
Transaction streams deliver raw or decoded transaction data in near real-time.

## Use Cases
- Real-time analytics pipelines.
- On-chain alerting and monitoring.

## Guidance
- Filter by program IDs when possible.
- Expect high volume on mainnet.
- Implement backpressure and bounded queues; transactions can arrive in bursts.

## Related Files
- `subscribe-request.md`
- `best-practices.md`

## Official Docs
- [Yellowstone gRPC API Overview](https://www.alchemy.com/docs/reference/yellowstone-grpc-api-overview)
