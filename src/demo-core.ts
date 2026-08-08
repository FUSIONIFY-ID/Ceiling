import assert from "node:assert/strict";
import { formatUnits } from "viem";

import { createSessionArtifact, recomputeSession } from "./core/artifact.js";
import { meterRecords } from "./core/meter.js";
import {
  canonicalizePolicy,
  DEFAULT_POLICY,
  hashPolicy,
} from "./core/policy.js";
import { produceRecords } from "./core/producer.js";
import { getExactPaymentStatus } from "../payment/exact/status.js";

const seed = process.env.CEILING_SEED ?? "ceiling-jakarta-2026";
const output = produceRecords(seed, DEFAULT_POLICY.maxUnits, 18);
const meter = meterRecords(DEFAULT_POLICY, output);
const artifact = createSessionArtifact(seed, DEFAULT_POLICY, output);
const recomputed = recomputeSession(artifact);
const payment = await getExactPaymentStatus();

assert.equal(canonicalizePolicy(DEFAULT_POLICY), canonicalizePolicy({
  maxUnits: 25,
  failurePolicy: "cut-on-first-invalid",
  schema: { score: "finite-number", name: "string" },
  unitPriceAtomic: "2000",
  unitDefinition: "one canonical JSON record",
  validator: "canonical-json-record-v1",
  version: 1,
}));
assert.equal(hashPolicy(DEFAULT_POLICY), artifact.policyHash);
assert.deepEqual(output, produceRecords(seed, DEFAULT_POLICY.maxUnits, 18));
assert.equal(meter.acceptedUnits, 17);
assert.equal(meter.rejectedAt, 18);
assert.equal(meter.actualAmount, 34_000n);
assert.equal(meter.unusedAmount, 16_000n);
assert.ok(Object.values(recomputed).every(Boolean));

const money = (amount: bigint): string => `$${formatUnits(amount, 6)}`;
const match = (value: boolean): string => value ? "MATCH" : "MISMATCH";

console.log("\nCEILING — RECOMPUTABLE METERING\n");
console.log("Session");
console.log(`  id              ${artifact.sessionId}`);
console.log(`  policy hash     ${artifact.policyHash}\n`);
console.log("Policy");
console.log(`  unit            ${DEFAULT_POLICY.unitDefinition}`);
console.log(`  unit price      ${money(meter.unitPriceAtomic)}`);
console.log(`  max units       ${meter.maxUnits}`);
console.log(`  ceiling         ${money(meter.ceilingAmount)}\n`);
console.log("Processing");
for (const item of meter.recordsWithValidation) {
  const label = `  record ${String(item.unit).padStart(2, "0")}`;
  if (item.validation?.valid) console.log(`${label}       ACCEPT`);
  else if (item.validation && !item.validation.valid) {
    console.log(`${label}       REJECT — ${item.validation.reason}`);
    console.log("  STREAM CUT");
    break;
  }
}
console.log("\nSettlement");
console.log(`  accepted        ${meter.acceptedUnits} / ${meter.maxUnits}`);
console.log(`  actual          ${money(meter.actualAmount)}`);
console.log(`  unused          ${money(meter.unusedAmount)}\n`);
console.log("Recompute");
console.log(`  policy hash     ${match(recomputed.policyHashMatches)}`);
console.log(`  output hash     ${match(recomputed.outputHashMatches)}`);
console.log(`  accepted units  ${match(recomputed.acceptedUnitsMatches)}`);
console.log(`  billing         ${match(recomputed.billingMatches)}\n`);
console.log("Payment");
if (payment.status === "BLOCKED_NO_TEST_USDC") {
  console.log("  exact charge    BLOCKED — payer has no test USDC");
  console.log("  refund          BLOCKED — no preceding payment");
} else {
  console.log("  exact charge    READY — live execution not requested");
  console.log("  refund          READY — runs after successful exact settlement");
}
console.log(`  payer           ${payment.payer}`);
console.log(`  USDC balance    ${payment.balanceFormatted}\n`);
console.log("CORE LOGIC        PASS\n");
