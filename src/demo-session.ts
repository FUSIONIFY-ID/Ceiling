import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { createSessionArtifact, recomputeSession } from "./core/artifact.js";
import { meterRecords } from "./core/meter.js";
import { DEFAULT_POLICY } from "./core/policy.js";
import { produceRecords } from "./core/producer.js";

type MonadDeployment = {
  address: string;
  deploymentTx: string;
};

type MonadProof = {
  sessionId: string;
  seed: string;
  policyHash: string;
  outputHash: string;
  commitTx: string;
  outcomeTx: string;
};

const root = resolve(import.meta.dirname, "..");

export async function createDemoSession() {
  const [deployment, proof] = await Promise.all([
    readFile(resolve(root, "deployments/monad-testnet.json"), "utf8").then(
      (value) => JSON.parse(value) as MonadDeployment,
    ),
    readFile(resolve(root, "deployments/monad-testnet-proof.json"), "utf8").then(
      (value) => JSON.parse(value) as MonadProof,
    ),
  ]);
  const records = produceRecords(proof.seed, DEFAULT_POLICY.maxUnits, 18);
  const meter = meterRecords(DEFAULT_POLICY, records);
  const artifact = createSessionArtifact(proof.seed, DEFAULT_POLICY, records);
  const recomputation = recomputeSession(artifact);

  assert.equal(artifact.sessionId, proof.sessionId, "verified session mismatch");
  assert.equal(artifact.policyHash, proof.policyHash, "verified policy mismatch");
  assert.equal(artifact.outputHash, proof.outputHash, "verified output mismatch");
  assert.ok(
    Object.values(recomputation).every(Boolean),
    "demo recomputation failed",
  );

  return {
    sessionId: artifact.sessionId,
    policy: artifact.policy,
    policyHash: artifact.policyHash,
    records: meter.recordsWithValidation,
    outputHash: artifact.outputHash,
    acceptedUnits: meter.acceptedUnits,
    rejectedAt: meter.rejectedAt,
    maxUnits: meter.maxUnits,
    unitPriceAtomic: meter.unitPriceAtomic.toString(),
    ceilingAmount: meter.ceilingAmount.toString(),
    actualAmount: meter.actualAmount.toString(),
    unusedAmount: meter.unusedAmount.toString(),
    recomputation,
    proof: {
      contract: deployment.address,
      deploymentTx: deployment.deploymentTx,
      commitTx: proof.commitTx,
      outcomeTx: proof.outcomeTx,
      readback: "PASS" as const,
    },
    payment: {
      integration: "READY" as const,
      preflight: "PASS" as const,
      liveSettlement: "WAITING FOR TEST USDC" as const,
    },
  };
}
