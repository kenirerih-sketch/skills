# Wallet Setup

Use this rule **every time** the gateway flow needs a wallet — even if a wallet file (e.g. `wallet.json`, `wallet-key.txt`) already exists on disk. The agent must always confirm with the user which wallet to use before proceeding.

## Determine Wallet Type and Source (Hard Requirement)

You MUST ask the user the following questions before proceeding. Do not skip, assume, or infer the answers. Wait for explicit responses before taking any wallet action.

> 1. What type of wallet do you have — **EVM** (Ethereum, Base, Polygon, etc.) or **Solana**?
> 2. Do you have an existing wallet you'd like to use, or should I create a new one?

**Do NOT assume EVM.** Even if the user is querying an EVM chain (e.g. `eth-mainnet`), they may prefer a Solana wallet — wallet type determines auth and payment method only, not which chains can be queried. A user with any wallet type can query any supported chain. Always present both EVM and Solana as equal options.

Do not generate a wallet, import a key, or proceed to any other step until the user answers.

**Record the user's choice:** Once the user answers, set `ARCHITECTURE = evm` or `ARCHITECTURE = svm`. Use the matching wallet path for auth token generation, payment signing, and wallet management commands.

Based on the answer, follow one of the three paths below.

---

## Path A: Use an Existing Connected Wallet

If the user already has a wallet available (e.g. a private key in an environment variable or config file), proceed directly to [Fund the Wallet](#fund-the-wallet).

---

## Path B: Import an Existing Wallet

Ask the user where their private key file is located (e.g. a `.env` file, a keystore export, a text file). Once you have the file path, extract the key into `wallet-key.txt` using a shell pipe so it never appears on screen or in tool output:

```bash
# Example: extract from a .env file
grep PRIVATE_KEY /path/to/.env | cut -d '=' -f2 > wallet-key.txt

# Example: key is already the sole content of a file
cp /path/to/keyfile wallet-key.txt
```

> **Important:** Never use agent tools (Read, Write, Edit) on ANY file that may contain a private key — including `wallet.json`, `wallet-key.txt`, `.env` files, or keystore exports. Always use shell pipes to move keys between files. Never echo or print key contents to stdout.

Verify the imported key:

### EVM Path

```bash
npx @alchemy/x402 wallet import --private-key ./wallet-key.txt
```

Output:
```json
{ "address": "0xYourChecksummedAddress" }
```

### Solana Path

```bash
npx @alchemy/x402 wallet import --architecture svm --private-key ./wallet-key.txt
```

> **Note:** Solana private keys can be in base58 format or JSON array format (e.g. from Solana CLI's `id.json`). Both are supported.

Output:
```json
{ "address": "YourBase58SolanaAddress" }
```

Add the key file to `.gitignore`:

```bash
echo "wallet-key.txt" >> .gitignore
```

Proceed to [Fund the Wallet](#fund-the-wallet).

---

## Path C: Create a New Wallet

Generate a wallet and pipe the private key directly to a file so it never appears on screen:

### EVM Path

```bash
npx @alchemy/x402 wallet generate | jq -r .privateKey > wallet-key.txt
echo "wallet-key.txt" >> .gitignore
```

Retrieve the wallet address (safe to display):

```bash
npx @alchemy/x402 wallet import --private-key ./wallet-key.txt
```

### Solana Path

```bash
npx @alchemy/x402 wallet generate --architecture svm | jq -r .privateKey > wallet-key.txt
echo "wallet-key.txt" >> .gitignore
```

Retrieve the wallet address (safe to display):

```bash
npx @alchemy/x402 wallet import --architecture svm --private-key ./wallet-key.txt
```

> **Important:** Never run `wallet generate` without piping to a file — it prints the private key to stdout.

Proceed to [Fund the Wallet](#fund-the-wallet).

---

## Fund the Wallet

### EVM Wallets

#### Testnet (Base Sepolia)

1. Go to the [Circle USDC faucet](https://faucet.circle.com/)
2. Select **Base Sepolia**
3. Paste your wallet address
4. Request testnet USDC

The USDC will arrive at your address on Base Sepolia (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`).

#### Mainnet

Transfer USDC to your wallet address on Base Mainnet.

### Solana Wallets

#### Devnet

1. Go to the [Circle USDC faucet](https://faucet.circle.com/)
2. Select **Solana Devnet**
3. Paste your Solana wallet address
4. Request testnet USDC

#### Mainnet

Transfer USDC to your wallet address on Solana Mainnet.

## Using the Wallet in Code

For building applications, use the `@alchemy/x402` library. Always read the private key from an environment variable — never hardcode it in source files:

### EVM Path

```typescript
import { generateWallet, getWalletAddress } from "@alchemy/x402";

// Generate a new wallet (in a setup script, save privateKey to a secure location)
const wallet = generateWallet();
// wallet.address → "0x..."

// Or derive address from an existing key
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const address = getWalletAddress(privateKey);
```

### Solana Path

```typescript
import { generateSolanaWallet, getSolanaWalletAddress } from "@alchemy/x402";

// Generate a new Solana wallet (save privateKey to a secure location)
const wallet = generateSolanaWallet();
// wallet.address → "Base58SolanaAddress"

// Or derive address from an existing key
const privateKey = process.env.PRIVATE_KEY as string; // base58-encoded
const address = getSolanaWalletAddress(privateKey);
```

Use the private key for auth token generation (see [authentication](authentication.md)) and payment signing (see [making-requests](making-requests.md)).
