import { writeFileSync } from "fs";
import { resolve } from "path";
const file = resolve(".next/export-detail.json");
const outDirectory = resolve(".next");
writeFileSync(file, JSON.stringify({ version: 1, outDirectory, success: true }));
console.log("wrote", file, "outDirectory=" + outDirectory);
