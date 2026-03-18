# Wallet & Payment Setup

> **Skip this entirely if `ALCHEMY_API_KEY` is set.** Wallet setup is only needed for the MPP gateway flow.

Use this rule when the MPP gateway flow needs a wallet. If a wallet file (e.g. `wallet-key.txt`) already exists on disk, use it and proceed directly to authentication.

**This is the mandatory entry point for MPP gateway requests when no API key is available.** No data can be fetched until setup is complete. If the user asks a blockchain question and no wallet is configured (and no API key is set), redirect them here first. Do NOT mention the API key or suggest obtaining one — go straight to setup.

## Step 1: Choose a Payment Method (Hard Requirement)

You MUST ask the user which payment method they want to use. Present this prompt exactly:

> How would you like to pay for API requests?
>
> 1. **Tempo** — on-chain USDC payment (gasless). Requires a wallet funded with USDC.
> 2. **Stripe** — credit card payment. No wallet funding needed — just a card on file.

**Do NOT skip this prompt. Do NOT pick a payment method on behalf of the user.** Wait for their explicit choice before proceeding.

**Record the user's choice:** Set `PAYMENT_METHOD = tempo` or `PAYMENT_METHOD = stripe`.

---

## Step 2: Wallet Setup

A wallet is required for **both** payment methods — it provides the SIWE/SIWS auth token needed to authenticate with the gateway. The difference is that **Tempo** requires the wallet to be funded with USDC, while **Stripe** does not.

### If wallet files already exist on disk (e.g. `wallet-key.txt`)

Use the existing wallet and proceed directly to:
- [Step 3: Fund the Wallet](#step-3-fund-the-wallet-tempo-only) (if Tempo)
- [Step 4: Generate Auth Token](#step-4-generate-auth-token) (if Stripe)

If the wallet type (EVM or Solana) is not already known, ask the user.

### If no wallet is configured

You MUST ask the user a **single combined question** that presents all wallet options. Do not skip, assume, or infer the answer. Wait for an explicit response before taking any wallet action.

Present **all four options** in a single prompt — both EVM and Solana options MUST be included as equal choices:

> 1. **EVM — create a new wallet**
> 2. **EVM — import an existing private key**
> 3. **Solana — create a new wallet**
> 4. **Solana — import an existing private key**

**Do NOT assume EVM. Do NOT omit the Solana options.** Wallet type determines auth ONLY — it has absolutely nothing to do with which chains can be queried. A Solana wallet can query Ethereum, and an EVM wallet can query Solana.

### Anti-pattern: DO NOT do this

NEVER use the query chain to justify, suggest, or default to a wallet type. The following are **all wrong**:

- "Since we're querying Ethereum, we'll create an EVM wallet" — **WRONG**
- "You're looking up Solana data, so let's set up a Solana wallet" — **WRONG**
- Skipping the wallet type question because the query chain "implies" the answer — **WRONG**
- Presenting only EVM options without Solana (or vice versa) — **WRONG**

Do not generate a wallet, import a key, or proceed to any other step until the user answers.

**Record the user's choice:** Once the user answers, set `ARCHITECTURE = evm` or `ARCHITECTURE = svm`.

### Path A: Use an Existing Connected Wallet

If the user already has a wallet available (e.g. a private key in an environment variable or config file), proceed directly to Step 3 (Tempo) or Step 4 (Stripe).

### Path B: Import an Existing Wallet

Ask the user where their private key file is located. Extract the key into `wallet-key.txt` using a shell pipe:

```bash
# Example: extract from a .env file
grep PRIVATE_KEY /path/to/.env | cut -d '=' -f2 > wallet-key.txt

# Example: key is already the sole content of a file
cp /path/to/keyfile wallet-key.txt
```

> **Important:** Never use agent tools (Read, Write, Edit) on ANY file that may contain a private key. Always use shell pipes. Never echo or print key contents to stdout.

Verify the imported key:

#### EVM Path

```bash
npx @alchemy/x402 wallet import --private-key ./wallet-key.txt
```

#### Solana Path

```bash
npx @alchemy/x402 wallet import --architecture svm --private-key ./wallet-key.txt
```

Add the key file to `.gitignore`:

```bash
echo "wallet-key.txt" >> .gitignore
```

### Path C: Create a New Wallet

#### EVM Path

```bash
npx @alchemy/x402 wallet generate | jq -r .privateKey > wallet-key.txt
echo "wallet-key.txt" >> .gitignore
npx @alchemy/x402 wallet import --private-key ./wallet-key.txt
```

#### Solana Path

```bash
npx @alchemy/x402 wallet generate --architecture svm | jq -r .privateKey > wallet-key.txt
echo "wallet-key.txt" >> .gitignore
npx @alchemy/x402 wallet import --architecture svm --private-key ./wallet-key.txt
```

> **Important:** Never run `wallet generate` without piping to a file — it prints the private key to stdout.

---

## Step 3: Fund the Wallet (Tempo only)

**Skip this step if the user chose Stripe.** Stripe payments use a credit card — no USDC funding is needed.

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

---

## Step 4: Generate Auth Token

Generate a SIWE/SIWS auth token for the MPP gateway. This is required for **both** Tempo and Stripe.

### EVM Path

```bash
npx @alchemy/x402 sign --private-key ./wallet-key.txt --domain mpp.alchemy.com > siwe-token.txt
```

### Solana Path

```bash
npx @alchemy/x402 sign --architecture svm --private-key ./wallet-key.txt --domain mpp.alchemy.com > siws-token.txt
```

Proceed to [making-requests](making-requests.md) or [curl-workflow](curl-workflow.md).

---

## Using the Wallet in Code

For building applications, use the `@alchemy/x402` library for wallet management and `mppx` for payments. Always read the private key from an environment variable — never hardcode it in source files:

### EVM Path

```typescript
import { generateWallet, getWalletAddress } from "@alchemy/x402";

const wallet = generateWallet();
// wallet.address → "0x..."

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const address = getWalletAddress(privateKey);
```

### Solana Path

```typescript
import { generateSolanaWallet, getSolanaWalletAddress } from "@alchemy/x402";

const wallet = generateSolanaWallet();
// wallet.address → "Base58SolanaAddress"

const privateKey = process.env.PRIVATE_KEY as string; // base58-encoded
const address = getSolanaWalletAddress(privateKey);
```
