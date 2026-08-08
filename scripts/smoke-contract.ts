import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { createSessionArtifact } from "../src/core/artifact.js";
import { DEFAULT_POLICY, hashPolicy } from "../src/core/policy.js";
import { produceRecords } from "../src/core/producer.js";
import {
  MONAD_CHAIN_ID,
  requiredPrivateKey,
} from "../spike/config.js";
import {
  monadTestnet,
  readArtifact,
  readDeployment,
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
const [chainId, artifact, deployment] = await Promise.all([
  publicClient.getChainId(),
  readArtifact(),
  readDeployment(),
]);
assert.equal(chainId, MONAD_CHAIN_ID, `WRONG_CHAIN:${chainId}`);
assert.equal(
  getAddress(deployment.deployer),
  account.address,
  "DEPLOYER_MISMATCH",
);
const code = await publicClient.getCode({ address: deployment.address });
assert.ok(code && code !== "0x", "CONTRACT_NOT_DEPLOYED");

const seed = `ceiling-onchain-${Date.now()}`;
const output = produceRecords(seed, DEFAULT_POLICY.maxUnits, 18);
const session = createSessionArtifact(seed, DEFAULT_POLICY, output);
assert.equal(session.policyHash, hashPolicy(DEFAULT_POLICY));
assert.equal(
  BigInt(session.actualAmount),
  BigInt(session.acceptedUnits) * BigInt(session.unitPriceAtomic),
);

const commitSimulation = await publicClient.simulateContract({
  account,
  address: deployment.address,
  abi: artifact.abi,
  functionName: "commitSession",
  args: [
    session.sessionId,
    session.policyHash,
    BigInt(session.unitPriceAtomic),
    BigInt(session.maxUnits),
  ],
});
const commitTx = await walletClient.writeContract(commitSimulation.request);
const commitReceipt = await publicClient.waitForTransactionReceipt({
  hash: commitTx,
});
assert.equal(commitReceipt.status, "success", `COMMIT_REVERTED:${commitTx}`);

const outcomeSimulation = await publicClient.simulateContract({
  account,
  address: deployment.address,
  abi: artifact.abi,
  functionName: "recordOutcome",
  args: [
    session.sessionId,
    session.outputHash,
    BigInt(session.acceptedUnits),
    BigInt(session.actualAmount),
  ],
});
const outcomeTx = await walletClient.writeContract(outcomeSimulation.request);
const outcomeReceipt = await publicClient.waitForTransactionReceipt({
  hash: outcomeTx,
});
assert.equal(outcomeReceipt.status, "success", `OUTCOME_REVERTED:${outcomeTx}`);

const onchain = await publicClient.readContract({
  address: deployment.address,
  abi: artifact.abi,
  functionName: "sessions",
  args: [session.sessionId],
}) as readonly [
  `0x${string}`,
  bigint,
  bigint,
  `0x${string}`,
  bigint,
  bigint,
  boolean,
];
const checks = {
  policyHash: onchain[0] === session.policyHash,
  unitPrice: onchain[1] === BigInt(session.unitPriceAtomic),
  maxUnits: onchain[2] === BigInt(session.maxUnits),
  outputHash: onchain[3] === session.outputHash,
  acceptedUnits: onchain[4] === BigInt(session.acceptedUnits),
  settledAmount: onchain[5] === BigInt(session.actualAmount),
  finalized: onchain[6] === true,
};
assert.ok(Object.values(checks).every(Boolean), JSON.stringify(checks));

const evidence = {
  network: deployment.network,
  chainId: deployment.chainId,
  registry: deployment.address,
  sessionId: session.sessionId,
  seed,
  policyHash: session.policyHash,
  outputHash: session.outputHash,
  maxUnits: session.maxUnits,
  acceptedUnits: session.acceptedUnits,
  unitPriceAtomic: session.unitPriceAtomic,
  settledAmount: session.actualAmount,
  commitTx,
  commitBlockNumber: commitReceipt.blockNumber.toString(),
  outcomeTx,
  outcomeBlockNumber: outcomeReceipt.blockNumber.toString(),
};
await mkdir("deployments", { recursive: true });
await writeFile(
  "deployments/monad-testnet-proof.json",
  `${JSON.stringify(evidence, null, 2)}\n`,
);

console.log("\nONCHAIN RECOMPUTATION PROOF\n");
console.log("policyHash".padEnd(20), checks.policyHash ? "MATCH" : "MISMATCH");
console.log("outputHash".padEnd(20), checks.outputHash ? "MATCH" : "MISMATCH");
console.log("acceptedUnits".padEnd(20), checks.acceptedUnits ? "MATCH" : "MISMATCH");
console.log("settledAmount".padEnd(20), checks.settledAmount ? "MATCH" : "MISMATCH");
console.log("maxUnits".padEnd(20), checks.maxUnits ? "MATCH" : "MISMATCH");
console.log("finalized".padEnd(20), checks.finalized ? "TRUE" : "FALSE");
console.log("\nONCHAIN CORE PROOF PASS\n");
console.log("session".padEnd(20), session.sessionId);
console.log("commit tx".padEnd(20), commitTx);
console.log("outcome tx".padEnd(20), outcomeTx);
console.log(
  "contract".padEnd(20),
  `https://testnet.monadscan.com/address/${deployment.address}`,
);
console.log(
  "deployment tx".padEnd(20),
  `https://testnet.monadscan.com/tx/${deployment.deploymentTx}`,
);
console.log(
  "commit tx".padEnd(20),
  `https://testnet.monadscan.com/tx/${commitTx}`,
);
console.log(
  "outcome tx".padEnd(20),
  `https://testnet.monadscan.com/tx/${outcomeTx}`,
);
