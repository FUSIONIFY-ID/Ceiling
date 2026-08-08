import { createPublicClient, formatUnits, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  MONAD_RPC_URL,
  USDC_ADDRESS,
  requiredPrivateKey,
} from "../../spike/config.js";

const balanceOfAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export async function getExactPaymentStatus(): Promise<{
  status: "READY" | "BLOCKED_NO_TEST_USDC";
  payer: `0x${string}`;
  balance: bigint;
  balanceFormatted: string;
}> {
  const payer = privateKeyToAccount(requiredPrivateKey()).address;
  const balance = await createPublicClient({
    transport: http(MONAD_RPC_URL),
  }).readContract({
    address: USDC_ADDRESS,
    abi: balanceOfAbi,
    functionName: "balanceOf",
    args: [payer],
  });
  return {
    status: balance >= 50_000n ? "READY" : "BLOCKED_NO_TEST_USDC",
    payer,
    balance,
    balanceFormatted: formatUnits(balance, 6),
  };
}
