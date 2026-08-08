import {
  createPermit2ApprovalTx,
  getPermit2AllowanceReadParams,
} from "@x402/evm/upto/client";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  formatUnits,
  http,
  maxUint256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  MAX_AMOUNT,
  MONAD_CHAIN_ID,
  MONAD_RPC_URL,
  PERMIT2_ADDRESS,
  UPTO_PROXY,
  USDC_ADDRESS,
  requiredPrivateKey,
} from "./config.js";

const chain = {
  id: MONAD_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
} as const;

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

async function main(): Promise<void> {
  const account = privateKeyToAccount(requiredPrivateKey());
  const publicClient = createPublicClient({ chain, transport: http(MONAD_RPC_URL) });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(MONAD_RPC_URL),
  });

  const [monBalance, usdcBalance, allowance] = await Promise.all([
    publicClient.getBalance({ address: account.address }),
    publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account.address],
    }),
    publicClient.readContract(getPermit2AllowanceReadParams({
      tokenAddress: USDC_ADDRESS,
      ownerAddress: account.address,
    })),
  ]);

  console.log("\nCEILING PERMIT2 PREREQUISITE\n");
  console.log("payer".padEnd(28), account.address);
  console.log("MON balance".padEnd(28), formatEther(monBalance));
  console.log("USDC balance".padEnd(28), formatUnits(usdcBalance, 6));
  console.log("USDC -> Permit2 allowance".padEnd(28), formatUnits(allowance, 6));
  console.log("token approval target".padEnd(28), PERMIT2_ADDRESS);
  console.log("signed Permit2 spender".padEnd(28), UPTO_PROXY);

  if (usdcBalance < BigInt(MAX_AMOUNT)) {
    throw new Error(
      `USDC_BALANCE_INSUFFICIENT: perlu >= 0.050000 USDC, tersedia ${formatUnits(usdcBalance, 6)}`,
    );
  }
  if (allowance >= BigInt(MAX_AMOUNT)) {
    console.log("\nSTATUS:\nAPPROVAL ALREADY SUFFICIENT\n");
    return;
  }
  if (monBalance === 0n) {
    throw new Error("MON_BALANCE_INSUFFICIENT: approval memerlukan gas testnet MON");
  }

  const approval = createPermit2ApprovalTx(USDC_ADDRESS);
  const hash = await walletClient.sendTransaction({
    account,
    chain,
    to: approval.to,
    data: approval.data,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`PERMIT2_ERROR: approval reverted, tx ${hash}`);
  }
  const updatedAllowance = await publicClient.readContract(
    getPermit2AllowanceReadParams({
      tokenAddress: USDC_ADDRESS,
      ownerAddress: account.address,
    }),
  );
  if (updatedAllowance !== maxUint256) {
    throw new Error(
      `PERMIT2_ERROR: allowance setelah approval ${updatedAllowance}, expected ${maxUint256}`,
    );
  }

  console.log("\nPermit2 approval transaction".padEnd(28), hash);
  console.log("\nSTATUS:\nAPPROVAL READY\n");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
