import { writeFileSync } from "fs";
import { resolve } from "path";
const file = resolve(".next/export-detail.json");
const outDirectory = resolve(".next");
writeFileSync(file, JSON.stringify({ version: 1, outDirectory, success: false }));
console.log("wrote", file, "outDirectory=" + outDirectory);
