import * as s from "effect/Schema";
import * as models from "./hetzner/hetznerModels.js";
import { protoSafeParse } from "@blaahaj/json";
import { cliMap } from "./hetzner/hcloud.js";

const modelName = process.argv[2];
if (!modelName) {
  for (const [cliName, modelName] of Object.entries(cliMap)) {
    console.log(
      `hcloud ${cliName} list --output=json | node dist/testSchema.js ${modelName}`
    );
  }
  process.exit(0);
}

if (!(modelName in models)) throw new Error("Usage: thing MODEL");

let v = models[modelName as keyof typeof models];
if (!v) throw new Error("Usage: thing MODEL");

const schema = v as unknown as s.Schema<s.Any, s.Any>;

const allStdin = await new Promise<Buffer>((resolve, reject) => {
  let b = Buffer.of();
  process.stdin.on("data", (chunk) => (b = Buffer.concat([b, chunk])));
  process.stdin.on("end", () => resolve(b));
  process.stdin.on("error", (error) => reject(error));
});

let unknownData = protoSafeParse(allStdin.toString("utf-8"));

if (!Array.isArray(unknownData)) unknownData = [unknownData];

console.log(`Parsing stdin as ${modelName}`);
let ok = true;

for (const item of unknownData) {
  try {
    const answer = s.decodeSync(schema)(item);
    console.dir({ answer }, { depth: 10 });
  } catch (error) {
    console.error(error);
    ok = false;
  }
}

if (!ok) process.exit(1);
