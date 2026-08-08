/**
 * Canonical demo-session figures, mirrored from the deterministic core
 * (`src/core/policy.ts` + `deployments/monad-testnet-proof.json`).
 * Every number rendered on the homepage must come from here.
 */
export const UNITS = {
  max: 25,
  accepted: 17,
  rejectedAt: 18,
  unitPrice: "$0.002",
  ceiling: "$0.050000",
  actual: "$0.034000",
  unused: "$0.016000",
  ceilingShort: "$0.050",
  actualShort: "$0.034",
  unusedShort: "$0.016",
  rejectReason: "score_not_finite",
  failurePolicy: "cut-on-first-invalid",
} as const;

export const POLICY_LINES = [
  ["BILLABLE UNIT", "one canonical JSON record"],
  ["VALIDATOR", "name: string"],
  ["", "score: finite number"],
  ["UNIT PRICE", UNITS.unitPrice],
  ["MAX UNITS", String(UNITS.max)],
  ["FAILURE POLICY", UNITS.failurePolicy],
] as const;

export const RECOMPUTE_ROWS = [
  ["POLICY HASH", "MATCH"],
  ["OUTPUT HASH", "MATCH"],
  ["ACCEPTED UNITS", "MATCH"],
  ["SETTLED AMOUNT", "MATCH"],
  ["FINALIZED", "TRUE"],
] as const;

export const PROOF_FLOW = [
  "POLICY",
  "COMMIT SESSION",
  "PROCESS",
  "RECORD OUTCOME",
  "READBACK",
  "MATCH",
] as const;
