import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import {
  decodePaymentResponseHeader,
  wrapFetchWithPayment,
} from "@x402/fetch";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  MONAD_CHAIN_ID,
  MONAD_NETWORK,
  MONAD_RPC_URL,
  USDC_ADDRESS,
  requiredPrivateKey,
} from "../../spike/config.js";

const chain = {
  id: MONAD_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
} as const;
const balanceOfAbi = [
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
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: balanceOfAbi,
    functionName: "balanceOf",
    args: [account.address],
  });
  if (balance < 50_000n) {
    console.log("PAYMENT_STATUS=BLOCKED_NO_TEST_USDC");
    console.log(`payer=${account.address}`);
    console.log(`balance=${formatUnits(balance, 6)} USDC`);
    return;
  }

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(MONAD_RPC_URL),
  });
  const client = new x402Client().register(
    MONAD_NETWORK,
    new ExactEvmScheme({
      address: account.address,
      signTypedData: walletClient.signTypedData,
    }),
  );
  const response = await wrapFetchWithPayment(fetch, client)(
    "http://localhost:4022/boomerang",
  );
  const body = await response.text();
  const header =
    response.headers.get("payment-response") ??
    response.headers.get("x-payment-response");
  if (!response.ok || !header) {
    throw new Error(`EXACT_PAYMENT_FAILED:${response.status}:${body}`);
  }
  const settlement = decodePaymentResponseHeader(header);
  console.log(`PAYMENT_STATUS=${settlement.success ? "SETTLED" : "FAILED"}`);
  console.log(`PAYMENT_TRANSACTION=${settlement.transaction}`);
  console.log(body);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
