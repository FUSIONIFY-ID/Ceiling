# Architecture

## Design Goals

- Deterministic billing from explicit records and integer arithmetic.
- A pricing and acceptance policy committed before output exists.
- A published outcome that an independent party can recompute.
- Minimal on-chain state.
- No raw-output inspection inside Solidity.

## Components

### Policy

`src/core/policy.ts` defines the versioned policy, recursively sorts object keys for canonical serialization, validates billing limits, and calculates `keccak256(canonicalPolicy)`.

The policy includes the unit definition, schema, failure policy, atomic unit price, and `maxUnits`. Including `maxUnits` prevents the billing ceiling from being changed after the policy is accepted.

### Producer

`src/core/producer.ts` generates deterministic records from a seed. The demonstration inserts a known invalid record at unit 18 so repeated runs show the same cut point and bill without calling an external AI service.

### Validator

`src/core/validator.ts` accepts an object only when:

- `name` is a non-empty string;
- `score` is a finite number.

Every rejection has an explicit machine-readable reason. The validator contains no model call or subjective score.

### Meter

`src/core/meter.ts` validates records in order. Under `cut-on-first-invalid`, the first rejected record is not billed and all subsequent records are outside the billable stream. All payment arithmetic uses `bigint` and atomic units.

### Artifact

`src/core/artifact.ts` hashes the canonical published output and creates the session artifact. `recomputeSession` independently re-hashes the policy and output, reruns the meter, and compares the resulting units and amounts with the published values.

### Exact Payment

`payment/exact/server.ts` exposes the Ceiling Boomerang fallback as an x402 `exact` resource. It charges the ceiling through the configured facilitator. `payment/exact/client.ts` checks the payer's USDC balance before attempting a live request and reports `PAYMENT_STATUS=BLOCKED_NO_TEST_USDC` when funding is insufficient.

### Refund

`payment/refund/refund.ts` transfers the unused USDC from the receiving wallet back to the payer after a successful exact settlement. The refund signer is separate from the payer signer and must correspond to `PAY_TO_ADDRESS`.

### Upto Spike

`spike/` retains the original x402 `upto` experiment: preflight, Permit2 approval, resource server, and payer client. It remains available for testing after the payer receives Monad Testnet USDC.

### CeilingRegistry

`contracts/CeilingRegistry.sol` stores the precommitted billing terms and final outcome metadata. It is a registry, not an escrow and not an output validator.

## Session Lifecycle

```text
POLICY CREATED
      |
POLICY HASHED
      |
SESSION COMMITTED
      |
PAYMENT AUTHORIZED
      |
OUTPUT PRODUCED
      |
RECORDS VALIDATED
      |
STREAM CUT IF INVALID
      |
OUTPUT HASHED
      |
BILL COMPUTED
      |
SETTLEMENT / REFUND
      |
OUTCOME RECORDED
      |
THIRD PARTY RECOMPUTES
```

The current local demo runs the deterministic stages through recomputation. Live payment, refund, and contract recording require testnet funding and deployment evidence.

## Trust Boundary

When the policy and output artifact are published, the buyer does not need to trust the seller's final arithmetic: the validator and meter can be rerun over the same bytes.

This does not remove every trust assumption:

- The seller operates the producer.
- The seller controls when processing starts and may stop operating the service.
- The buyer must inspect and accept the validator and unit definition before authorization.
- The validator proves compliance with its declared rules, not semantic truth.
- Published-output availability is required for external recomputation.

Ceiling therefore provides precommitted, deterministic billing evidence. It does not claim decentralized production or cryptographic proof of output quality.

## Smart Contract Role

`CeilingRegistry` enforces:

- each `sessionId` can be committed once;
- a session must exist before an outcome is recorded;
- only the session creator can record its outcome;
- an outcome can be recorded once;
- `acceptedUnits <= maxUnits`;
- `settledAmount == acceptedUnits * unitPrice`.

It stores `policyHash`, `outputHash`, unit counts, and settlement amount. It does not receive raw output, execute the validator, custody payment, or initiate a refund.

## Money Arithmetic

Monad Testnet USDC has six decimals. Values are represented as integer atomic units:

```text
1 USDC = 1,000,000 atomic units
```

The engine parses `unitPriceAtomic` into `bigint`, then computes:

```text
ceilingAmount = bigint(maxUnits) × unitPriceAtomic
actualAmount  = bigint(acceptedUnits) × unitPriceAtomic
unusedAmount  = ceilingAmount - actualAmount
```

Floating-point values are not used for billing.
