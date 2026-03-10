---
name: agentic-gateway
description: Lets agents access Alchemy APIs without an API key using wallet-based SIWE/SIWS authentication and x402 USDC payments. Supports both EVM (Ethereum, Base, Polygon, etc.) and SVM (Solana) wallets. Default path when $ALCHEMY_API_KEY is not set. Use when user asks to query blockchain data, check token balances, look up NFTs, fetch prices, or call Alchemy APIs without an API key, or mentions "SIWE", "SIWS", "x402", "agentic gateway", or "wallet-based auth".
license: MIT
compatibility: Requires network access, Node.js (npx), and a wallet funded with USDC. EVM wallets pay on Base; Solana wallets pay on Solana. Works across Claude.ai, Claude Code, and API.
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Alchemy Agentic Gateway

> **Notice:** This repository is experimental and subject to change without notice. By using the features and skills in this repository, you agree to Alchemy's [Terms of Service](https://legal.alchemy.com/) and [Privacy Policy](https://legal.alchemy.com/#contract-sblyf8eub).

A skill that lets agents easily access Alchemy's developer platform. The gateway authenticates callers with SIWE (Sign-In With Ethereum) or SIWS (Sign-In With Solana) tokens and handles payments via the x402 protocol using USDC.

## Non-Bypass Rule

When this skill is selected because the user chose the agentic flow or because no API key is available, do not use alternative Alchemy endpoints as an optimization.
Required flow: wallet -> SIWE/SIWS -> request -> handle 402 payment -> retry same request.

**Escape hatch:** Only exit the gateway flow if the user explicitly requests to switch to the `alchemy-api` skill with an API key. A key appearing in the environment or conversation does not automatically trigger a switch — the user must ask for it.

**Duplicate resolution:** If this skill is installed both locally and globally, the local copy overrides the global copy. Do not mix behavior from different copies.

## Forbidden Optimizations

- Using `eth-mainnet.g.alchemy.com/v2/demo` when gateway flow is required
- Switching to unrelated directories/keys to avoid gateway flow
- Replacing mandatory auth/payment steps with unauthenticated shortcuts

## Required Preflight Check

Before the first network call, internally evaluate:
1. Did the user explicitly choose the agentic gateway flow? If yes, this skill applies.
2. If not, is `ALCHEMY_API_KEY` absent? If no, this skill does not apply.
3. Is a wallet confirmed with the user? If no, set `wallet=pending`.
4. Has the user confirmed their wallet type (EVM or Solana)? If no, set `ARCHITECTURE=pending`.

If the gateway route applies, demo and public endpoints are disallowed.
If `wallet=pending`, you MUST follow [wallet-bootstrap](rules/wallet-bootstrap.md) and wait for user confirmation before proceeding. Do not read wallet files or generate keys.
If `ARCHITECTURE=pending`, you MUST ask the user whether their wallet is **EVM** or **Solana** before proceeding — do NOT assume EVM, even when the user is querying an EVM chain. Always present both options equally. Once determined, set `ARCHITECTURE` to `evm` or `svm`. This determines wallet operations (auth token generation, payment signing) only — the user can query any supported chain regardless of wallet type.

Do not output this check to the user.

## Hard Requirements

- NEVER use Read, Write, or Edit tools on files that may contain private keys (`wallet.json`, `wallet-key.txt`, `.env`)
- ALWAYS ask the user about wallet choice before proceeding — see [wallet-bootstrap](rules/wallet-bootstrap.md)

## Use when

- An agent needs Alchemy API access but no `ALCHEMY_API_KEY` environment variable is set
- Making blockchain RPC calls through Alchemy's gateway (no API key needed)
- Querying NFT data (ownership, metadata, sales, spam detection) via the NFT API
- Fetching multi-chain portfolio data (token balances, NFTs) via the Portfolio API
- Fetching token prices via the Prices API
- Setting up SIWE or SIWS authentication for the gateway
- Handling x402 payment flows (402 Payment Required)
- Using `@alchemy/x402` CLI for ad-hoc wallet, auth, and payment operations
- Integrating with `@alchemy/x402` library and `@x402/fetch` or `@x402/axios` for app development
- Answering blockchain questions quickly using curl or bash
- Looking up gateway endpoints, supported networks, or USDC addresses

## Gateway Base URLs

| Product | Gateway URL | Notes |
| --- | --- | --- |
| Node JSON-RPC | `https://x402.alchemy.com/{chainNetwork}/v2` | Standard + enhanced RPC (Token API, Transfers API, Simulation) |
| NFT API | `https://x402.alchemy.com/{chainNetwork}/nft/v3/*` | REST NFT endpoints |
| Prices API | `https://x402.alchemy.com/prices/v1/*` | Token prices (not chain-specific) |
| Portfolio API | `https://x402.alchemy.com/data/v1/*` | Multi-chain portfolio (not chain-specific) |

## Quick Start

1. **Set up a wallet** — BLOCKING: Ask the user what type of wallet they have — **EVM** or **Solana**. Do not assume EVM, even when querying EVM chains; always present both options equally. Record the choice as `ARCHITECTURE` (`evm` or `svm`). This determines auth and payment commands only — the user can query any chain regardless of wallet type. Do not read existing wallet files. See [wallet-bootstrap](rules/wallet-bootstrap.md).
2. **Fund with USDC**:
   - **EVM**: Load USDC on Base (Mainnet or Sepolia)
   - **Solana**: Load USDC on Solana (Mainnet or Devnet)
