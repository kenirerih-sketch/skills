# Making Requests

The gateway supports JSON-RPC, NFT, Prices, and Portfolio APIs — all with the same auth and MPP payment flow. See [reference](reference.md) for the full list of supported endpoints, chain network slugs, and API methods.

> **Wallet type vs query chain:** Your wallet type determines which auth scheme (SIWE) to use. The chain URL in your request is independent — you can query any supported chain.

## Recommended: `mppx/client` (Auto-Payment)

The easiest way to make requests is with `mppx/client`, which automatically handles the 402 payment flow. This is the recommended approach for most users.

```bash
npm install mppx viem
```

### Tempo (on-chain USDC)

```typescript
import { Mppx, tempo } from "mppx/client";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { base } from "viem/chains";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";

// Read private key from environment — never hardcode it
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(privateKey);

// Generate auth token with MPP domain
const message = createSiweMessage({
  address: account.address,
  chainId: base.id,
  domain: "mpp.alchemy.com",
  nonce: generateSiweNonce(),
  uri: "https://mpp.alchemy.com",
  version: "1",
  statement: "Sign in to Alchemy Gateway",
  expirationTime: new Date(Date.now() + 60 * 60 * 1000),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const signature = await walletClient.signMessage({ message });
const siweToken = `${btoa(message)}.${signature}`;

// Create mppx client with Tempo payment method
const mppx = Mppx.create({
  methods: [tempo({ account })],
});

// This fetch auto-handles 402 Payment Required
// IMPORTANT: Use x-token for SIWE auth because mppx manages the Authorization header
const res = await mppx.fetch("https://mpp.alchemy.com/eth-mainnet/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-token": `SIWE ${siweToken}`,
  },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_blockNumber",
  }),
});

const result = await res.json();
// { id: 1, jsonrpc: "2.0", result: "0x134e82c" }
```

### Stripe (credit card)

```typescript
import { Mppx, stripe } from "mppx/client";

// spt is obtained via Stripe.js + /mpp/spt endpoint (see payment.md)
const mppx = Mppx.create({
  methods: [stripe({ spt })],
});

// IMPORTANT: Use x-token for SIWE auth because mppx manages the Authorization header
const res = await mppx.fetch("https://mpp.alchemy.com/eth-mainnet/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-token": `SIWE ${siweToken}`,
  },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_blockNumber",
  }),
});
```

> **Important: `x-token` header.** When using `mppx/client`, SIWE auth must go via the `x-token` header (not `Authorization`) because `mppx` manages the `Authorization` header for payment credentials.

## How It Works

The MPP payment flow:

1. Send the request with SIWE auth (via `Authorization` or `x-token` header).
2. If **200** — return the result immediately. Response includes `X-Protocol-Version: mpp/1.0` and optionally `Payment-Receipt` headers.
3. If **402** — `mppx/client` automatically reads the `WWW-Authenticate` header, parses the challenge(s), creates a payment credential, and retries with the credential. If handling manually, see below.
4. Subsequent calls with the same auth token return 200 without payment.

## Manual Flow (Advanced)

For advanced use cases where you need direct control over the 402 flow, you can handle challenges manually using the low-level `mppx` API.

```bash
npm install mppx viem
```

```typescript
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import { Challenge, Credential } from "mppx";

// Read private key from environment — never hardcode it
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(privateKey);

// Generate auth token with MPP domain
const message = createSiweMessage({
  address: account.address,
  chainId: base.id,
  domain: "mpp.alchemy.com",
  nonce: generateSiweNonce(),
  uri: "https://mpp.alchemy.com",
  version: "1",
  statement: "Sign in to Alchemy Gateway",
  expirationTime: new Date(Date.now() + 60 * 60 * 1000),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const signature = await walletClient.signMessage({ message });
const siweToken = `${btoa(message)}.${signature}`;

// Make a request
const response = await fetch("https://mpp.alchemy.com/eth-mainnet/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `SIWE ${siweToken}`,
  },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_blockNumber",
  }),
});

// Handle 402 Payment Required
if (response.status === 402) {
  const challenges = Challenge.fromResponseList(response);

  // Select the challenge matching the user's chosen payment method:
  // - Tempo (on-chain USDC, EVM only): challenges.find(c => c.method === "tempo")
  // - Stripe (credit card):            challenges.find(c => c.method === "stripe")
  const challenge = challenges.find(c => c.method === "tempo"); // or "stripe"

  // Create payment credential
  // For Tempo: pass { privateKey } to sign a USDC payment
  // For Stripe: pass { spt } where spt is obtained via Stripe.js + /mpp/spt
  //   (see payment.md for the full Stripe.js → SPT → credential flow)
  const credential = await Credential.from(challenge, { privateKey });
  const serialized = Credential.serialize(credential);

  // Retry with payment
  const retryResponse = await fetch("https://mpp.alchemy.com/eth-mainnet/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `SIWE ${siweToken}, Payment ${serialized}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "eth_blockNumber",
    }),
  });

  const result = await retryResponse.json();
  // { id: 1, jsonrpc: "2.0", result: "0x134e82c" }
}
```

## REST API Endpoints (Prices, Portfolio, NFT)

For REST API endpoints like `/prices/v1/tokens/historical`, use `mppx.fetch` (recommended) or plain `fetch` with the `Authorization` header (`SIWE <token>`). The `mppx/client` approach works with all endpoint types.

The auth token alone is sufficient for authentication on all endpoints once payment has been established.

## Response Scenarios

### 200 — Success

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "0x134e82c"
}
```

The response includes an `X-Protocol-Version: mpp/1.0` header and optionally a `Payment-Receipt` header.

### 401 — Unauthorized

Authentication failed. See [authentication](authentication.md) for error codes.

```json
{
  "error": "Unauthorized",
  "message": "Invalid SIWE message format",
  "code": "INVALID_SIWE"
}
```

### 402 — Payment Required

The wallet has no account or credits. The response includes a `WWW-Authenticate` header with payment challenges:

```json
{
  "error": "Payment Required",
  "protocol": "mpp",
  "methods": ["tempo", "stripe"],
  "intent": "charge",
  "challenge": "Payment realm=\"MPP Payment\", method=\"tempo\", ...",
  "extensions": { "hint": "..." }
}
```

## Supported Chains and Endpoints

See [reference](reference.md) for supported chain network slugs, all available routes, and detailed API method documentation.
