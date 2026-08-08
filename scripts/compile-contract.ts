import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import solc from "solc";

type CompiledContract = {
  abi: unknown[];
  evm: { bytecode: { object: string } };
};
type SolcOutput = {
  contracts?: Record<string, Record<string, CompiledContract>>;
  errors?: Array<{ severity: string; formattedMessage: string }>;
};

const source = await readFile("contracts/CeilingRegistry.sol", "utf8");
const input = {
  language: "Solidity",
  sources: { "CeilingRegistry.sol": { content: source } },
  settings: {
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input))) as SolcOutput;
const errors = output.errors?.filter(({ severity }) => severity === "error") ?? [];

assert.equal(errors.length, 0, errors.map(({ formattedMessage }) => formattedMessage).join("\n"));
const contract = output.contracts?.["CeilingRegistry.sol"]?.CeilingRegistry;
assert.ok(contract, "CeilingRegistry missing from compiler output");
assert.ok(contract.evm.bytecode.object, "CeilingRegistry bytecode is empty");

await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/CeilingRegistry.json",
  `${JSON.stringify({
    contractName: "CeilingRegistry",
    abi: contract.abi,
    bytecode: `0x${contract.evm.bytecode.object}`,
  }, null, 2)}\n`,
);
console.log("CeilingRegistry.sol COMPILE PASS");
console.log("Artifact artifacts/CeilingRegistry.json");
