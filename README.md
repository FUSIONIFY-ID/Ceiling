# Ceiling

**Authorize the ceiling. Pay only for what held up.**

Ceiling is metered API billing infrastructure. It commits pricing and acceptance rules before output exists, meters only output that satisfies them, and produces a bill anyone can independently recompute.

**Live Demo:** <https://ceiling.fusionify.biz.id>

**Monad Contract:** <https://testnet.monadscan.com/address/0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61>

## Why Ceiling

Normal usage billing asks the buyer to trust how the vendor defines a unit, counts usage, treats invalid output, and calculates the final invoice.

Ceiling precommits:

- the unit definition;
- the deterministic validator;
- the failure policy;
- the unit price;
- the maximum number of units.

After processing, Ceiling publishes the output and billing metadata needed to rerun the same validator and recompute the charge.

## How It Works

1. **Commit** — canonicalize the policy, hash it, and commit its billing terms.
2. **Authorize** — authorize or pay no more than the committed ceiling.
3. **Meter** — validate records sequentially and count only accepted units.
4. **Settle** — compute the actual bill and publish the outcome.

The current fallback, **Ceiling Boomerang**, charges the full ceiling using x402 `exact`, processes the deterministic output, then refunds:

```text
unused = ceiling - actual
```

An experimental x402 `upto` path is retained under `spike/`. Its preflight passes, but this repository does not claim a successful live USDC settlement without a real transaction.

## Example

```text
Maximum: 25 units × 2,000 atomic USDC = 50,000 = 0.050000 USDC
Actual:  17 units × 2,000 atomic USDC = 34,000 = 0.034000 USDC
Unused:  50,000 - 34,000               = 16,000 = 0.016000 USDC
```

Money calculations use integer USDC atomic units and `bigint`, never floating point.

## Recomputability

The published session artifact contains the policy, output, hashes, meter result, and billing amounts. A third party can recompute:

- `policyHash`;
- `outputHash`;
- `acceptedUnits`;
- `actualAmount`;
- `unusedAmount`.

`CeilingRegistry` does **not** judge or validate output. It records committed and final metadata and enforces the arithmetic constraint:

```text
settledAmount = acceptedUnits × unitPrice
```

See [Recomputation](docs/RECOMPUTATION.md) for the exact inputs and equations.

## Architecture

```text
Buyer
  |
  | authorize ceiling
  v
x402 Payment
  |
  v
Ceiling Service
  |
  +--> Seeded Producer
  +--> Deterministic Validator
  +--> Meter
  +--> Published Artifact
  |
  v
CeilingRegistry
  |
  +--> policyHash
  +--> outputHash
  +--> acceptedUnits
  +--> settledAmount
```

The detailed module and trust-boundary description is in [Architecture](docs/ARCHITECTURE.md).

## Monad

Ceiling targets Monad Testnet, chain ID `10143`. The deployed
[`CeilingRegistry`](https://testnet.monadscan.com/address/0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61)
records session commits and outcomes on Monad, while x402 USDC payments target the same network.

The deployment, session commit, and outcome transaction are recorded in
[On-chain Evidence](docs/ONCHAIN.md).

A single Ceiling session is chain-agnostic in principle. Monad becomes relevant when many independent machine-payment sessions are committed and settled concurrently without shared mutable session state.

## Tech

- TypeScript and Node.js
- Solidity and `solc`
- Monad Testnet
- x402 v2
- USDC and Permit2
- viem
- Express

The x402 packages, including `@x402/evm`, are pinned to `2.12.0`.

## Run Locally

Node.js 20 or newer is required.

```bash
npm install
npm run check
npm run test:core
npm run contract:compile
npm run contract:deploy
npm run contract:smoke
npm run demo:core
npm run spike:preflight
```

Available payment commands:

```bash
# Existing x402 upto experiment
npm run spike:approve
npm run spike:server
npm run spike:client

# Exact-charge/refund fallback
npm run payment:exact:server
npm run payment:exact:client
```

The server and client commands require the relevant test-wallet configuration and balances. Run servers and clients in separate terminals.

## Web Demo

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000` for the product story or
`http://localhost:3000/demo` for the deterministic live session.

## Environment

Copy `.env.example` to `.env.local`, then set only the values needed for the command you are running:

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

- `PRIVATE_KEY` signs payer-side testnet requests.
- `PAY_TO_PRIVATE_KEY` is required only by the live refund path and must match `PAY_TO_ADDRESS`.
- Use dedicated test wallets only.
- Never commit `.env.local` or private keys.

## Current Status

| Area | Status |
| --- | --- |
| Core deterministic engine | PASS |
| Independent recomputation | PASS |
| Contract compile | PASS |
| CeilingRegistry deployment | PASS |
| On-chain session commit | PASS |
| On-chain outcome record | PASS |
| Interactive web demo | PASS |
| Public web deployment | PASS |
| x402 preflight | PASS |
| Live x402 settlement | WAITING FOR TEST USDC |
| Live refund | WAITING FOR PAYMENT |

Deployed registry: `0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61`.
No live USDC payment or refund is claimed.

## Repository Structure

```text
contracts/  Solidity billing registry
deployments/ Confirmed Monad deployment and session evidence
docs/       Architecture, mechanism, operations, and submission notes
payment/    x402 exact and USDC refund fallback
scripts/    Lightweight contract compile check
spike/      Original x402 upto experiment
src/core/   Policy, producer, validator, meter, and artifact logic
```

## Demo

Use the operator checklist and timed script in [Demo Guide](docs/DEMO.md).

## Limitations

- The validator is deterministic and domain-specific; it is not a universal proof of quality or semantic truth.
- The seeded producer exists to make the hackathon demonstration reproducible.
- The registry does not inspect raw output.
- External recomputation depends on the published artifact remaining available.
- Payment and deployment status must be supported by real testnet evidence.