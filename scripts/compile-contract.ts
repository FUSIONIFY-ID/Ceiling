import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import solc from "solc";

type SolcOutput = {
  contracts?: Record<string, Record<string, unknown>>;
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
assert.ok(
  output.contracts?.["CeilingRegistry.sol"]?.CeilingRegistry,
  "CeilingRegistry missing from compiler output",
);
console.log("CeilingRegistry.sol COMPILE PASS");
