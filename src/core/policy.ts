import { keccak256, stringToHex } from "viem";

export type CeilingPolicy = {
  version: 1;
  validator: "canonical-json-record-v1";
  unitDefinition: "one canonical JSON record";
  schema: {
    name: "string";
    score: "finite-number";
  };
  failurePolicy: "cut-on-first-invalid";
  unitPriceAtomic: string;
  maxUnits: number;
};

export const DEFAULT_POLICY: CeilingPolicy = {
  version: 1,
  validator: "canonical-json-record-v1",
  unitDefinition: "one canonical JSON record",
  schema: {
    name: "string",
    score: "finite-number",
  },
  failurePolicy: "cut-on-first-invalid",
  unitPriceAtomic: "2000",
  maxUnits: 25,
};

export function canonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("canonical_number_not_finite");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`);
    return `{${entries.join(",")}}`;
  }
  throw new Error(`canonical_unsupported_type:${typeof value}`);
}

export function canonicalizePolicy(policy: CeilingPolicy): string {
  if (!Number.isInteger(policy.maxUnits) || policy.maxUnits <= 0) {
    throw new Error("policy_max_units_invalid");
  }
  if (!/^(0|[1-9]\d*)$/.test(policy.unitPriceAtomic)) {
    throw new Error("policy_unit_price_invalid");
  }
  return canonicalize(policy);
}

export function hashPolicy(policy: CeilingPolicy): `0x${string}` {
  return keccak256(stringToHex(canonicalizePolicy(policy)));
}
