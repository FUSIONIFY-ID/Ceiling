# Mechanism

> The problem isn't usage billing. It's trusting the meter.

Ceiling makes the meter inspectable. The unit, validator, failure policy, price, and maximum count are fixed before output exists. The output is then published so the same bill can be independently reproduced.

## .001 COMMIT

The policy defines:

- one unit: one canonical JSON record;
- required fields and their types;
- `cut-on-first-invalid`;
- `unitPriceAtomic`;
- `maxUnits`.

Canonical serialization and `keccak256` produce `policyHash`. Committing that hash before generation prevents the billing rules from being silently changed after seeing the output.

`maxUnits` is part of the policy so a seller cannot split one logical response into unlimited billable units. It creates the arithmetic ceiling:

```text
ceilingAmount = maxUnits × unitPriceAtomic
```

## .002 AUTHORIZE

The buyer authorizes or pays the committed ceiling. In the deterministic example:

```text
25 maximum units × 2,000 atomic USDC = 50,000 atomic USDC
```

No valid execution can bill more than this amount.

## .003 METER

Records are validated sequentially:

```text
record 01 — valid
...
record 17 — valid
record 18 — invalid: score_not_finite
STREAM CUT
```

The invalid record is not charged. Records after the cut are not charged. Only 17 accepted units count:

```text
17 × 2,000 = 34,000 atomic USDC
```

The validator is deterministic and domain-specific. It checks the declared record rules; it does not make a subjective judgment about quality.

## .004 SETTLE

The session publishes its output, `outputHash`, accepted units, and amounts. The smart contract can record the hashes and enforce:

```text
acceptedUnits <= maxUnits
settledAmount = acceptedUnits × unitPrice
```

The registry does not inspect raw output.

## Payment Path A: x402 Upto

The intended native Ceiling path uses x402 `upto`:

1. The buyer signs a maximum authorization.
2. The server processes and meters output.
3. The facilitator settles an actual amount less than or equal to the maximum.

The repository contains a working preflight and complete experiment under `spike/`. Monad's facilitator advertises x402 v2 `upto`, and the canonical Permit2/proxy prerequisites are checked. A successful live USDC settlement is not claimed because no real settlement transaction has been produced.

## Payment Path B: Ceiling Boomerang

The fallback uses x402 `exact`:

1. Charge the full 50,000-atomic-unit ceiling.
2. Run the same deterministic producer, validator, and meter.
3. Compute the actual 34,000-atomic-unit bill.
4. Refund the 16,000-atomic-unit difference to the payer.

`exact` plus refund is not protocol-equivalent to `upto`: the full ceiling first reaches the receiver and the refund is a separate transaction. It preserves the product economics—final cost equals accepted usage—but adds refund execution and receiver-funding assumptions.
