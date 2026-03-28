# Alchemy Plugin

Installable Codex plugin for Alchemy's public developer-platform skills.

## Install

From the repo root:

```bash
python3 scripts/install_codex_plugin.py
```

This installs the plugin to `~/plugins/alchemy` and registers it in `~/.agents/plugins/marketplace.json`.

If you need to replace an existing installation:

```bash
python3 scripts/install_codex_plugin.py --force
```

## Layout

Keep the source-of-truth skills in [`skills/`](../../skills) and keep the installable Codex bundle in [`plugins/alchemy`](.).

That split matches how `openai/skills` treats skills as the primary public artifact while still letting this repo ship a Codex-specific packaging layer.

## Included Skills

- `alchemy-codex` routes the user to the right Alchemy auth flow before implementation starts.
- `alchemy-api` covers standard API key-based access to Alchemy RPC, Data APIs, Webhooks, Solana, Wallets, and related integrations.
- `agentic-gateway` covers the Alchemy gateway flow for API key, x402, or MPP-based access.

## Naming

- Plugin name: `alchemy`
- Codex-only router skill name: `alchemy-codex`

This keeps the installable plugin broad while making the router skill explicitly Codex-specific.

## Why this plugin exists

The public `skills/` repo already contains reusable Alchemy skills, but not an installable Codex plugin package. This plugin bundles those public skills into a single installable unit and adds a lightweight router skill so users can start from a single `alchemy-codex` entry point.

## Maintenance

Edit the source skills first:

- [`skills/alchemy-codex`](../../skills/alchemy-codex)
- [`skills/alchemy-api`](../../skills/alchemy-api)
- [`skills/agentic-gateway`](../../skills/agentic-gateway)

Then resync the plugin bundle:

```bash
python3 plugins/alchemy/scripts/sync_from_catalog.py
```

Do not edit the bundled copies in `plugins/alchemy/skills/*` by hand unless you are intentionally changing generated output or the sync process itself.
