import { readFile } from "node:fs/promises";
import { defineChain, getAddress, isAddress, isHash } from "viem";

import {
  MONAD_CHAIN_ID,
  MONAD_RPC_URL,
} from "../spike/config.js";

export type ContractArtifact = {
  contractName: "CeilingRegistry";
  abi: readonly unknown[];
  bytecode: `0x${string}`;
};

export type MonadDeployment = {
  network: "Monad Testnet";
  chainId: 10143;
  contract: "CeilingRegistry";
  address: `0x${string}`;
  deploymentTx: `0x${string}`;
  deployer: `0x${string}`;
  blockNumber: string;
};

export const monadTestnet = defineChain({
  id: MONAD_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
  blockExplorers: {
    default: {
      name: "MonadScan",
      url: "https://testnet.monadscan.com",
    },
  },
});

export async function readArtifact(): Promise<ContractArtifact> {
  const artifact = JSON.parse(
    await readFile("artifacts/CeilingRegistry.json", "utf8"),
  ) as ContractArtifact;
  if (
    artifact.contractName !== "CeilingRegistry" ||
    !Array.isArray(artifact.abi) ||
    !/^0x[0-9a-fA-F]+$/.test(artifact.bytecode) ||
    artifact.bytecode === "0x"
  ) {
    throw new Error("CONTRACT_ARTIFACT_INVALID");
  }
  return artifact;
}

export async function readDeployment(): Promise<MonadDeployment> {
  const deployment = JSON.parse(
    await readFile("deployments/monad-testnet.json", "utf8"),
  ) as MonadDeployment;
  if (
    deployment.network !== "Monad Testnet" ||
    deployment.chainId !== MONAD_CHAIN_ID ||
    deployment.contract !== "CeilingRegistry" ||
    !isAddress(deployment.address) ||
    !isAddress(deployment.deployer) ||
    !isHash(deployment.deploymentTx) ||
    !/^\d+$/.test(deployment.blockNumber)
  ) {
    throw new Error("DEPLOYMENT_FILE_INVALID");
  }
  return {
    ...deployment,
    address: getAddress(deployment.address),
    deployer: getAddress(deployment.deployer),
  };
}