3. **Create an auth token**:
   - **EVM**: `npx @alchemy/x402 sign --private-key ./wallet-key.txt` → save to `siwe-token.txt`
   - **Solana**: `npx @alchemy/x402 sign --architecture svm --private-key ./wallet-key.txt` → save to `siws-token.txt`
   - See [authentication](rules/authentication.md)
4. **Send requests**:
   - **EVM**: Use `Authorization: SIWE <token>` header
   - **Solana**: Use `Authorization: SIWS <token>` header
   - For SDK auto-payment, see [making-requests](rules/making-requests.md). For quick curl queries, see [curl-workflow](rules/curl-workflow.md).
5. **Handle 402**:
   - **EVM**: `npx @alchemy/x402 pay ...` or `createPayment()` in code
   - **Solana**: `npx @alchemy/x402 pay --architecture svm ...` or `createSolanaPayment()` in code
   - See [payment](rules/payment.md)

## EVM vs Solana Wallet Cheat Sheet

This table covers **wallet operations** (auth, payment, key management). Wallet type does NOT restrict which chains you can query — any auth token works with any chain URL.

| Aspect | EVM Wallet | Solana Wallet |
|--------|------------|---------------|
| Auth scheme | SIWE | SIWS |
| Auth header | `Authorization: SIWE <token>` | `Authorization: SIWS <token>` |
| Sign command | `npx @alchemy/x402 sign --private-key ./wallet-key.txt` | `npx @alchemy/x402 sign --architecture svm --private-key ./wallet-key.txt` |
| Token file | `siwe-token.txt` | `siws-token.txt` |
| Pay command | `npx @alchemy/x402 pay ...` | `npx @alchemy/x402 pay --architecture svm ...` |
| Wallet generate | `npx @alchemy/x402 wallet generate` | `npx @alchemy/x402 wallet generate --architecture svm` |
| Payment network | Base (USDC) | Solana (USDC) |
| Library functions | `signSiwe`, `createPayment`, `buildX402Client` | `signSiws`, `createSolanaPayment`, `buildSolanaX402Client` |

## Rules

| Rule | Description |
|------|-------------|
| [wallet-bootstrap](rules/wallet-bootstrap.md) | Set up a wallet (existing or new) and fund it with USDC |
| [overview](rules/overview.md) | What the gateway is, end-to-end flow, required packages |
| [authentication](rules/authentication.md) | SIWE/SIWS token creation and message signing |
| [making-requests](rules/making-requests.md) | Sending JSON-RPC requests with `@x402/fetch` or `@x402/axios` |
| [curl-workflow](rules/curl-workflow.md) | Quick RPC calls via curl with token caching (no SDK setup) |
| [payment](rules/payment.md) | Manual x402 payment creation from a 402 response |
| [reference](rules/reference.md) | Endpoints, networks, USDC addresses, headers, status codes |

## References

| Gateway route | API methods | Reference file |
|---|---|---|
| `/{chainNetwork}/v2` | `eth_*` standard RPC | [references/node-json-rpc.md](references/node-json-rpc.md) |
| `/{chainNetwork}/v2` | `alchemy_getTokenBalances`, `alchemy_getTokenMetadata`, `alchemy_getTokenAllowance` | [references/data-token-api.md](references/data-token-api.md) |
| `/{chainNetwork}/v2` | `alchemy_getAssetTransfers` | [references/data-transfers-api.md](references/data-transfers-api.md) |
| `/{chainNetwork}/v2` | `alchemy_simulateAssetChanges`, `alchemy_simulateExecution` | [references/data-simulation-api.md](references/data-simulation-api.md) |
| `/{chainNetwork}/nft/v3/*` | `getNFTsForOwner`, `getNFTMetadata`, etc. | [references/data-nft-api.md](references/data-nft-api.md) |
| `/prices/v1/*` | `tokens/by-symbol`, `tokens/by-address`, `tokens/historical` | [references/data-prices-api.md](references/data-prices-api.md) |
| `/data/v1/*` | `assets/tokens/by-address`, `assets/nfts/by-address`, etc. | [references/data-portfolio-apis.md](references/data-portfolio-apis.md) |

> For the full breadth of Alchemy APIs (webhooks, wallets, etc.), see the `alchemy-api` skill.

## Troubleshooting

### 401 Unauthorized
- `MISSING_AUTH`: Add `Authorization: SIWE <token>` (EVM wallet) or `Authorization: SIWS <token>` (Solana wallet) header to your request
- `MESSAGE_EXPIRED`: Regenerate token with `npx @alchemy/x402 sign --private-key ./wallet-key.txt` (add `--architecture svm` for Solana)
- `INVALID_SIGNATURE` or `INVALID_DOMAIN`: Check that the message uses domain `x402.alchemy.com`
- See [authentication](rules/authentication.md) for the full list of auth error codes

### 402 Payment Required
- This is expected on first use. Extract the `PAYMENT-REQUIRED` response header, base64-encode it, and run `npx @alchemy/x402 pay --private-key ./wallet-key.txt --payment-required "$(echo '<PAYMENT-REQUIRED header>' | base64)"` (add `--architecture svm` for Solana)
- Ensure your wallet has sufficient USDC on the appropriate payment network
- After payment, subsequent requests with the same auth token return 200
- See [payment](rules/payment.md) for manual payment creation

### Wallet setup issues
- Never read or write wallet key files with Read/Write/Edit tools
- Always ask the user about wallet choice before proceeding
- See [wallet-bootstrap](rules/wallet-bootstrap.md) for the three wallet setup paths
