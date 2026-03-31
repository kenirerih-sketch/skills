# Alchemy Skills

Agent Skills for integrating [Alchemy](https://www.alchemy.com/) APIs into AI-powered applications. This repo contains three public skills plus a Codex plugin bundle derived from those source skills.

## Skills

### `skills/alchemy-codex`
Codex-facing router skill for users who know they want to build with Alchemy but have not yet chosen between a standard API key flow and the Alchemy gateway flow.

- **Auth**: Routes to the correct auth path before implementation
- **Setup**: No separate setup; delegates to the chosen Alchemy skill
- **Entry point**: [`skills/alchemy-codex/SKILL.md`](skills/alchemy-codex/SKILL.md)

### `skills/alchemy-api`
Traditional API key-based access to all Alchemy products: EVM JSON-RPC, Token API, NFT API, Prices API, Portfolio API, Webhooks, Solana, and more.

- **Auth**: API key in URL or header
- **Setup**: Create a free key at [dashboard.alchemy.com](https://dashboard.alchemy.com/)
- **Entry point**: [`skills/alchemy-api/SKILL.md`](skills/alchemy-api/SKILL.md)

### `skills/alchemy-cli`
CLI-first skill for agents with [`@alchemy/cli`](https://www.npmjs.com/package/@alchemy/cli) installed. Maps the Alchemy API surfaces to `alchemy <command>` invocations with structured JSON output.

- **Auth**: CLI manages auth internally (API key, access key, x402 wallet)
- **Setup**: `npm i -g @alchemy/cli`
- **Entry point**: [`skills/alchemy-cli/SKILL.md`](skills/alchemy-cli/SKILL.md)

### `skills/agentic-gateway`
Lets agents easily access Alchemy's developer platform. Supports three access methods: API key, x402 protocol (USDC payments), or MPP protocol (Tempo/Stripe payments). Prompts the user to choose their preferred protocol.

- **Auth**: API key, or SIWE/SIWS token + payment (x402 or MPP)
- **Protocols**: x402 (`@alchemy/x402` + `@x402/fetch`) or MPP (`mppx` + Tempo/Stripe)
- **Setup**: API key, or generate a wallet and fund it with USDC
- **Entry point**: [`skills/agentic-gateway/SKILL.md`](skills/agentic-gateway/SKILL.md)

## Which skill should I use?

| Scenario | Skill |
|---|---|
| I have `@alchemy/cli` installed | `alchemy-cli` |
| I want to use Alchemy in Codex but have not chosen an auth path yet | `alchemy-codex` |
| I have an Alchemy API key | `alchemy-api` |
| I'm building a traditional server or dApp | `alchemy-api` |
| I'm an agent that needs easy access to Alchemy's developer platform | `agentic-gateway` |
| I need API method details (params, responses) | `alchemy-api` (then cross-ref gateway URLs) |
| I need SIWE auth or x402/MPP payment setup | `agentic-gateway` |

## Installation

```bash
npx skills add alchemyplatform/skills --yes
```

Each source skill is self-contained and includes:

- `SKILL.md`
- `LICENSE.txt`
- `agents/openai.yaml` metadata for agent ecosystems that support it

## Codex Plugin

This repo also ships a Codex plugin bundle at [`plugins/alchemy`](plugins/alchemy) with marketplace metadata at [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

The plugin packages the public Alchemy skills into a single installable unit. Its bundled skills are:

- `alchemy-codex` for Codex-specific routing between Alchemy auth paths
- `alchemy-api` for API key-based integrations
- `agentic-gateway` for gateway-based access

### Install In OpenAI Codex

Clone this repo, then install the bundled plugin into your home-local Codex plugins directory:

```bash
git clone https://github.com/alchemyplatform/skills.git
cd skills
python3 scripts/install_codex_plugin.py
```

That command:

- copies [`plugins/alchemy`](plugins/alchemy) to `~/plugins/alchemy`
- creates or updates `~/.agents/plugins/marketplace.json`
- registers the plugin as `alchemy` in the local Codex marketplace

If you already have a local `alchemy` plugin and want to replace it:

```bash
python3 scripts/install_codex_plugin.py --force
```

If you prefer not to install into your home directory, you can keep the plugin repo-local and point Codex at this repo's [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

## Recommended Layout

Based on the structure used in [openai/skills](https://github.com/openai/skills), the recommended long-term layout in this repo is:

- keep reusable source skills under [`skills/`](skills)
- keep Codex-specific packaging under [`plugins/alchemy`](plugins/alchemy)
- keep marketplace metadata under [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json)

For naming, `alchemy` is the right plugin name. It is short, matches the product brand, and leaves room for the individual packaged skills to keep more specific names like `alchemy-api` and `agentic-gateway`.

The Codex-only router skill is intentionally named `alchemy-codex` to avoid ambiguity with future non-Codex packaging, including Claude-oriented distributions.

## Syncing the Plugin Bundle

When source skills change, resync the installable plugin bundle with:

```bash
python3 plugins/alchemy/scripts/sync_from_catalog.py
```

The sync script copies these source skills into the plugin bundle and removes stale generated skill directories:

- `alchemy-codex`
- `alchemy-api`
- `agentic-gateway`

To refresh an already-installed home-local Codex plugin after pulling new changes:

```bash
python3 scripts/install_codex_plugin.py --force
```

## Specification

These skills follow the [Agent Skills specification](https://agentskills.io/specification). See [spec/agent-skills-spec.md](spec/agent-skills-spec.md) for details.

## Official Links

- [Developer docs](https://www.alchemy.com/docs)
- [Get Started guide](https://www.alchemy.com/docs/get-started)
- [Create a free API key](https://dashboard.alchemy.com/)

## License

MIT
