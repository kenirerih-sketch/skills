---
id: webhooks/webhook-payloads
title: 'Webhook Payloads'
summary: 'Webhook payloads include event metadata plus event-specific fields. Treat them as untrusted input and validate carefully.'
tags:
  - alchemy
  - webhooks
  - webhook
related:
  - webhooks/verify-signatures.md
  - webhooks/address-activity.md
updated: 2026-02-05
---
# Webhook Payloads

## Summary
Webhook payloads include event metadata plus event-specific fields. Treat them as untrusted input and validate carefully.

## Typical Fields
- `webhookId`
- `event` or `type`
- `network`
- `createdAt`
- `data` or `activity` array (event-specific)

## Validation Guidance
- Validate address formats and numeric ranges.
- Verify the signature before processing.
- Use idempotency keys derived from event IDs or transaction hashes.

## Storage Guidance
- Store raw payload + processed record for reprocessing.
- Consider a dead-letter queue for failures.

## Related Files
- `verify-signatures.md`
- `address-activity.md`

## Official Docs
- [Notify API FAQ](https://www.alchemy.com/docs/reference/notify-api-faq)
