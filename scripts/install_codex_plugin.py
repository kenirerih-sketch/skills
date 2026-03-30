#!/usr/bin/env python3
"""Install the bundled Alchemy Codex plugin into a user's home-local Codex setup."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import Any


PLUGIN_NAME = "alchemy"
DEFAULT_INSTALL_POLICY = "AVAILABLE"
DEFAULT_AUTH_POLICY = "ON_INSTALL"
DEFAULT_CATEGORY = "Developer Tools"
DEFAULT_MARKETPLACE_NAME = "alchemy-skills"
DEFAULT_MARKETPLACE_DISPLAY_NAME = "Alchemy Skills"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install the bundled Alchemy Codex plugin into ~/plugins and register it."
    )
    parser.add_argument(
        "--plugin-dir",
        default=str(Path.home() / "plugins"),
        help="Parent directory where the plugin folder should be installed.",
    )
    parser.add_argument(
        "--marketplace-path",
        default=str(Path.home() / ".agents" / "plugins" / "marketplace.json"),
        help="Path to the user's Codex marketplace.json.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace an existing installed plugin directory and marketplace entry.",
    )
    return parser.parse_args()


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def load_json(path: Path) -> dict[str, Any]:
    with path.open() as handle:
        return json.load(handle)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")


def default_marketplace() -> dict[str, Any]:
    return {
        "name": DEFAULT_MARKETPLACE_NAME,
        "interface": {"displayName": DEFAULT_MARKETPLACE_DISPLAY_NAME},
        "plugins": [],
    }


def marketplace_entry() -> dict[str, Any]:
    return {
        "name": PLUGIN_NAME,
        "source": {
            "source": "local",
            "path": f"./plugins/{PLUGIN_NAME}",
        },
        "policy": {
            "installation": DEFAULT_INSTALL_POLICY,
            "authentication": DEFAULT_AUTH_POLICY,
        },
        "category": DEFAULT_CATEGORY,
    }


def install_plugin(plugin_parent: Path, force: bool) -> Path:
    source_dir = repo_root() / "plugins" / PLUGIN_NAME
    if not source_dir.is_dir():
        raise FileNotFoundError(f"Missing bundled plugin directory: {source_dir}")

    target_dir = plugin_parent.expanduser().resolve() / PLUGIN_NAME

    if target_dir.exists():
        if not force:
            raise FileExistsError(
                f"{target_dir} already exists. Re-run with --force to replace it."
            )
        shutil.rmtree(target_dir)

    target_dir.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source_dir, target_dir)
    return target_dir


def update_marketplace(marketplace_path: Path, force: bool) -> None:
    if marketplace_path.exists():
        payload = load_json(marketplace_path)
    else:
        payload = default_marketplace()

    if not isinstance(payload, dict):
        raise ValueError(f"{marketplace_path} must contain a JSON object.")

    plugins = payload.setdefault("plugins", [])
    if not isinstance(plugins, list):
        raise ValueError(f"{marketplace_path} field 'plugins' must be an array.")

    new_entry = marketplace_entry()

    for index, entry in enumerate(plugins):
        if isinstance(entry, dict) and entry.get("name") == PLUGIN_NAME:
            if not force:
                raise FileExistsError(
                    f"Marketplace entry '{PLUGIN_NAME}' already exists in {marketplace_path}. "
                    "Re-run with --force to replace it."
                )
            plugins[index] = new_entry
            break
    else:
        plugins.append(new_entry)

    payload.setdefault("name", DEFAULT_MARKETPLACE_NAME)
    interface = payload.setdefault("interface", {})
    if isinstance(interface, dict):
        interface.setdefault("displayName", DEFAULT_MARKETPLACE_DISPLAY_NAME)
    else:
        raise ValueError(f"{marketplace_path} field 'interface' must be an object.")

    write_json(marketplace_path, payload)


def main() -> None:
    args = parse_args()
    plugin_parent = Path(args.plugin_dir)
    marketplace_path = Path(args.marketplace_path).expanduser().resolve()

    installed_dir = install_plugin(plugin_parent, args.force)
    update_marketplace(marketplace_path, args.force)

    print(f"Installed plugin: {installed_dir}")
    print(f"Updated marketplace: {marketplace_path}")
    print("Restart Codex if it is already running so it reloads the marketplace.")


if __name__ == "__main__":
    main()
