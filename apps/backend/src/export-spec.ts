import { writeFileSync } from "fs";
import { resolve } from "path";
import { app } from "./app";

const res = await app.request("/openapi.json");
const spec = await res.json();

const outPath = resolve(import.meta.dirname, "../../../docs/openapi.json");
writeFileSync(outPath, JSON.stringify(spec, null, 2) + "\n");

console.log(`OpenAPI spec written to ${outPath}`);
