import assert from "node:assert/strict";

import { createSessionArtifact, recomputeSession } from "./artifact.js";
import { meterRecords } from "./meter.js";
import { canonicalizePolicy, DEFAULT_POLICY } from "./policy.js";
import { produceRecords } from "./producer.js";

const reorderedPolicy = {
  maxUnits: 25,
  unitPriceAtomic: "2000",
  failurePolicy: "cut-on-first-invalid",
  schema: { score: "finite-number", name: "string" },
  unitDefinition: "one canonical JSON record",
  validator: "canonical-json-record-v1",
  version: 1,
} as const;
assert.equal(
  canonicalizePolicy(DEFAULT_POLICY),
  canonicalizePolicy(reorderedPolicy),
  "canonical policy must ignore object insertion order",
);

const output = produceRecords("core-self-check", 25, 18);
assert.deepEqual(output, produceRecords("core-self-check", 25, 18));
const meter = meterRecords(DEFAULT_POLICY, output);
assert.deepEqual(
  {
    acceptedUnits: meter.acceptedUnits,
    rejectedAt: meter.rejectedAt,
    ceiling: meter.ceilingAmount,
    actual: meter.actualAmount,
    unused: meter.unusedAmount,
  },
  {
    acceptedUnits: 17,
    rejectedAt: 18,
    ceiling: 50_000n,
    actual: 34_000n,
    unused: 16_000n,
  },
);

const artifact = createSessionArtifact("core-self-check", DEFAULT_POLICY, output);
assert.ok(Object.values(recomputeSession(artifact)).every(Boolean));
assert.equal(
  recomputeSession({ ...artifact, actualAmount: "34001" }).billingMatches,
  false,
);
console.log("Core deterministic self-check PASS");
