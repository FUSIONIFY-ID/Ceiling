# Deployment

This document records the repository's current Monad Testnet configuration and executable payment procedures. It is not evidence that the registry or a payment has been deployed or settled.

## Network

```text
Network:       Monad Testnet
Chain ID:      10143
CAIP-2:        eip155:10143
RPC:           <https://testnet-rpc.monad.xyz>
USDC:          0x534b2f3A21130d7a60830c2Df862319e593943A3
Permit2:       0x000000000022D473030F116dDEE9F6B43aC78BA3
Upto proxy:    0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002
Facilitator:   <https://x402-facilitator.molandak.org>
```

## Environment Preparation

Node.js 20 or newer is required.

```bash
npm install
```

Copy `.env.example` to `.env.local`. Keep every private key local:

```env
MONAD_RPC_URL=
X402_FACILITATOR_URL=
MONAD_USDC_ADDRESS=
X402_UPTO_PROXY=
PAY_TO_ADDRESS=
PRIVATE_KEY=
PAY_TO_PRIVATE_KEY=
```

`PRIVATE_KEY` belongs to the payer test wallet. `PAY_TO_PRIVATE_KEY` belongs to the receiving test wallet and is only needed to execute the separate refund transaction. The derived refund signer must match `PAY_TO_ADDRESS`.

## Contract

Compile:

```bash
npm run contract:compile
```

Current deployment status:

```text
CONTRACT_ADDRESS: not deployed yet
DEPLOYMENT_TRANSACTION: not available
```

No deployment script is currently included. Add one only when deployment is explicitly scheduled, then record the real address and Monad explorer transaction.

## Payment Prerequisites

The payer needs:

- Monad Testnet MON for approval gas where applicable;
- at least `0.050000` Monad Testnet USDC for the deterministic example.

The pay-to wallet needs:

- control of `PAY_TO_ADDRESS`;
- Monad Testnet MON for the refund transaction;
- the received exact payment before the refund can execute.

Use dedicated test wallets. Never use a primary wallet private key.

## Upto Experiment

Verify facilitator, network, package version, and contract bytecode:

```bash
npm run spike:preflight
```

Check balance and grant the token's one-time allowance to canonical Permit2:

```bash
npm run spike:approve
```

Start the resource server:

```bash
npm run spike:server
```

In a separate terminal:

```bash
npm run spike:client
```

The approval transaction targets the USDC contract and approves canonical Permit2. The signed x402 `upto` authorization binds the canonical upto proxy as spender. Do not report success unless the client prints a real settlement hash and it is visible on Monad Testnet.

## Exact and Refund Fallback

Start the exact-payment resource server:

```bash
npm run payment:exact:server
```

In a separate terminal:

```bash
npm run payment:exact:client
```

The client checks for at least 50,000 atomic USDC before signing. With insufficient funding it exits honestly with:

```text
PAYMENT_STATUS=BLOCKED_NO_TEST_USDC
```

After a successful exact settlement, the resource server uses the payer address returned by the facilitator and sends `unusedAmount` from the pay-to wallet. The payment and refund are separate transactions; preserve both hashes as evidence.

## Evidence Checklist

Before updating repository status:

- record the deployed registry address, if deployed;
- verify the registry bytecode on Monad Testnet;
- preserve commit and outcome transaction links;
- preserve exact/upto settlement and refund transaction links;
- verify amounts from chain data;
- never replace missing evidence with a placeholder transaction hash.
