# Alchemy Skills

Agent Skills for integrating [Alchemy](https://www.alchemy.com/) APIs into AI-powered applications. Built on the [Agent Skills](https://agentskills.io/specification) specification.

## What are Agent Skills?

Skills are modular, self-contained packages that extend AI agents with specialized knowledge. Each skill follows a progressive disclosure pattern:

1. **Metadata** (~100 tokens) — `name` and `description` loaded at startup for all skills
2. **Instructions** (<5000 tokens) — Full `SKILL.md` body loaded when the skill is activated
3. **References** (on demand) — Detailed docs in `references/` loaded only when needed

## Skills

| Skill | Description |
| --- | --- |
| [alchemy-overview](skills/alchemy-overview/) | Quick-start guide, base URLs, auth, and endpoint selector for all Alchemy products |
| [node-apis](skills/node-apis/) | Core JSON-RPC and WebSocket APIs for EVM chains |
| [data-apis](skills/data-apis/) | Token balances, NFT data, transfers, prices, portfolio, and simulation APIs |
| [webhooks](skills/webhooks/) | Push-based blockchain event delivery via Notify API |
| [wallets](skills/wallets/) | Smart wallet tooling, Account Kit, bundler, and gas manager |
| [solana](skills/solana/) | Solana JSON-RPC, DAS (Digital Asset Standard), and wallet integration |
| [yellowstone-grpc](skills/yellowstone-grpc/) | High-throughput Solana streaming via Yellowstone gRPC |
| [operational](skills/operational/) | Auth, rate limits, monitoring, alerting, and production readiness |
| [recipes](skills/recipes/) | End-to-end workflows combining multiple Alchemy APIs |
| [rollups](skills/rollups/) | Overview of Alchemy Rollups for custom L2/L3 chains |
| [ecosystem](skills/ecosystem/) | Open-source libraries (viem, ethers, wagmi, Hardhat, Foundry, etc.) |

## Getting Started

1. Get an API key at [dashboard.alchemy.com](https://dashboard.alchemy.com/)
2. Start with the [alchemy-overview](skills/alchemy-overview/) skill for base URLs and quickstart examples
3. Dive into specific skills for detailed API guidance

## Specification

These skills follow the [Agent Skills specification](https://agentskills.io/specification). See [spec/agent-skills-spec.md](spec/agent-skills-spec.md) for details.

## License

See individual skill directories for license information.
