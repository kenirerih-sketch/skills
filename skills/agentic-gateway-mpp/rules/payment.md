# Manual MPP Payment

When the gateway returns **402**, you must create an MPP payment credential and retry the request. The 402 response includes a `WWW-Authenticate` header containing one or more payment challenges. The payment method depends on your wallet type (EVM or Solana) and the available payment methods (Tempo for on-chain USDC, Stripe for card payments).

## MPP Payment Flow

1. Send a request with your auth token
2. Gateway returns 402 with `WWW-Authenticate` header containing challenges
3. Parse the challenge and create a payment credential using the `mppx` library
4. Retry the request with the credential in the `Authorization` header

### 402 Response Structure

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

The `WWW-Authenticate` response header contains the serialized challenge(s). The JSON body's `methods` array tells you which payment methods are available.

### Payment Methods

| Method | Description | Network |
|--------|-------------|---------|
| **Tempo** | On-chain USDC payment (gasless) | Base (EVM) or Solana (SVM) |
| **Stripe** | Card payment (if enabled) | Off-chain |

## Library: Create a Payment Credential in Code

Use the `mppx` library to parse challenges and create payment credentials:

```bash
npm install mppx
```

### Parsing the Challenge

```typescript
import { Challenge, Credential } from "mppx";

// Extract the WWW-Authenticate header from the 402 response
const wwwAuthenticate = response.headers.get("WWW-Authenticate");

// Parse the challenge(s) — may contain multiple (e.g. tempo + stripe)
const challenges = Challenge.parse(wwwAuthenticate);

// Select a challenge by method (e.g. "tempo" for on-chain payment)
const tempoChallenge = challenges.find(c => c.method === "tempo");
```

### Creating and Sending a Credential

```typescript
import { Credential } from "mppx";

// Create a credential from the challenge (implementation depends on payment method)
const credential = await Credential.create(tempoChallenge, {
  // For Tempo: sign the payment authorization with your wallet
  privateKey: process.env.PRIVATE_KEY,
});

// Serialize the credential for the Authorization header
const serializedCredential = Credential.serialize(credential);

// Retry the request with the payment credential appended to auth
const retryResponse = await fetch("https://mpp.alchemy.com/{chainNetwork}/v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `SIWE ${token}, Payment ${serializedCredential}`,
  },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_blockNumber",
  }),
});
```

## CLI: Handle 402 with curl

For curl workflows, extract the `WWW-Authenticate` header and use `mppx` programmatically. A minimal Node.js script can bridge the gap:

### Full 402 Handling with curl (EVM Wallet)

```bash
TOKEN=$(cat siwe-token.txt)
CHAIN="eth-mainnet"  # Replace with any supported chain slug

# Save response headers and capture HTTP status code
HTTP_CODE=$(curl -s -o response.json -D headers.txt -w "%{http_code}" -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: SIWE $TOKEN" \
  -d '{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber"}')

if [ "$HTTP_CODE" = "402" ]; then
  # Extract the WWW-Authenticate header value
  WWW_AUTH=$(grep -i 'www-authenticate:' headers.txt | sed 's/^[^:]*: //' | tr -d '\r')

  # Create payment credential using mppx (Node.js one-liner)
  CREDENTIAL=$(node -e "
    const { Challenge, Credential } = require('mppx');
    const fs = require('fs');
    const challenge = Challenge.parse(process.argv[1])[0];
    const privateKey = fs.readFileSync('./wallet-key.txt', 'utf8').trim();
    Credential.create(challenge, { privateKey }).then(c => {
      process.stdout.write(Credential.serialize(c));
    });
  " "$WWW_AUTH")

  # Retry with payment credential
  curl -s -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: SIWE $TOKEN, Payment $CREDENTIAL" \
    -d '{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber"}'
else
  cat response.json
fi
```

### Full 402 Handling with curl (Solana Wallet)

```bash
TOKEN=$(cat siws-token.txt)
CHAIN="solana-mainnet"  # Replace with any supported chain slug

# Save response headers and capture HTTP status code
HTTP_CODE=$(curl -s -o response.json -D headers.txt -w "%{http_code}" -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: SIWS $TOKEN" \
  -d '{"id":1,"jsonrpc":"2.0","method":"getSlot"}')

if [ "$HTTP_CODE" = "402" ]; then
  # Extract the WWW-Authenticate header value
  WWW_AUTH=$(grep -i 'www-authenticate:' headers.txt | sed 's/^[^:]*: //' | tr -d '\r')

  # Create payment credential using mppx (Node.js one-liner)
  CREDENTIAL=$(node -e "
    const { Challenge, Credential } = require('mppx');
    const fs = require('fs');
    const challenge = Challenge.parse(process.argv[1])[0];
    const privateKey = fs.readFileSync('./wallet-key.txt', 'utf8').trim();
    Credential.create(challenge, { privateKey }).then(c => {
      process.stdout.write(Credential.serialize(c));
    });
  " "$WWW_AUTH")

  # Retry with payment credential
  curl -s -X POST "https://mpp.alchemy.com/$CHAIN/v2" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: SIWS $TOKEN, Payment $CREDENTIAL" \
    -d '{"id":1,"jsonrpc":"2.0","method":"getSlot"}'
else
  cat response.json
fi
```

## Payment Details

- **Asset** (Tempo): USDC (6 decimals)
- **Scheme**: MPP charge intent
  - **Tempo/EVM**: On-chain USDC payment on Base (gasless)
  - **Tempo/Solana**: On-chain USDC payment on Solana
  - **Stripe**: Card payment (if enabled by the gateway)
- **Amount**: Specified in the 402 challenge (USD amount)
- **Settlement**: The gateway verifies the credential and settles the payment

## Payment Receipt

After a successful payment, the gateway includes a `Payment-Receipt` header in the response. You can parse this with the `mppx` library:

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
- **Insufficient USDC balance** (for Tempo payments)
- **Invalid or expired challenge** — request a fresh challenge by retrying without the payment credential
- **Unsupported payment method** — check the `methods` array for available options
