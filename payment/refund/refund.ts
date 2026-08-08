import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  type Hash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { requiredPayToPrivateKey } from "../config.js";
import {
  MONAD_CHAIN_ID,
  MONAD_RPC_URL,
  USDC_ADDRESS,
} from "../../spike/config.js";

const transferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const chain = {
  id: MONAD_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
} as const;

export async function refundUnusedUsdc(
  payer: `0x${string}`,
  unusedAmount: bigint,
): Promise<Hash | null> {
  if (unusedAmount < 0n) throw new Error("refund_amount_negative");
  if (unusedAmount === 0n) return null;

  const account = privateKeyToAccount(requiredPayToPrivateKey());
  const publicClient = createPublicClient({ chain, transport: http(MONAD_RPC_URL) });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(MONAD_RPC_URL),
  });
  const { request } = await publicClient.simulateContract({
    account,
    address: USDC_ADDRESS,
    abi: transferAbi,
    functionName: "transfer",
    args: [getAddress(payer), unusedAmount],
  });
  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error(`REFUND_REVERTED:${hash}`);
  return hash;
}
