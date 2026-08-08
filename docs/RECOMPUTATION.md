# Recomputation

A Ceiling invoice is derived from a published session artifact rather than accepted as an opaque vendor total.

## Required Inputs

An independent party needs:

- the committed policy;
- `policyHash`;
- the published output;
- `outputHash`;
- the deterministic validator implementation;
- `acceptedUnits`;
- `unitPriceAtomic`;
- `maxUnits`;
- `settledAmount` or the published actual amount.

The implementation is split across:

- `src/core/policy.ts` — canonical policy bytes and hash;
- `src/core/validator.ts` — record acceptance;
- `src/core/meter.ts` — sequential validation and billing;
- `src/core/artifact.ts` — output hash, artifact creation, and recomputation.

## Recompute Procedure

1. Canonicalize the published policy and calculate its Keccak-256 hash.
2. Compare the result with `policyHash`.
3. Canonicalize the full published output and calculate `outputHash`.
4. Compare the result with the artifact's `outputHash`.
5. Rerun the deterministic validator in order.
6. Stop at the first invalid record.
7. Count accepted units before the cut.
8. Recompute actual and unused amounts using integer arithmetic.
9. Compare every result with the published artifact.

`recomputeSession` returns:

```text
policyHashMatches
outputHashMatches
acceptedUnitsMatches
actualAmountMatches
billingMatches
```

## Billing Constraint

The final arithmetic is:

```text
acceptedUnits × unitPriceAtomic = settledAmount
```

For the deterministic demo:

```text
17 × 2,000 atomic USDC
= 34,000 atomic USDC
= 0.034000 USDC
```

The committed maximum is:

```text
25 × 2,000 atomic USDC
= 50,000 atomic USDC
= 0.050000 USDC
```

The unused amount is:

```text
50,000 - 34,000
= 16,000 atomic USDC
= 0.016000 USDC
```

All three calculations use `bigint`. Decimal USDC strings are display formatting only.

## On-Chain Check

When an outcome is recorded, `contracts/CeilingRegistry.sol` checks the same unit arithmetic and the maximum-unit bound. The contract does not reproduce `policyHash`, run the validator, or hash the output. Those operations remain independently executable off-chain over the published artifact.

This separation keeps on-chain state small while making incorrect published arithmetic detectable.
