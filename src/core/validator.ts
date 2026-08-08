export type ValidationResult =
  | { valid: true; reason: null }
  | {
      valid: false;
      reason:
        | "record_not_object"
        | "name_not_string"
        | "name_empty"
        | "score_not_finite";
    };

export function validateRecord(record: unknown): ValidationResult {
  if (record === null || typeof record !== "object" || Array.isArray(record)) {
    return { valid: false, reason: "record_not_object" };
  }
  const candidate = record as Record<string, unknown>;
  if (typeof candidate.name !== "string") {
    return { valid: false, reason: "name_not_string" };
  }
  if (candidate.name.trim().length === 0) {
    return { valid: false, reason: "name_empty" };
  }
  if (typeof candidate.score !== "number" || !Number.isFinite(candidate.score)) {
    return { valid: false, reason: "score_not_finite" };
  }
  return { valid: true, reason: null };
}
