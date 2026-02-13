---
id: solana/yellowstone-grpc/best-practices
title: 'Yellowstone Best Practices'
summary: 'Practical guidance to keep Yellowstone consumers reliable and efficient.'
tags:
  - alchemy
  - solana
related:
  - solana/yellowstone-grpc/examples.md
updated: 2026-02-05
---
# Yellowstone Best Practices

## Summary
Practical guidance to keep Yellowstone consumers reliable and efficient.

## Recommendations
- Use server-side filters to reduce bandwidth.
- Implement reconnect logic and resume from last processed slot.
- Persist checkpoints to avoid reprocessing.
- Apply backpressure (queue + worker model).
- Use gRPC flow control and limit in-flight messages to avoid OOM.
- Persist checkpoints to resume after reconnects without reprocessing.

## Related Files
- `examples.md`

## Official Docs
- [Yellowstone gRPC Overview](https://www.alchemy.com/docs/reference/yellowstone-grpc-overview)
