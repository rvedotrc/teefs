import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import split2 from "split2";
import { analyseEximMainLogLine } from "./index.js";

await pipeline(
  process.stdin,
  split2(),
  new Transform({
    objectMode: true,
    async transform(text: string, _, callback) {
      const analysis = analyseEximMainLogLine(text);
      console.log(JSON.stringify({ text, analysis }));
      callback(null);
    },
  }),
  process.stdout
);
