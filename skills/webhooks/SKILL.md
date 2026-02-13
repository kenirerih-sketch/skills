---
name: webhooks
description: Push-based delivery of blockchain events via Alchemy Notify API. Use when you need real-time notifications for address activity, NFT transfers, or custom on-chain events instead of polling. Covers webhook creation, payload formats, signature verification, and filtering.
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Webhooks (Notify)

## Summary
Push-based delivery of blockchain events. Use this instead of polling where possible.

## References (Recommended Order)
1. [overview.md](references/overview.md) - Webhook architecture and how to choose types.
2. [webhook-types.md](references/webhook-types.md) - Event types and when to use each.
3. [webhook-payloads.md](references/webhook-payloads.md) - Payload structure and validation patterns.
4. [verify-signatures.md](references/verify-signatures.md) - Signature verification and security guidance.
5. [address-activity.md](references/address-activity.md) - Address activity webhooks.
6. [nft-activity.md](references/nft-activity.md) - NFT-related webhooks.
7. [custom-webhooks.md](references/custom-webhooks.md) - Custom webhook setup and filters.

## Cross-References
- `data-apis` skill → `references/transfers-api.md` for historical data when a webhook is missed.
- `operational` skill → `references/auth-and-keys.md` for security best practices.

## Official Docs
- [Notify API Quickstart](https://www.alchemy.com/docs/reference/notify-api-quickstart)
