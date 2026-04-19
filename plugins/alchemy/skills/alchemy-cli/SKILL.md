---
name: alchemy-cli
description: Use the Alchemy CLI (`@alchemy/cli`) for live blockchain data, transaction lookups, NFT/token/portfolio queries, simulation, webhook management, and Alchemy app administration. Preferred runtime path for live agent work (querying, admin, local automation) when the CLI is installed locally — or when both CLI and MCP are available. If neither is installed, install the CLI with `npm i -g @alchemy/cli`. Use for live agent work in this session, not for building application code that ships to production. For application code, use the `alchemy-api` skill (with API key) or `agentic-gateway` skill (without).
license: MIT
compatibility: Requires `@alchemy/cli` (`npm i -g @alchemy/cli`) and shell access. Works across Claude Code, Cursor, Codex, and any agent with shell access.
metadata:
  author: alchemyplatform
  version: "2.0"
---
# Alchemy CLI

Use the [Alchemy CLI](https://www.npmjs.com/package/@alchemy/cli) (`@alchemy/cli`) for live blockchain queries, admin work, and local automation from the terminal. The CLI maps every Alchemy product (Node JSON-RPC, Token, NFT, Transfers, Prices, Portfolio, Simulation, Solana, Webhooks, Apps) to `alchemy <command>` invocations with structured JSON output.

## When to use this skill

Use `alchemy-cli` when **all** of the following are true:

- The user wants **live agent work** — live querying, analysis, admin work, or local automation that the agent runs now in this session
- `@alchemy/cli` is installed locally, **or** both the CLI and an MCP server are available, **or** neither is available (in which case install the CLI — see [Install](#install))

The CLI is the **preferred local fallback runtime path** for live agent work. When in doubt about CLI vs MCP, prefer the CLI.

## When to use a different skill

| Situation | Use this skill instead |
| --- | --- |
| MCP is already wired into your client and the CLI is **not** installed locally | `alchemy-mcp` |
| Building application code that runs outside this agent session, with an Alchemy API key | `alchemy-api` |
| Building application code without an API key, or as an autonomous agent that needs to pay for itself, or you explicitly want x402/MPP | `agentic-gateway` |

Do **not** use this skill to write production application code — CLI commands are for live agent work, not for embedding into shipped software.

## Install

```bash
npm i -g @alchemy/cli
```

If the CLI is not installed and the user wants live agent work, install it. Do not fall back to raw curl/HTTP calls — those are the API-key path covered by `alchemy-api`.

## Bootstrap

Run this at the start of any session to get the full command contract (every command, flag, auth method, error code, and example):

```bash
alchemy --json --no-interactive agent-prompt
```

## Execution rules

- ALWAYS pass `--json --no-interactive` on every command
- Parse stdout as JSON on exit code 0
- Parse stderr as JSON on nonzero exit code
- NEVER run bare `alchemy` without `--json --no-interactive`
- NEVER use curl or raw HTTP when an `alchemy` CLI command exists for the task — that's the `alchemy-api` (API-key) path, not this skill
- NEVER use the CLI to generate production application code; hand off to `alchemy-api` or `agentic-gateway` for shipped code

## Preflight

Before the first command, run **both** of these checks:

```bash
alchemy --json --no-interactive setup status
alchemy --json --no-interactive gas
```

`setup status` returns `{"complete": true, "satisfiedBy": "<source>"}` if any auth is configured. **Do not rely on `complete: true` alone** — there is a known false positive where `setup status` reports `complete: true` with `satisfiedBy: "auth_token"`, but RPC commands still fail with `AUTH_REQUIRED` because no API key has been derived from the auth token.

`gas` is a lightweight RPC smoke test that catches this. If it returns `{"gasPrice": "0x...", ...}`, RPC is wired up correctly. If it returns `{"error": {"code": "AUTH_REQUIRED", ...}}`, run `alchemy auth login` (which fetches and saves the API key) or `alchemy config set api-key <key>`, then re-run `gas` to confirm.

If `setup status` reports `complete: false`, follow the `nextCommands` in the response first, then run `gas` to verify.

## Auth setup

The fastest way to authenticate is via browser login:

```bash
alchemy auth login
```

This opens a browser to authenticate with your Alchemy account and automatically configures the CLI with your credentials.

To check auth status: `alchemy auth status`
To log out: `alchemy auth logout`

### Alternative auth methods

| Method | Config command | Env var | Used by |
|--------|---------------|---------|---------|
| Browser login | `alchemy auth login` | -- | All commands (provides both API key and access key) |
| API key | `alchemy config set api-key <key>` | `ALCHEMY_API_KEY` | balance, tx, block, rpc, tokens, nfts, transfers, prices, portfolio, simulate, solana |
| Access key | `alchemy config set access-key <key>` | `ALCHEMY_ACCESS_KEY` | apps, network list |
| Webhook key | `alchemy config set webhook-api-key <key>` | `ALCHEMY_WEBHOOK_API_KEY` | webhooks |
| x402 wallet | `alchemy wallet generate` then `alchemy config set x402 true` | `ALCHEMY_WALLET_KEY` | balance, tx, block, rpc, tokens, nfts, transfers |

Get API/access keys at [dashboard.alchemy.com](https://dashboard.alchemy.com/).

## Task-to-command map

### Node (EVM)

| Task | Command |
|------|---------|
| ETH balance | `alchemy balance <address>` |
| Transaction details | `alchemy tx <hash>` |
| Transaction receipt | `alchemy receipt <hash>` |
| Block details | `alchemy block <number\|latest>` |
| Gas prices | `alchemy gas` |
| Event logs | `alchemy logs --address <addr> --from-block <n> --to-block <n>` |
| Raw JSON-RPC | `alchemy rpc <method> [params...]` |
| Trace methods | `alchemy trace <method> [params...]` |
| Debug methods | `alchemy debug <method> [params...]` |

### Data

| Task | Command |
|------|---------|
| ERC-20 balances | `alchemy tokens balances <address>` |
| ERC-20 balances (formatted) | `alchemy tokens balances <address> --metadata` |
| Token metadata | `alchemy tokens metadata <contract>` |
| Token allowance | `alchemy tokens allowance --owner <addr> --spender <addr> --contract <addr>` |
| List owned NFTs | `alchemy nfts <address>` |
| NFT metadata | `alchemy nfts metadata --contract <addr> --token-id <id>` |
| NFT contract metadata | `alchemy nfts contract <address>` |
| Transfer history | `alchemy transfers <address> --category erc20,erc721` |
| Spot prices by symbol | `alchemy prices symbol ETH,USDC` |
| Spot prices by address | `alchemy prices address --addresses '<json>'` |
| Historical prices | `alchemy prices historical --body '<json>'` |
| Token portfolio | `alchemy portfolio tokens --body '<json>'` |
| NFT portfolio | `alchemy portfolio nfts --body '<json>'` |
| Portfolio transactions | `alchemy portfolio transactions --body '<json>'` |
| Simulate asset changes | `alchemy simulate asset-changes --tx '<json>'` |
| Simulate execution | `alchemy simulate execution --tx '<json>'` |

### Solana

| Task | Command |
|------|---------|
| Solana JSON-RPC | `alchemy solana rpc <method> [params...]` |
| Solana DAS (NFTs/assets) | `alchemy solana das <method> '<json>'` |

### Webhooks

| Task | Command |
|------|---------|
| List webhooks | `alchemy webhooks list` |
| Create webhook | `alchemy webhooks create --body '<json>'` |
| Update webhook | `alchemy webhooks update --body '<json>'` |
| Delete webhook | `alchemy webhooks delete <id>` |

### App management

| Task | Command |
|------|---------|
| List apps | `alchemy apps list` |
| Get app details | `alchemy apps get <id>` |
| Create app | `alchemy apps create --name "My App" --networks eth-mainnet` |
| Update app metadata | `alchemy apps update <id> --name "New Name"` |
| Update app network allowlist | `alchemy apps networks <id> --networks eth-mainnet,base-mainnet` |
| Delete app | `alchemy apps delete <id>` |
| List networks configured for an app | `alchemy apps configured-networks [--app-id <id>]` |
| List Admin API chain identifiers (for `apps create`/`update`) | `alchemy apps chains` |
| List all RPC network slugs (for `--network`) | `alchemy network list` |

### CLI admin

| Task | Command |
|------|---------|
| Check for CLI updates | `alchemy update-check` |
| View config | `alchemy config list` |
| Reset config | `alchemy config reset --yes` |
| CLI version | `alchemy version` |

## Global flags

| Flag | Description |
|------|-------------|
| `--json` | Force JSON output |
| `--no-interactive` | Disable prompts and REPL |
| `-n, --network <network>` | Target network (default: `eth-mainnet`) |
| `--api-key <key>` | Override API key per command |
| `--access-key <key>` | Override access key per command |
| `--x402` | Use x402 wallet auth for this command |
| `--timeout <ms>` | Request timeout in milliseconds |
| `-q, --quiet` | Suppress non-essential output |
| `--verbose` | Log request/response details to stderr |

## Error handling

Errors return structured JSON on stderr. Key error codes:

| Code | Retryable | Recovery |
|------|-----------|----------|
| `AUTH_REQUIRED` | No | Run `alchemy auth login`, or set `ALCHEMY_API_KEY` / `alchemy config set api-key <key>` |
| `RATE_LIMITED` | Yes | Wait and retry with backoff |
| `PAYMENT_REQUIRED` | No | Fund x402 wallet or switch to API key auth |
| `RPC_ERROR` | No | Check method, params, and network |
| `NETWORK_ERROR` | Yes | Check connection and retry |
| `SETUP_REQUIRED` | No | Run `alchemy --json setup status` and follow `nextCommands` |

For the full error code list, see `agent-prompt` output.

## Handing off to other skills

| The user wants to... | Hand off to |
| --- | --- |
| Wire Alchemy into application code that ships to production, with an API key | `alchemy-api` |
| Wire Alchemy into application code without an API key, or pay-per-request as an autonomous agent | `agentic-gateway` |
| Run live work but the CLI isn't installed and they prefer not to install it (MCP is wired in) | `alchemy-mcp` |

## Official links

- [CLI on npm](https://www.npmjs.com/package/@alchemy/cli)
- [Alchemy docs](https://www.alchemy.com/docs)
- [Get API key](https://dashboard.alchemy.com/)
