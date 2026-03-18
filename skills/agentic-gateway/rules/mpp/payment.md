# MPP Payment

When the gateway returns **402**, you must create an MPP payment credential and retry the request. The 402 response includes a `WWW-Authenticate` header containing one or more payment challenges — one per available payment method.

## Payment Methods

| Method | Description | Requirements |
|--------|-------------|-------------|
| **Tempo** | On-chain USDC payment (gasless) | Wallet funded with USDC |
| **Stripe** | Credit card payment | Card details (no USDC needed) |

The 402 response body's `methods` array tells you which methods are available. **Always use the method the user chose during setup** (see [wallet-bootstrap](wallet-bootstrap.md)). If the user chose Tempo, select the `tempo` challenge. If they chose Stripe, select the `stripe` challenge.

## MPP Payment Flow

1. Send a request with your auth token
2. Gateway returns 402 with `WWW-Authenticate` header containing challenges
3. Parse the challenges and select the one matching the user's chosen payment method
4. Create a payment credential using the `mppx` library
5. Retry the request with the credential in the `Authorization` header

### 402 Response Structure

```json
{
  "error": "Payment Required",
  "protocol": "mpp",
  "methods": ["tempo", "stripe"],
  "intent": "charge",
  "challenge": "Payment realm=\"MPP Payment\", method=\"tempo\", ..., Payment realm=\"MPP Payment\", method=\"stripe\", ...",
  "extensions": { "hint": "..." }
}
```

The `WWW-Authenticate` response header contains the serialized challenge(s). When both methods are available, the header contains multiple comma-separated challenges.

---

## Tempo Payment (on-chain USDC)

Tempo payments use on-chain USDC. The wallet must be funded before making requests.

### In Code

```typescript
import { Challenge, Credential } from "mppx";

// Extract the WWW-Authenticate header from the 402 response
const wwwAuthenticate = response.headers.get("WWW-Authenticate");
const challenges = Challenge.parse(wwwAuthenticate);

// Select the Tempo challenge
const tempoChallenge = challenges.find(c => c.method === "tempo");

// Create a credential — signs a USDC payment authorization with your wallet
const credential = await Credential.create(tempoChallenge, {
  privateKey: process.env.PRIVATE_KEY,
});

const serialized = Credential.serialize(credential);

// Retry with the payment credential
const retryResponse = await fetch("https://mpp.alchemy.com/{chainNetwork}/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `SIWE ${token}, Payment ${serialized}`,
  },
  body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "eth_blockNumber" }),
});
```

### With curl

```bash
TOKEN=$(cat siwe-token.txt)
CHAIN="eth-mainnet"

HTTP_CODE=$(curl -s -o response.json -D headers.txt -w "%{http_code}" -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: SIWE $TOKEN" \
  -d '{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber"}')

if [ "$HTTP_CODE" = "402" ]; then
  WWW_AUTH=$(grep -i 'www-authenticate:' headers.txt | sed 's/^[^:]*: //' | tr -d '\r')

  # Create Tempo payment credential
  CREDENTIAL=$(node -e "
    const { Challenge, Credential } = require('mppx');
    const fs = require('fs');
    const challenges = Challenge.parse(process.argv[1]);
    const tempo = challenges.find(c => c.method === 'tempo');
    const privateKey = fs.readFileSync('./wallet-key.txt', 'utf8').trim();
    Credential.create(tempo, { privateKey }).then(c => {
      process.stdout.write(Credential.serialize(c));
    });
  " "$WWW_AUTH")

  curl -s -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: SIWE $TOKEN, Payment $CREDENTIAL" \
    -d '{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber"}'
else
  cat response.json
fi
```

---

## Stripe Payment (credit card)

Stripe payments charge a credit card. No USDC funding is needed — the wallet is only used for SIWE/SIWS authentication.

### In Code

```typescript
import { Challenge, Credential } from "mppx";

const wwwAuthenticate = response.headers.get("WWW-Authenticate");
const challenges = Challenge.parse(wwwAuthenticate);

// Select the Stripe challenge
const stripeChallenge = challenges.find(c => c.method === "stripe");

// Create a credential — provides card payment details
const credential = await Credential.create(stripeChallenge, {
  // Stripe handles card collection — the mppx library manages the flow
});

const serialized = Credential.serialize(credential);

// Retry with the payment credential
const retryResponse = await fetch("https://mpp.alchemy.com/{chainNetwork}/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `SIWE ${token}, Payment ${serialized}`,
  },
  body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "eth_blockNumber" }),
});
```

### With curl

```bash
TOKEN=$(cat siwe-token.txt)
CHAIN="eth-mainnet"

HTTP_CODE=$(curl -s -o response.json -D headers.txt -w "%{http_code}" -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: SIWE $TOKEN" \
  -d '{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber"}')

if [ "$HTTP_CODE" = "402" ]; then
  WWW_AUTH=$(grep -i 'www-authenticate:' headers.txt | sed 's/^[^:]*: //' | tr -d '\r')

  # Create Stripe payment credential
  CREDENTIAL=$(node -e "
    const { Challenge, Credential } = require('mppx');
    const challenges = Challenge.parse(process.argv[1]);
    const stripe = challenges.find(c => c.method === 'stripe');
    Credential.create(stripe, {}).then(c => {
      process.stdout.write(Credential.serialize(c));
    });
  " "$WWW_AUTH")

  curl -s -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: SIWE $TOKEN, Payment $CREDENTIAL" \
    -d '{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber"}'
else
  cat response.json
fi
```

---

## Payment Details

- **Tempo**: USDC (6 decimals), gasless on-chain payment on Base (EVM) or Solana (SVM)
- **Stripe**: Card payment in USD (2 decimals), charged off-chain
- **Amount**: Specified in the 402 challenge
- **Settlement**: The gateway verifies the credential and settles the payment

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
- **Invalid or expired challenge** — request a fresh challenge by retrying without the payment credential
- **Unsupported payment method** — check the `methods` array; Stripe may not be enabled on this gateway
