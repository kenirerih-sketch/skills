---
name: alchemy-overview
description: Quick-start guide and root index for integrating Alchemy APIs. Covers base URLs, authentication, endpoint selection, and common patterns across all Alchemy products. Use this skill first when starting any Alchemy integration or when unsure which specific API to use.
metadata:
  author: alchemyplatform
  version: "1.0"
---
# AI + Alchemy Integration Guide

## Summary
A self-contained guide for AI agents integrating Alchemy APIs. This file alone should be enough to ship a basic integration. Use the other skills for depth, edge cases, and advanced workflows.

## Do This First
1. Create an Alchemy API key at https://dashboard.alchemy.com/ and configure it for the target chain.
2. Choose the right product using the Endpoint Selector below.
3. Use the Base URLs + Auth table for the correct endpoint and headers.
4. Copy a Quickstart example and test against a testnet first.

## Base URLs + Auth (Cheat Sheet)
| Product | Base URL | Auth | Notes |
| --- | --- | --- | --- |
| Ethereum RPC (HTTPS) | `https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Standard EVM reads and writes. |
| Ethereum RPC (WSS) | `wss://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| Base RPC (HTTPS) | `https://base-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | EVM L2. |
| Base RPC (WSS) | `wss://base-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| Arbitrum RPC (HTTPS) | `https://arb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | EVM L2. |
| Arbitrum RPC (WSS) | `wss://arb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| BNB RPC (HTTPS) | `https://bnb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | EVM L1. |
| BNB RPC (WSS) | `wss://bnb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| Solana RPC (HTTPS) | `https://solana-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Solana JSON-RPC. |
| Solana Yellowstone gRPC | `https://solana-mainnet.g.alchemy.com` | `X-Token: $ALCHEMY_API_KEY` | gRPC streaming (Yellowstone). |
| NFT API | `https://<network>.g.alchemy.com/nft/v3/$ALCHEMY_API_KEY` | API key in URL | NFT ownership and metadata. |
| Prices API | `https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY` | API key in URL | Prices by symbol or address. |
| Portfolio API | `https://api.g.alchemy.com/data/v1/$ALCHEMY_API_KEY` | API key in URL | Multi-chain wallet views. |
| Notify API | `https://dashboard.alchemy.com/api` | `X-Alchemy-Token: <ALCHEMY_NOTIFY_AUTH_TOKEN>` | Generate token in dashboard. |

## Endpoint Selector (Top Tasks)
| You need | Use this | Skill / File |
| --- | --- | --- |
| EVM read/write | JSON-RPC `eth_*` | `node-apis` → `references/json-rpc.md` |
| Realtime events | `eth_subscribe` | `node-apis` → `references/websocket-subscriptions.md` |
| Token balances | `alchemy_getTokenBalances` | `data-apis` → `references/token-api.md` |
| Token metadata | `alchemy_getTokenMetadata` | `data-apis` → `references/token-api.md` |
| Transfers history | `alchemy_getAssetTransfers` | `data-apis` → `references/transfers-api.md` |
| NFT ownership | `GET /getNFTsForOwner` | `data-apis` → `references/nft-api.md` |
| NFT metadata | `GET /getNFTMetadata` | `data-apis` → `references/nft-api.md` |
| Prices (spot) | `GET /tokens/by-symbol` | `data-apis` → `references/prices-api.md` |
| Prices (historical) | `POST /tokens/historical` | `data-apis` → `references/prices-api.md` |
| Portfolio (multi-chain) | `POST /assets/*/by-address` | `data-apis` → `references/portfolio-apis.md` |
| Simulate tx | `alchemy_simulateAssetChanges` | `data-apis` → `references/simulation-api.md` |
| Create webhook | `POST /create-webhook` | `webhooks` → `references/overview.md` |
| Solana NFT data | `getAssetsByOwner` (DAS) | `solana` → `references/das-api.md` |

## One-File Quickstart (Copy/Paste)
### EVM JSON-RPC (Read)
```bash
curl -s https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'
```

### Token Balances
```bash
curl -s https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"alchemy_getTokenBalances","params":["0x00000000219ab540356cbb839cbe05303d7705fa"]}'
```

