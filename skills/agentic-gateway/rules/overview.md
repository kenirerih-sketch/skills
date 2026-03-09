# Gateway Overview

> **Routing:** This file contains both EVM and Solana instructions. Follow ONLY the section matching the user's confirmed `NETWORK_TYPE`. If the network type has not been confirmed yet, stop and ask the user before proceeding.

The Alchemy Agentic Gateway lets agents easily access Alchemy's developer platform, authenticating with SIWE (EVM) or SIWS (Solana) and paying per-request with USDC via the x402 protocol.

## Base URL

```
https://x402.alchemy.com
```

The gateway exposes four API routes:

| Route | Example | Description |
|-------|---------|-------------|
| `/:chainNetwork/v2` | `/eth-mainnet/v2` | Node JSON-RPC + Token API + Transfers API |
| `/:chainNetwork/nft/v3/*` | `/eth-mainnet/nft/v3/getNFTsForOwner?owner=0x...` | NFT API v3 (REST) |
| `/data/v1/*` | `/data/v1/assets/tokens/by-address` | Portfolio API (not chain-specific) |
| `/prices/v1/*` | `/prices/v1/tokens/by-symbol?symbols=ETH` | Prices API (current + historical) |

See [reference](reference.md) for all endpoints, supported chains, and available methods.

## End-to-End Flow

1. **Set up a wallet** — Use an existing wallet or generate a new one. EVM: `npx @alchemy/x402 wallet generate`; Solana: `npx @alchemy/x402 wallet generate --network svm`.
2. **Fund the wallet** — Load USDC on a supported payment network (Base for EVM wallets, Solana for SVM wallets).
3. **Create an auth token** — EVM: `npx @alchemy/x402 sign --private-key ./wallet-key.txt` or `signSiwe()` in code; Solana: `npx @alchemy/x402 sign --network svm --private-key ./wallet-key.txt` or `signSiws()` in code.
4. **Send a request** — Call any gateway route with `Authorization: SIWE <token>` (EVM) or `Authorization: SIWS <token>` (Solana). For quick queries without an npm project, see the [curl-workflow](curl-workflow.md) for a lightweight curl-based alternative.
5. **Handle 402 Payment Required** — If the gateway returns 402, create an x402 payment with `npx @alchemy/x402 pay` (add `--network svm` for Solana) or `createPayment()` / `createSolanaPayment()` and retry with a `Payment-Signature` header.
6. **Receive the result** — After payment, the gateway proxies the request to Alchemy and returns the result. Subsequent requests with the same auth token do not require payment again.

## Packages

### `@alchemy/x402` — CLI + Library (recommended)

```bash
npm install @alchemy/x402
```

Provides both CLI commands and library utilities for wallet management, SIWE/SIWS authentication, and x402 payments:

| CLI command | Library function | Purpose |
|-------------|-----------------|---------|
| `npx @alchemy/x402 wallet generate` | `generateWallet()` | Create a new EVM wallet |
| `npx @alchemy/x402 wallet generate --network svm` | `generateSolanaWallet()` | Create a new Solana wallet |
| `npx @alchemy/x402 wallet import` | `getWalletAddress()` | Import / verify an EVM wallet |
| `npx @alchemy/x402 wallet import --network svm` | `getSolanaWalletAddress()` | Import / verify a Solana wallet |
| `npx @alchemy/x402 sign --private-key <key>` | `signSiwe()` | Generate a SIWE auth token (EVM) |
| `npx @alchemy/x402 sign --network svm --private-key <key>` | `signSiws()` | Generate a SIWS auth token (Solana) |
| `npx @alchemy/x402 pay` | `createPayment()` | Create an EVM x402 payment from a 402 response |
| `npx @alchemy/x402 pay --network svm` | `createSolanaPayment()` | Create a Solana x402 payment from a 402 response |
| — | `buildX402Client()` | Create an EVM x402 client for use with `@x402/fetch` or `@x402/axios` |
| — | `buildSolanaX402Client()` | Create a Solana x402 client for use with `@x402/fetch` or `@x402/axios` |

### Additional packages for app development

For building applications with automatic payment handling, also install a fetch/axios wrapper:

```bash
npm install @alchemy/x402 @x402/fetch   # or @x402/axios
```

| Package | Purpose |
|---------|---------|
| `@x402/fetch` | `wrapFetchWithPayment` — auto-handles 402 → sign → retry with `fetch` |
| `@x402/axios` | `wrapAxiosWithPayment` — auto-handles 402 → sign → retry with `axios` |
