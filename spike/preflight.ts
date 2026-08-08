import { readFile } from "node:fs/promises";
import { createPublicClient, http } from "viem";

import {
  FACILITATOR_URL,
  MONAD_CHAIN_ID,
  MONAD_NETWORK,
  MONAD_RPC_URL,
  PERMIT2_ADDRESS,
  UPTO_PROXY,
} from "./config.js";

type SupportedResponse = {
  kinds?: Array<{
    x402Version: number;
    scheme: string;
    network: string;
    extra?: { facilitatorAddress?: string };
  }>;
  signers?: Record<string, string[]>;
};

const publicClient = createPublicClient({ transport: http(MONAD_RPC_URL) });

function row(label: string, value: string): void {
  console.log(label.padEnd(28), value);
}

async function main(): Promise<void> {
  console.log("\nCEILING PREFLIGHT\n");

  const response = await fetch(`${FACILITATOR_URL}/supported`);
  if (!response.ok) {
    throw new Error(
      `FACILITATOR_UNAVAILABLE: GET /supported -> ${response.status} ${await response.text()}`,
    );
  }
  const supported = (await response.json()) as SupportedResponse;
  const monadKinds = supported.kinds?.filter(
    ({ network }) => network === MONAD_NETWORK,
  ) ?? [];
  const upto = monadKinds.find(
    ({ scheme, x402Version }) => scheme === "upto" && x402Version === 2,
  );
  if (!upto) {
    throw new Error(
      `UPTO_NOT_SUPPORTED: ${JSON.stringify(monadKinds, null, 2)}`,
    );
  }
  const facilitatorAddress =
    upto.extra?.facilitatorAddress ?? supported.signers?.[MONAD_NETWORK]?.[0];
  if (!facilitatorAddress) {
    throw new Error(
      `UPTO_NOT_SUPPORTED: facilitatorAddress tidak diiklankan: ${JSON.stringify(upto)}`,
    );
  }

  const [chainId, blockNumber, proxyCode, permit2Code, packageJson] =
    await Promise.all([
      publicClient.getChainId(),
      publicClient.getBlockNumber(),
      publicClient.getCode({ address: UPTO_PROXY }),
      publicClient.getCode({ address: PERMIT2_ADDRESS }),
      readFile(
        new URL("../node_modules/@x402/evm/package.json", import.meta.url),
        "utf8",
      ).then((body) => JSON.parse(body) as { version: string }),
    ]);

  if (chainId !== MONAD_CHAIN_ID) {
    throw new Error(`RPC_ERROR: chain ID ${chainId}, expected ${MONAD_CHAIN_ID}`);
  }
  if (!proxyCode || proxyCode === "0x") {
    throw new Error(`PROXY_NOT_DEPLOYED: ${UPTO_PROXY}`);
  }
  if (!permit2Code || permit2Code === "0x") {
    throw new Error(`PERMIT2_ERROR: bytecode tidak ada di ${PERMIT2_ADDRESS}`);
  }
  if (packageJson.version !== "2.12.0") {
    throw new Error(
      `WRONG_X402_VERSION: @x402/evm ${packageJson.version}, expected 2.12.0`,
    );
  }

  row("RPC", "OK");
  row("Monad Testnet", `OK (chain ${chainId}, block ${blockNumber})`);
  row("Facilitator", "OK");
  row("Supported Monad schemes", monadKinds.map(({ scheme }) => scheme).join(", "));
  row("x402 v2", "OK");
  row("upto", "SUPPORTED");
  row("upto proxy bytecode", "FOUND");
  row("Permit2 bytecode", "FOUND");
  row("facilitator address", facilitatorAddress);
  row("@x402/evm", packageJson.version);
  console.log("\nSTATUS:\nREADY FOR PAYMENT SPIKE\n");
}

main().catch((error: unknown) => {
  console.error("\nSTATUS:\nNOT READY");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
