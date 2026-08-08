export function requiredPayToPrivateKey(): `0x${string}` {
  const value = process.env.PAY_TO_PRIVATE_KEY;
  if (!value || !/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error(
      "PAY_TO_PRIVATE_KEY tidak ditemukan di .env.local atau formatnya tidak valid",
    );
  }
  return value as `0x${string}`;
}
