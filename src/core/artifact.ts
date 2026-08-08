import { keccak256, stringToHex } from "viem";

import { meterRecords } from "./meter.js";
import {
  canonicalize,
  hashPolicy,
  type CeilingPolicy,
} from "./policy.js";

export type SessionArtifact = {
  sessionId: `0x${string}`;
  policy: CeilingPolicy;
  policyHash: `0x${string}`;
  seed: string;
  output: readonly unknown[];
  outputHash: `0x${string}`;
  acceptedUnits: number;
  unitPriceAtomic: string;
  maxUnits: number;
  ceilingAmount: string;
  actualAmount: string;
  unusedAmount: string;
};

export type RecomputeResult = {
  policyHashMatches: boolean;
  outputHashMatches: boolean;
  acceptedUnitsMatches: boolean;
  actualAmountMatches: boolean;
  billingMatches: boolean;
};

export function hashOutput(output: readonly unknown[]): `0x${string}` {
  return keccak256(stringToHex(canonicalize(output)));
}

export function createSessionArtifact(
  seed: string,
  policy: CeilingPolicy,
  output: readonly unknown[],
): SessionArtifact {
  const meter = meterRecords(policy, output);
  const policyHash = hashPolicy(policy);
  const outputHash = hashOutput(output);
  const sessionId = keccak256(
    stringToHex(canonicalize({ outputHash, policyHash, seed })),
  );

  return {
    sessionId,
    policy,
    policyHash,
    seed,
    output,
    outputHash,
    acceptedUnits: meter.acceptedUnits,
    unitPriceAtomic: meter.unitPriceAtomic.toString(),
    maxUnits: meter.maxUnits,
    ceilingAmount: meter.ceilingAmount.toString(),
    actualAmount: meter.actualAmount.toString(),
    unusedAmount: meter.unusedAmount.toString(),
  };
}

export function recomputeSession(artifact: SessionArtifact): RecomputeResult {
  const meter = meterRecords(artifact.policy, artifact.output);
  const policyHashMatches = hashPolicy(artifact.policy) === artifact.policyHash;
  const outputHashMatches = hashOutput(artifact.output) === artifact.outputHash;
  const acceptedUnitsMatches = meter.acceptedUnits === artifact.acceptedUnits;
  const actualAmountMatches =
    meter.actualAmount.toString() === artifact.actualAmount;
  const billingMatches =
    artifact.unitPriceAtomic === artifact.policy.unitPriceAtomic &&
    artifact.maxUnits === artifact.policy.maxUnits &&
    meter.ceilingAmount.toString() === artifact.ceilingAmount &&
    meter.unusedAmount.toString() === artifact.unusedAmount &&
    BigInt(artifact.actualAmount) ===
      BigInt(artifact.acceptedUnits) * BigInt(artifact.unitPriceAtomic);

  return {
    policyHashMatches,
    outputHashMatches,
    acceptedUnitsMatches,
    actualAmountMatches,
    billingMatches,
  };
}
