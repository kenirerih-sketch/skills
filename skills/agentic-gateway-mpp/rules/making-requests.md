# Making Requests

The gateway supports JSON-RPC, NFT, Prices, and Portfolio APIs — all with the same auth and MPP payment flow. See [reference](reference.md) for the full list of supported endpoints, chain network slugs, and API methods.

Use the `mppx` library to handle MPP payment flows programmatically. For authentication, use `@alchemy/x402` with `domain: "mpp.alchemy.com"`.

> **Wallet type vs query chain:** Your wallet type determines which auth scheme (SIWE/SIWS) to use. The chain URL in your request is independent — you can query any supported chain with either wallet type.

## Using an EVM Wallet

```bash
npm install mppx @alchemy/x402
```

```typescript
import { signSiwe } from "@alchemy/x402";
import { Challenge, Credential } from "mppx";

// Read private key from environment — never hardcode it
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;

// Generate auth token with MPP domain
const siweToken = await signSiwe({
  privateKey,
  domain: "mpp.alchemy.com",
});

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
  const wwwAuthenticate = response.headers.get("WWW-Authenticate");
  const challenges = Challenge.parse(wwwAuthenticate);
  const challenge = challenges[0]; // Select preferred method

  // Create payment credential
  const credential = await Credential.create(challenge, { privateKey });
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

## Using a Solana Wallet

```bash
npm install mppx @alchemy/x402
```

```typescript
import { signSiws } from "@alchemy/x402";
import { Challenge, Credential } from "mppx";

// Read private key from environment — never hardcode it
const privateKey = process.env.PRIVATE_KEY as string; // base58-encoded

// Generate auth token with MPP domain
const siwsToken = await signSiws({
  privateKey,
  domain: "mpp.alchemy.com",
});

// Make a request
const response = await fetch("https://mpp.alchemy.com/solana-mainnet/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `SIWS ${siwsToken}`,
  },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "getSlot",
  }),
});

// Handle 402 Payment Required
if (response.status === 402) {
  const wwwAuthenticate = response.headers.get("WWW-Authenticate");
  const challenges = Challenge.parse(wwwAuthenticate);
  const challenge = challenges[0];

  const credential = await Credential.create(challenge, { privateKey });
  const serialized = Credential.serialize(credential);

  const retryResponse = await fetch("https://mpp.alchemy.com/solana-mainnet/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `SIWS ${siwsToken}, Payment ${serialized}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "getSlot",
    }),
  });

  const result = await retryResponse.json();
  // { id: 1, jsonrpc: "2.0", result: 123456789 }
}
```

## How It Works

The MPP payment flow:

1. Send the request with SIWE/SIWS auth (via `Authorization` or `x-token` header).
2. If **200** — return the result immediately. Response includes `X-Protocol-Version: mpp/1.0` and optionally `Payment-Receipt` headers.
3. If **402** — read the `WWW-Authenticate` header, parse the challenge(s), create a payment credential using `mppx`, and **retry** with the credential. Two approaches:
   - **Manual/curl**: `Authorization: SIWE <token>, Payment <credential>` (multi-scheme, RFC 9110)
   - **SDK**: Send auth via `x-token: SIWE <token>` and let the mppx SDK use `Authorization` for the payment credential
4. Subsequent calls with the same auth token return 200 without payment.

## Helper: Auto-Payment Wrapper

You can create a reusable wrapper that handles the 402 flow automatically. Uses the `x-token` header for auth so the mppx SDK can freely manage `Authorization` for payment credentials:

```typescript
import { signSiwe } from "@alchemy/x402";
import { Challenge, Credential } from "mppx";

function createMppFetch(privateKey: `0x${string}`, siweToken: string) {
  return async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    // Use x-token for auth to avoid conflict with mppx SDK's Authorization usage
    headers.set("x-token", `SIWE ${siweToken}`);

    const response = await fetch(input, { ...init, headers });

    if (response.status === 402) {
      const wwwAuth = response.headers.get("WWW-Authenticate");
      if (!wwwAuth) return response;

      const challenges = Challenge.parse(wwwAuth);
      const credential = await Credential.create(challenges[0], { privateKey });
      const serialized = Credential.serialize(credential);

      // mppx SDK sets Authorization with the payment credential
      headers.set("Authorization", `Payment ${serialized}`);
      return fetch(input, { ...init, headers });
    }

    return response;
  };
}

// Usage
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const token = await signSiwe({ privateKey, domain: "mpp.alchemy.com" });
const mppFetch = createMppFetch(privateKey, token);

const response = await mppFetch("https://mpp.alchemy.com/eth-mainnet/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "eth_blockNumber" }),
});
```

## REST API Endpoints (Prices, Portfolio, NFT)

For REST API endpoints like `/prices/v1/tokens/historical`, use plain `fetch` with the `Authorization` header (`SIWE <token>` or `SIWS <token>` depending on your wallet type). The auto-payment wrapper above works with all endpoint types.

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
