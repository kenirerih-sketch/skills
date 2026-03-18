# Gateway Overview

The Alchemy Agentic Gateway lets agents easily access Alchemy's developer platform.

**If `ALCHEMY_API_KEY` is set**, use standard Alchemy endpoints directly (e.g. `https://{chainNetwork}.g.alchemy.com/v2/$ALCHEMY_API_KEY`). No wallet, auth token, or payment setup is needed. Skip the rest of this document.

**If `ALCHEMY_API_KEY` is NOT set**, proceed directly with wallet-based authentication. Do NOT mention the API key, suggest obtaining one, or list it as an alternative — go straight to MPP wallet setup. The gateway authenticates with SIWE or SIWS and handles per-request payments via the MPP protocol.

## Payment Methods

MPP supports two payment methods. The user must choose one during setup (see [wallet-bootstrap](wallet-bootstrap.md)):

| Method | How it works | Wallet type | Wallet funding needed? |
|--------|-------------|-------------|----------------------|
| **Tempo** | On-chain USDC payment (gasless) | EVM only (SIWE) | Yes — wallet must hold USDC |
| **Stripe** | Credit card via Stripe.js + SPT token | EVM or Solana | No — card is charged directly |

Both methods require a wallet for SIWE/SIWS authentication. Tempo additionally requires the EVM wallet to be funded with USDC. Stripe requires obtaining a SPT (Stripe Payment Token) via Stripe.js and the `/mpp/spt` endpoint.

> **Wallet type vs query chain:** Your wallet type determines how you authenticate. It does NOT restrict which chains you can query — a SIWE or SIWS token works with any supported chain URL. NEVER suggest a wallet type based on the chain being queried.

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

### Tempo (on-chain USDC)

1. **Choose payment method** → Tempo. See [wallet-bootstrap](wallet-bootstrap.md).
2. **Set up an EVM wallet** — Create or import (Tempo requires EVM/SIWE).
3. **Fund the wallet** — Load USDC on an EVM network (e.g. Base Mainnet).
4. **Create an auth token** — `npx @alchemy/x402 sign --private-key ./wallet-key.txt --domain mpp.alchemy.com`
5. **Send a request** — Include `Authorization: SIWE <token>`.
6. **Handle 402** — Parse `WWW-Authenticate`, select the `tempo` challenge, create a credential with `mppx`, retry with `Payment <credential>`.
7. **Receive the result** — Response includes `X-Protocol-Version: mpp/1.0` and `Payment-Receipt`.

### Stripe (credit card)

1. **Choose payment method** → Stripe. See [wallet-bootstrap](wallet-bootstrap.md).
2. **Set up a wallet** — Create or import an EVM or Solana wallet (needed for auth only — no funding required).
3. **Create an auth token** — `npx @alchemy/x402 sign --private-key ./wallet-key.txt --domain mpp.alchemy.com`
4. **Obtain a SPT** — Collect card details via Stripe.js, then POST to `mpp.alchemy.com/mpp/spt` to get a Stripe Payment Token.
5. **Send a request** — Include `Authorization: SIWE <token>` (or `SIWS`).
6. **Handle 402** — Parse `WWW-Authenticate`, select the `stripe` challenge, create a credential with `mppx` using the SPT, retry with `Payment <credential>`.
7. **Receive the result** — Response includes `X-Protocol-Version: mpp/1.0` and `Payment-Receipt`.

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

### `@stripe/stripe-js` — Stripe.js (for Stripe payments)

```bash
npm install @stripe/stripe-js
```

Required for collecting card details in the Stripe payment flow. Used to create a Stripe payment method, which is then exchanged for a SPT token.

### `@alchemy/x402` — Wallet & Auth CLI

```bash
npm install @alchemy/x402
```

Used for wallet management and SIWE/SIWS auth token generation (shared with the x402 flow, but with `--domain mpp.alchemy.com`):

| CLI command | Purpose |
|-------------|---------|
| `npx @alchemy/x402 wallet generate` | Create a new EVM wallet |
| `npx @alchemy/x402 wallet generate --architecture svm` | Create a new Solana wallet (Stripe only) |
| `npx @alchemy/x402 wallet import` | Import / verify an EVM wallet |
| `npx @alchemy/x402 wallet import --architecture svm` | Import / verify a Solana wallet (Stripe only) |
| `npx @alchemy/x402 sign --private-key <key> --domain mpp.alchemy.com` | Generate a SIWE auth token (EVM) |
| `npx @alchemy/x402 sign --architecture svm --private-key <key> --domain mpp.alchemy.com` | Generate a SIWS auth token (Solana, Stripe only) |
