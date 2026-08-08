# Demo Guide

## Operator Checklist

Before the demo:

- [ ] `npm install` completed.
- [ ] `npm run check` passes.
- [ ] `npm run test:core` passes.
- [ ] `npm run contract:compile` passes.
- [ ] `npm run demo:core` passes.
- [ ] Demo wallet is connected to Monad Testnet.
- [ ] MON and USDC balances have been checked.
- [ ] Explorer links are prepared only for transactions that actually exist.
- [ ] Browser and repository tabs are already open.
- [ ] Terminal font is readable from the audience.
- [ ] No private key or `.env.local` content is visible.

## 3-Minute Demo Script

### 0:00–0:25 — Problem

“The problem isn't usage billing. It's trusting the meter. A buyer normally has to accept the vendor's definition of a unit, its acceptance rules, and its final arithmetic.”

### 0:25–0:50 — Commit Policy

Open `src/core/policy.ts` or point to the CLI policy summary.

“Ceiling commits one canonical JSON record per unit, a deterministic validator, cut-on-first-invalid, 2,000 atomic USDC per unit, and a maximum of 25 units. The canonical policy hash is fixed before output exists.”

### 0:50–1:30 — Run the Stream

Run:

```bash
npm run demo:core
```

“The producer is seeded for a reproducible hackathon demo. Each record goes through the same deterministic validator.”

Let the record list remain visible.

### 1:30–1:50 — Show the Cut

Point to:

```text
record 18       REJECT — score_not_finite
STREAM CUT
```

“Record 18 is invalid. It is not charged, and nothing after it enters the bill.”

### 1:50–2:15 — Show the Bill

“The ceiling was 25 units, or 0.050 USDC. Seventeen records held up, so the actual bill is 0.034 USDC and 0.016 remains unused.”

### 2:15–2:35 — Recompute

Point to the `MATCH` results.

“The policy hash, output hash, accepted count, and billing arithmetic are recomputed from the published artifact. This is not an invoice we ask the buyer to accept.”

### 2:35–2:50 — Monad Evidence

If real deployment and payment evidence exists, open the prepared Monad explorer links and identify the contract commit/outcome and payment/refund transactions.

If it does not exist, say:

“The core mechanism and contract compile are live here. The payment client reports `BLOCKED_NO_TEST_USDC`, so we are not presenting a fabricated transaction.”

### 2:50–3:00 — Close

“Ceiling doesn't ask you to trust an invoice. It gives you enough information to recompute it.”

## Demo Fallback Plan

If test USDC or live settlement remains blocked:

1. Run the deterministic engine live with `npm run demo:core`.
2. Show the exact rejection point and integer arithmetic.
3. Show all recomputation checks returning `MATCH`.
4. Run `npm run contract:compile`.
5. Show `PAYMENT_STATUS=BLOCKED_NO_TEST_USDC` from `npm run payment:exact:client`.
6. Explain that the x402 `upto` experiment and exact/refund fallback are implemented, but do not show or imply a transaction that does not exist.

The runnable mechanism and honest evidence are stronger than a mocked chain result.
