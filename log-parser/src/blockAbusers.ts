import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import split2 from "split2";
import { analyseEximMainLogLine } from "./analyseEximMainLogLine.js";
import runAndCapture from "./runAndCapture.js";

const blockIp = async (ipToBlock: string, payload: object) => {
  // sudo ipset create blocked_from_smtp2 hash:ip comment counters timeout 86400
  // sudo iptables-save | sed -e 's/blocked_from_smtp/blocked_from_smtp2/'  | sudo iptables-restore

  // Max allowed size is 255 characters
  const comment = JSON.stringify(payload)
    .replaceAll('"', "❗️")
    .substring(0, 255);

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
    r.stderr.includes("Element cannot be added to the set: it's already added")
  ) {
    console.debug(
      `Didn't add ${ipToBlock} to the block list, because it's already there`
    );
  } else {
    console.error(`Failed to add ${ipToBlock} to the block list:`, r);
  }
};

await pipeline(
  process.stdin,
  split2(),
  new Transform({
    objectMode: true,
    async transform(text: string, _, callback) {
      const analysis = analyseEximMainLogLine(text);
      console.log(JSON.stringify({ text, analysis }));

      if (
        analysis &&
        analysis.type === "timestamped" &&
        analysis.body.analysis &&
        analysis.body.analysis.type === "smtp_protocol_error" &&
        analysis.body.analysis.errorText.endsWith(
          " command used when not advertised"
        )
      ) {
        await blockIp(analysis.body.analysis.remoteIpAddress, {
          timestamp: analysis.timestamp,
          type: analysis.body.analysis.type,
          errorText: analysis.body.analysis.errorText,
          badCommand: analysis.body.analysis.command,
        });
      }

      if (
        analysis?.type == "timestamped" &&
        analysis.body.analysis?.type === "acl_smtp_mail" &&
        analysis.body.analysis.mailFrom === "spameri@tiscali.it"
      ) {
        await blockIp(analysis.body.analysis.remoteIpAddress, {
          timestamp: analysis.timestamp,
          type: analysis.body.analysis.type,
          mailFrom: analysis.body.analysis.mailFrom,
        });
      }

      callback(null);
    },
  }),
  process.stdout
);
