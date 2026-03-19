# MPP Payment

The `mppx/client` library handles 402 Payment Required flows automatically — you don't need to manually parse challenges, create credentials, or retry requests. See [making-requests](making-requests.md) for full setup.

## Payment Methods

| Method | Description | Requirements |
|--------|-------------|-------------|
| **Tempo** | On-chain USDC payment (gasless, EVM only) | EVM wallet funded with USDC, SIWE auth |
| **Stripe** | Credit card payment via Stripe.js + SPT token | Card details, EVM wallet for auth |

The user chooses their payment method during setup (see [wallet-bootstrap](wallet-bootstrap.md)).

## How It Works

### Tempo (on-chain USDC)

```typescript
import { Mppx, tempo } from "mppx/client";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const mppx = Mppx.create({
  methods: [tempo({ account })],
});

// mppx.fetch auto-handles the 402 → challenge → credential → retry flow
const res = await mppx.fetch("https://mpp.alchemy.com/eth-mainnet/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-token": `SIWE ${siweToken}`,
  },
  body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "eth_blockNumber" }),
});
```

### Stripe (credit card)

The Stripe flow requires obtaining a SPT (Stripe Payment Token) first:

1. **Collect card details** using Stripe.js to get a Stripe payment method ID
2. **Exchange for SPT** — POST the payment method to `mpp.alchemy.com/mpp/spt`

```typescript
import { loadStripe } from "@stripe/stripe-js";

// Step 1: Collect card details via Stripe.js
const stripeJs = await loadStripe("your_stripe_publishable_key");
const { paymentMethod } = await stripeJs.createPaymentMethod({
  type: "card",
  card: cardElement,
});

// Step 2: Exchange for SPT token
const sptResponse = await fetch("https://mpp.alchemy.com/mpp/spt", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `SIWE ${siweToken}`,
  },
  body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
});
const { spt } = await sptResponse.json();
```

Then use the SPT with `mppx/client`:

```typescript
import { Mppx, stripe } from "mppx/client";

const mppx = Mppx.create({
  methods: [stripe({ spt })],
});

// mppx.fetch auto-handles the 402 flow using the SPT
const res = await mppx.fetch("https://mpp.alchemy.com/eth-mainnet/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-token": `SIWE ${siweToken}`,
  },
  body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "eth_blockNumber" }),
});
```

## Payment Details

- **Tempo**: USDC (6 decimals), gasless on-chain payment on EVM networks. EVM wallet (SIWE) required.
- **Stripe**: Card payment in USD, charged off-chain via Stripe.js → SPT → credential flow.
- **Amount**: Determined by the gateway per request.
- **Settlement**: The gateway verifies the credential and settles the payment automatically.

## Payment Receipt

After a successful payment, the gateway includes a `Payment-Receipt` header in the response:

```typescript
import { Receipt } from "mppx";

const receiptHeader = response.headers.get("Payment-Receipt");
if (receiptHeader) {
  const receipt = Receipt.deserialize(receiptHeader);
  console.log("Transaction:", receipt.reference);
}
```

## Payment Error Responses

If a payment fails, the gateway returns 402 with the original challenge:

```json
{
  "error": "Payment Required",
  "protocol": "mpp",
  "methods": ["tempo"],
  "intent": "charge",
  "challenge": "Payment realm=\"...\", method=\"...\", ..."
}
```

Common issues:
- **Insufficient USDC balance** (Tempo only) — fund the wallet with more USDC
- **Card declined** (Stripe only) — use a different card
- **Invalid SPT** (Stripe only) — the SPT may have expired; obtain a new one via `/mpp/spt`
- **Unsupported payment method** — check the `methods` array; Stripe may not be enabled on this gateway
