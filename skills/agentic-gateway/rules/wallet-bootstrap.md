# Wallet Setup

Use this rule when the agent does not yet have access to an Ethereum wallet for signing.

## Determine Wallet Source

Ask the user:

> Do you have an existing Ethereum wallet you'd like to use, or should I create a new one?

Based on the answer, follow one of the three paths below.

---

## Path A: Use an Existing Connected Wallet

If the user already has a wallet available (e.g. a private key in an environment variable or config file), proceed directly to [Fund the Wallet](#fund-the-wallet).

---

## Path B: Import an Existing Wallet

Save the user's private key to a file and verify it:

```bash
echo "0x<user_private_key>" > wallet-key.txt
echo "wallet-key.txt" >> .gitignore

npx @alchemy/x402 wallet import --private-key ./wallet-key.txt
```

Output:

```json
{ "address": "0xYourChecksummedAddress" }
```

Proceed to [Fund the Wallet](#fund-the-wallet).

---

## Path C: Create a New Wallet

```bash
npx @alchemy/x402 wallet generate
```

Output:

```json
{ "privateKey": "0x...", "address": "0xYourChecksummedAddress" }
```

Save the private key to a file for use with CLI commands:

```bash
npx @alchemy/x402 wallet generate | jq -r .privateKey > wallet-key.txt
echo "wallet-key.txt" >> .gitignore
```

> **Note:** Show the user their wallet address so they can fund it. Read it with `npx @alchemy/x402 wallet import --private-key ./wallet-key.txt`.

Proceed to [Fund the Wallet](#fund-the-wallet).

---

## Fund the Wallet

### Testnet (Base Sepolia)

1. Go to the [Circle USDC faucet](https://faucet.circle.com/)
2. Select **Base Sepolia**
3. Paste your wallet address
4. Request testnet USDC

The USDC will arrive at your address on Base Sepolia (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`).

### Mainnet

Transfer USDC to your wallet address on Base Mainnet.

## Using the Wallet in Code

For building applications, use the `@alchemy/x402` library:

```typescript
import { generateWallet, getWalletAddress } from "@alchemy/x402";

// Generate a new wallet
const wallet = generateWallet();
// { privateKey: "0x...", address: "0x..." }

// Or derive address from an existing key
const address = getWalletAddress("0x<your_private_key>");
```

Use the private key for SIWE token generation (see [authentication](authentication.md)) and payment signing (see [making-requests](making-requests.md)).
