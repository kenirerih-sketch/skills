#!/usr/bin/env python3
"""Sync the installable Alchemy plugin bundle from the source skill catalog."""

from __future__ import annotations

import shutil
from pathlib import Path


SKILL_NAMES = (
    "alchemy-cli",
    "alchemy-mcp",
    "alchemy-api",
    "agentic-gateway",
)


def main() -> None:
    plugin_root = Path(__file__).resolve().parents[1]
    repo_root = plugin_root.parents[1]
    catalog_root = repo_root / "skills"
    plugin_skills_root = plugin_root / "skills"

    plugin_skills_root.mkdir(parents=True, exist_ok=True)

    for existing_dir in plugin_skills_root.iterdir():
        if existing_dir.is_dir() and existing_dir.name not in SKILL_NAMES:
            shutil.rmtree(existing_dir)
            print(f"Removed stale skill {existing_dir.name}")

    for skill_name in SKILL_NAMES:
        source_dir = catalog_root / skill_name
        target_dir = plugin_skills_root / skill_name

        if not source_dir.is_dir():
            raise FileNotFoundError(f"Missing source skill directory: {source_dir}")

        if target_dir.exists():
            shutil.rmtree(target_dir)

        shutil.copytree(source_dir, target_dir)
        print(f"Synced {skill_name}")


if __name__ == "__main__":
    main()
