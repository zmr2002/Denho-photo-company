import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../src/api-contract/api-schema.ts", import.meta.url);
const source = await readFile(path, "utf8");
const firstDeclaration = source.indexOf("export interface paths");

if (firstDeclaration < 0) {
  throw new Error("API schema does not contain the expected paths declaration");
}

await writeFile(path, source.slice(firstDeclaration));
