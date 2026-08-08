import { config } from "dotenv";

config({ path: ".env.local" });
config();

export const MONAD_NETWORK = "eip155:10143" as const;
export const MONAD_CHAIN_ID = 10143;
export const MONAD_RPC_URL =
  process.env.MONAD_RPC_URL ?? "https://testnet-rpc.monad.xyz";
export const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ?? "https://x402-facilitator.molandak.org";
export const USDC_ADDRESS = (process.env.MONAD_USDC_ADDRESS ??
  "0x534b2f3A21130d7a60830c2Df862319e593943A3") as `0x${string}`;
export const UPTO_PROXY = (process.env.X402_UPTO_PROXY ??
  "0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002") as `0x${string}`;
export const PERMIT2_ADDRESS =
  "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const;

export const MAX_AMOUNT = "50000";
export const ACTUAL_AMOUNT = "10000";

export function requiredAddress(name: string): `0x${string}` {
  const value = process.env[name];
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${name} harus berupa alamat EVM 0x yang valid`);
  }
  return value as `0x${string}`;
}

export function requiredPrivateKey(): `0x${string}` {
  const value = process.env.PRIVATE_KEY;
  if (!value || !/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error(
      "PRIVATE_KEY tidak ditemukan di .env.local atau formatnya tidak valid",
    );
  }
  return value as `0x${string}`;
}
