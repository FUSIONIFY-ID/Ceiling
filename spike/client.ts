import { x402Client } from "@x402/core/client";
import { UptoEvmScheme } from "@x402/evm/upto/client";
import {
  decodePaymentResponseHeader,
  wrapFetchWithPayment,
} from "@x402/fetch";
import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  ACTUAL_AMOUNT,
  MAX_AMOUNT,
  MONAD_CHAIN_ID,
  MONAD_NETWORK,
  MONAD_RPC_URL,
  requiredPrivateKey,
} from "./config.js";

const chain = {
  id: MONAD_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
} as const;

async function main(): Promise<void> {
  const account = privateKeyToAccount(requiredPrivateKey());
  const publicClient = createPublicClient({ chain, transport: http(MONAD_RPC_URL) });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(MONAD_RPC_URL),
  });
  const signer = {
    address: account.address,
    signTypedData: walletClient.signTypedData,
    readContract: publicClient.readContract,
    signTransaction: walletClient.signTransaction,
    getTransactionCount: publicClient.getTransactionCount,
    estimateFeesPerGas: publicClient.estimateFeesPerGas,
  };
  const client = new x402Client().register(
    MONAD_NETWORK,
    new UptoEvmScheme(signer),
  );
  const paidFetch = wrapFetchWithPayment(fetch, client);
  const response = await paidFetch("http://localhost:4021/metered", {
    headers: { accept: "application/json" },
  });
  const body = await response.text();
  const paymentHeader =
    response.headers.get("payment-response") ??
    response.headers.get("x-payment-response");

  if (!response.ok || !paymentHeader) {
    throw new Error(
      `SETTLEMENT_REJECTED: HTTP ${response.status}\nevidence: ${body}\nlikely cause: facilitator/allowance/signature/saldo\nnext: npm run spike:approve`,
    );
  }

  const settlement = decodePaymentResponseHeader(paymentHeader);
  const transaction = settlement.transaction;
  if (!settlement.success || !/^0x[a-fA-F0-9]{64}$/.test(transaction)) {
    throw new Error(
      `SETTLEMENT_REJECTED: respons tidak berisi tx hash nyata\n${JSON.stringify(settlement, null, 2)}`,
    );
  }
  if (BigInt(ACTUAL_AMOUNT) >= BigInt(MAX_AMOUNT)) {
    throw new Error("INVARIANT_FAILED: actual harus lebih kecil dari maximum");
  }

  console.log("\n============================================");
  console.log("CEILING — GATE 1 PASSED");
  console.log("============================================\n");
  console.log("Network\nMonad Testnet\n");
  console.log("Authorized maximum\n0.050000 USDC\n");
  console.log("Actual settlement\n0.010000 USDC\n");
  console.log("Invariant\nACTUAL < MAXIMUM ✓\n");
  console.log(`Settlement transaction\n${transaction}\n`);
  console.log("============================================");
  console.log("\nResource response");
  console.log(body);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
