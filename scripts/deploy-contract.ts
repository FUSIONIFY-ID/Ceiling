import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { MONAD_CHAIN_ID, requiredPrivateKey } from "../spike/config.js";
import {
  monadTestnet,
  readArtifact,
  type MonadDeployment,
} from "./contract-config.js";

const account = privateKeyToAccount(requiredPrivateKey());
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});
const walletClient = createWalletClient({
  account,
  chain: monadTestnet,
  transport: http(),
});

const [chainId, balance, artifact] = await Promise.all([
  publicClient.getChainId(),
  publicClient.getBalance({ address: account.address }),
  readArtifact(),
]);
assert.equal(chainId, MONAD_CHAIN_ID, `WRONG_CHAIN:${chainId}`);
assert.ok(balance > 0n, "MON_BALANCE_INSUFFICIENT");
assert.ok(
  /^0x[0-9a-fA-F]+$/.test(artifact.bytecode) && artifact.bytecode !== "0x",
  "ZERO_BYTECODE",
);

console.log("\nCEILING REGISTRY DEPLOYMENT\n");
console.log("deployer".padEnd(24), account.address);
console.log("chain id".padEnd(24), chainId);
console.log("MON balance".padEnd(24), formatEther(balance));

const hash = await walletClient.deployContract({
  account,
  abi: artifact.abi,
  bytecode: artifact.bytecode,
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });
assert.equal(receipt.status, "success", `DEPLOYMENT_REVERTED:${hash}`);
assert.ok(receipt.contractAddress, `CONTRACT_ADDRESS_MISSING:${hash}`);

const deployment: MonadDeployment = {
  network: "Monad Testnet",
  chainId: MONAD_CHAIN_ID,
  contract: "CeilingRegistry",
  address: receipt.contractAddress,
  deploymentTx: hash,
  deployer: account.address,
  blockNumber: receipt.blockNumber.toString(),
};
await mkdir("deployments", { recursive: true });
await writeFile(
  "deployments/monad-testnet.json",
  `${JSON.stringify(deployment, null, 2)}\n`,
);

console.log("\nDEPLOYMENT CONFIRMED\n");
console.log("contract".padEnd(24), deployment.address);
console.log("transaction".padEnd(24), deployment.deploymentTx);
console.log("block".padEnd(24), deployment.blockNumber);
console.log(
  "explorer".padEnd(24),
  `https://testnet.monadscan.com/address/${deployment.address}`,
);
