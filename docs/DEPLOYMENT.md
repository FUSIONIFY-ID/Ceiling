# Deployment

This document records the confirmed CeilingRegistry deployment and the executable payment procedures. Payment settlement remains separate and is not yet proven.

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
CEILING_REGISTRY_ADDRESS=
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
CONTRACT_ADDRESS: 0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61
DEPLOYMENT_TRANSACTION: 0x81926658e403c0db914f08a2cfb4779b5634363809701feaa982653cb94bd408
DEPLOYMENT_BLOCK: 51891875
```

Explorer:

- [CeilingRegistry](https://testnet.monadscan.com/address/0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61)
- [Deployment transaction](https://testnet.monadscan.com/tx/0x81926658e403c0db914f08a2cfb4779b5634363809701feaa982653cb94bd408)

The confirmed deployment metadata is stored in `deployments/monad-testnet.json`.

Deploy a new registry only when intentionally replacing the recorded deployment:

```bash
npm run contract:deploy
```

Run a fresh core-driven commit, outcome, and readback proof against the recorded registry:

```bash
npm run contract:smoke
```

The current proof and explorer links are recorded in [On-chain Evidence](ONCHAIN.md).

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

Before updating payment status:

- preserve the deployed registry address and deployment transaction;
- verify the registry bytecode on Monad Testnet;
- preserve each new commit and outcome transaction link;
- preserve exact/upto settlement and refund transaction links;
- verify amounts from chain data;
- never replace missing evidence with a placeholder transaction hash.
