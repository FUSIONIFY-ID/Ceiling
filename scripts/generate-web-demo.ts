import { mkdir, writeFile } from "node:fs/promises";

import { createDemoSession } from "../src/demo-session.js";

const outputDirectory = new URL("../web/generated/", import.meta.url);
const outputPath = new URL("demo-session.json", outputDirectory);

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(await createDemoSession(), null, 2)}\n`,
);

console.log("Web demo artifact generated");
