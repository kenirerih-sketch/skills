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

## Included skills

The plugin bundles all four Alchemy skills from the repo. Each skill self-routes based on its `When to use this skill` and `When to use a different skill` sections — there is no separate router skill.

- **`alchemy-cli`** — Live agent work via the local `@alchemy/cli` (preferred local fallback).
- **`alchemy-mcp`** — Live agent work via the hosted MCP server (`https://mcp.alchemy.com/mcp`) when the CLI is not installed.
- **`alchemy-api`** — App code with a standard API key (preferred app-integration path).
- **`agentic-gateway`** — App code without an API key, using x402 or MPP (specialized).

## Naming

- Plugin name: `alchemy`

## Why this plugin exists

The public `skills/` repo already contains reusable Alchemy skills, but not an installable Codex plugin package. This plugin bundles those public skills into a single installable unit so Codex users can install all of them at once.

## Maintenance

Edit the source skills first:

- [`skills/alchemy-cli`](../../skills/alchemy-cli)
- [`skills/alchemy-mcp`](../../skills/alchemy-mcp)
- [`skills/alchemy-api`](../../skills/alchemy-api)
- [`skills/agentic-gateway`](../../skills/agentic-gateway)

Then resync the plugin bundle:

```bash
python3 plugins/alchemy/scripts/sync_from_catalog.py
```

Do not edit the bundled copies in `plugins/alchemy/skills/*` by hand unless you are intentionally changing generated output or the sync process itself.
