import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getAllDocs } from "../src/lib/docs/content";

const outputDirectory = path.join(process.cwd(), "public");
const outputPath = path.join(outputDirectory, "docs-search-index.json");

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  outputPath,
  `${JSON.stringify(
    getAllDocs().map(({ content: _content, ...doc }) => doc),
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Generated documentation search index: ${outputPath}`);
