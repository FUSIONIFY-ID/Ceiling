import type { CeilingPolicy } from "./policy.js";
import { validateRecord, type ValidationResult } from "./validator.js";

export type MeteredRecord = {
  unit: number;
  record: unknown;
  validation: ValidationResult | null;
  billed: boolean;
  afterCut: boolean;
};

export type MeterResult = {
  maxUnits: number;
  producedUnits: number;
  acceptedUnits: number;
  rejectedAt: number | null;
  unitPriceAtomic: bigint;
  ceilingAmount: bigint;
  actualAmount: bigint;
  unusedAmount: bigint;
  recordsWithValidation: MeteredRecord[];
};

export function meterRecords(
  policy: CeilingPolicy,
  producedRecords: readonly unknown[],
): MeterResult {
  const unitPriceAtomic = BigInt(policy.unitPriceAtomic);
  const considered = producedRecords.slice(0, policy.maxUnits);
  let acceptedUnits = 0;
  let rejectedAt: number | null = null;

  const recordsWithValidation = considered.map((record, index): MeteredRecord => {
    const unit = index + 1;
    if (rejectedAt !== null) {
      return { unit, record, validation: null, billed: false, afterCut: true };
    }
    const validation = validateRecord(record);
    if (!validation.valid) {
      rejectedAt = unit;
      return { unit, record, validation, billed: false, afterCut: false };
    }
    acceptedUnits += 1;
    return { unit, record, validation, billed: true, afterCut: false };
  });

  const ceilingAmount = BigInt(policy.maxUnits) * unitPriceAtomic;
  const actualAmount = BigInt(acceptedUnits) * unitPriceAtomic;
  return {
    maxUnits: policy.maxUnits,
    producedUnits: producedRecords.length,
    acceptedUnits,
    rejectedAt,
    unitPriceAtomic,
    ceilingAmount,
    actualAmount,
    unusedAmount: ceilingAmount - actualAmount,
    recordsWithValidation,
  };
}
