import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import split2 from "split2";
import { analyseEximMainLogLine } from "./parse.js";
import runAndCapture from "./runAndCapture.js";

await pipeline(
  process.stdin,
  split2(),
  new Transform({
    objectMode: true,
    async transform(text: string, _, callback) {
      const analysis = analyseEximMainLogLine(text);
      console.log(JSON.stringify({ text, analysis }));

      if (
        analysis.type === "timestamped" &&
        analysis.text.type === "smtp_protocol_error" &&
        analysis.text.errorText.endsWith(" command used when not advertised")
      ) {
        // sudo ipset create blocked_from_smtp2 hash:ip comment counters timeout 86400
        // sudo iptables-save | sed -e 's/blocked_from_smtp/blocked_from_smtp2/'  | sudo iptables-restore

        const payload = {
          timestamp: analysis.timestamp,
          type: analysis.text.type,
          errorText: analysis.text.errorText,
          badCommand: analysis.text.command,
        };

        // Max allowed size is 255 characters
        const comment = JSON.stringify(payload)
          .replaceAll('"', "❗️")
          .substring(0, 255);

        const ipToBlock = analysis.text.remoteIpAddress;

        const r = (
          await runAndCapture(
            "sudo",
            [
              "ipset",
              "add",
              "blocked_from_smtp2",
              ipToBlock,
              "timeout",
              (86400 * 7).toString(),
              "comment",
              comment,
            ],
            {
              stdinData: Buffer.of(),
            }
          )
        ).decode("utf-8");

        if (r.succeeded) {
          console.info(`Added ${ipToBlock} to the block list`);
        } else if (
          r.stderr.includes(
            "Element cannot be added to the set: it's already added"
          )
        ) {
          console.debug(
            `Didn't add ${ipToBlock} to the block list, because it's already there`
          );
        } else {
          console.error(`Failed to add ${ipToBlock} to the block list:`, r);
        }
      }

      callback(null);
    },
  }),
  process.stdout
);