### Transfer History
```bash
curl -s https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"alchemy_getAssetTransfers","params":[{"fromBlock":"0x0","toBlock":"latest","toAddress":"0x00000000219ab540356cbb839cbe05303d7705fa","category":["erc20"],"withMetadata":true,"maxCount":"0x3e8"}]}'
```

### NFT Ownership
```bash
curl -s "https://eth-mainnet.g.alchemy.com/nft/v3/$ALCHEMY_API_KEY/getNFTsForOwner?owner=0x00000000219ab540356cbb839cbe05303d7705fa"
```

### Prices (Spot)
```bash
curl -s "https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY/tokens/by-symbol?symbols=ETH,USDC"
```

### Prices (Historical)
```bash
curl -s -X POST "https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY/tokens/historical" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ETH","startTime":"2024-01-01T00:00:00Z","endTime":"2024-01-02T00:00:00Z"}'
```

### Create Notify Webhook
```bash
curl -s -X POST "https://dashboard.alchemy.com/api/create-webhook" \
  -H "Content-Type: application/json" \
  -H "X-Alchemy-Token: $ALCHEMY_NOTIFY_AUTH_TOKEN" \
  -d '{"network":"ETH_MAINNET","webhook_type":"ADDRESS_ACTIVITY","webhook_url":"https://example.com/webhook","addresses":["0x00000000219ab540356cbb839cbe05303d7705fa"]}'
```

### Verify Webhook Signature (Node)
```ts
import crypto from "crypto";

export function verify(rawBody: string, signature: string, secret: string) {
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}
```

## Network Naming Rules
- Data APIs and JSON-RPC use lowercase network enums like `eth-mainnet`.
- Notify API uses uppercase enums like `ETH_MAINNET`.

## Pagination + Limits (Cheat Sheet)
| Endpoint | Limit | Notes |
| --- | --- | --- |
| `alchemy_getTokenBalances` | `maxCount` <= 100 | Use `pageKey` for pagination. |
| `alchemy_getAssetTransfers` | `maxCount` default `0x3e8` | Use `pageKey` for pagination. |
| Portfolio token balances | 3 address/network pairs, 20 networks total | `pageKey` supported. |
| Portfolio NFTs | 2 address/network pairs, 15 networks each | `pageKey` supported. |
| Prices by address | 25 addresses, 3 networks | POST body `addresses[]`. |
| Transactions history (beta) | 1 address/network pair, 2 networks | ETH and BASE mainnets only. |

## Common Token Addresses
| Token | Chain | Address |
| --- | --- | --- |
| ETH | ethereum | `0x0000000000000000000000000000000000000000` |
| WETH | ethereum | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| USDC | ethereum | `0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eB48` |
| USDC | base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Failure Modes + Retries
- HTTP `429` means rate limit. Use exponential backoff with jitter.
- JSON-RPC errors come in `error` fields even with HTTP 200.
- Use `pageKey` to resume pagination after failures.
- De-dupe websocket events on reconnect.

## Skill Map
| Skill | Description |
| --- | --- |
| `node-apis` | Standard JSON-RPC + WebSocket subscriptions, Debug/Trace, and utility endpoints. |
| `data-apis` | Token, NFT, Transfers, Prices, Portfolio, and Simulation APIs. |
| `webhooks` | Notify webhooks for address/NFT activity and custom webhook configs. |
| `wallets` | Wallet and smart wallet integration (Account Kit, bundler, gas manager). |
| `solana` | Solana-specific APIs including DAS. |
| `yellowstone-grpc` | Solana high-throughput gRPC streaming. |
| `rollups` | High-level overview of Alchemy Rollups. |
| `operational` | Auth, security, limits, usage monitoring, and dashboard tooling. |
| `recipes` | End-to-end integration flows combining multiple APIs. |
| `ecosystem` | Popular open-source libraries that pair well with Alchemy. |

## Official Docs
- [Get Started](https://www.alchemy.com/docs/get-started)
- [Create an API Key](https://www.alchemy.com/docs/create-an-api-key)
