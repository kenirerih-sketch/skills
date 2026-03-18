# Gateway Overview

The Alchemy Agentic Gateway lets agents easily access Alchemy's developer platform.

**If `ALCHEMY_API_KEY` is set**, use standard Alchemy endpoints directly (e.g. `https://{chainNetwork}.g.alchemy.com/v2/$ALCHEMY_API_KEY`). No wallet, auth token, or payment setup is needed. Skip the rest of this document.

**If `ALCHEMY_API_KEY` is NOT set**, proceed directly with wallet-based authentication. Do NOT mention the API key, suggest obtaining one, or list it as an alternative — go straight to MPP wallet setup. The gateway authenticates with SIWE (EVM wallet) or SIWS (Solana wallet) and handles per-request payments via the MPP protocol using Tempo (on-chain USDC) or Stripe (card).

> **Wallet type vs query chain:** Your wallet type (EVM or Solana) determines how you authenticate and pay. It does NOT restrict which chains you can query — a SIWE or SIWS token works with any supported chain URL. NEVER suggest a wallet type based on the chain being queried (e.g. "Since we're querying Ethereum, we'll use EVM" is wrong). Always ask the user which wallet type they prefer without reference to the query chain.

## Base URL

```
https://mpp.alchemy.com
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

1. **Set up a wallet (REQUIRED — must complete before any data request)** — Ask the user to either create a new wallet or provide an existing private key. EVM: `npx @alchemy/x402 wallet generate`; Solana: `npx @alchemy/x402 wallet generate --architecture svm`. See [wallet-bootstrap](wallet-bootstrap.md).
2. **Fund the wallet** — Load USDC on a supported payment network (Base for EVM wallets, Solana for SVM wallets).
3. **Create an auth token** — EVM: `npx @alchemy/x402 sign --private-key ./wallet-key.txt --domain mpp.alchemy.com`; Solana: `npx @alchemy/x402 sign --architecture svm --private-key ./wallet-key.txt --domain mpp.alchemy.com`.
4. **Send a request** — Call any gateway route with your auth token (`Authorization: SIWE <token>` for EVM wallets, `Authorization: SIWS <token>` for Solana wallets). The chain in the URL is independent of your wallet type. For quick queries without an npm project, see the [curl-workflow](curl-workflow.md) for a lightweight curl-based alternative.
5. **Handle 402 Payment Required** — If the gateway returns 402, parse the `WWW-Authenticate` challenge header. Create a payment credential using the `mppx` library and retry with the credential appended to the `Authorization` header: `Authorization: SIWE <token>, Payment <credential>`.
6. **Receive the result** — After payment, the gateway proxies the request to Alchemy and returns the result. Subsequent requests with the same auth token do not require payment again. The response includes a `Payment-Receipt` header and `X-Protocol-Version: mpp/1.0`.

## Packages

### `mppx` — MPP Client Library (recommended)

```bash
npm install mppx
```

Provides client-side utilities for handling MPP payment challenges and creating payment credentials:

| Export | Purpose |
|--------|---------|
| `Challenge` | Parse and inspect `WWW-Authenticate` challenges |
| `Credential` | Create and serialize payment credentials |
| `Receipt` | Parse `Payment-Receipt` headers |

### `@alchemy/x402` — Wallet & Auth CLI

```bash
npm install @alchemy/x402
```

Used for wallet management and SIWE/SIWS auth token generation (shared with the x402 flow, but with `--domain mpp.alchemy.com`):

| CLI command | Purpose |
|-------------|---------|
| `npx @alchemy/x402 wallet generate` | Create a new EVM wallet |
| `npx @alchemy/x402 wallet generate --architecture svm` | Create a new Solana wallet |
| `npx @alchemy/x402 wallet import` | Import / verify an EVM wallet |
| `npx @alchemy/x402 wallet import --architecture svm` | Import / verify a Solana wallet |
| `npx @alchemy/x402 sign --private-key <key> --domain mpp.alchemy.com` | Generate a SIWE auth token (EVM) |
| `npx @alchemy/x402 sign --architecture svm --private-key <key> --domain mpp.alchemy.com` | Generate a SIWS auth token (Solana) |
