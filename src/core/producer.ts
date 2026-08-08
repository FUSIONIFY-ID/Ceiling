export type ProducedRecord = unknown;

function hashSeed(seed: string): number {
  let state = 2166136261;
  for (const character of seed) {
    state ^= character.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  return state >>> 0;
}

function nextRandom(state: number): number {
  let value = state;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
}

export function produceRecords(
  seed: string,
  maxUnits: number,
  invalidAt = 18,
): ProducedRecord[] {
  if (!seed) throw new Error("seed_required");
  if (!Number.isInteger(maxUnits) || maxUnits <= 0) {
    throw new Error("max_units_invalid");
  }
  if (!Number.isInteger(invalidAt) || invalidAt < 1 || invalidAt > maxUnits) {
    throw new Error("invalid_at_out_of_range");
  }

  let state = hashSeed(seed);
  return Array.from({ length: maxUnits }, (_, index) => {
    state = nextRandom(state);
    const unit = index + 1;
    if (unit === invalidAt) {
      return { name: `record-${unit}`, score: null };
    }
    return {
      name: `record-${unit}-${state.toString(16).padStart(8, "0")}`,
      score: (state % 10_001) / 100,
    };
  });
}
