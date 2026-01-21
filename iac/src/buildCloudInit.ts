import { readFile } from "node:fs/promises";
import { promisify } from "util";
import { gzip } from "zlib";
import runAndCapture from "./runAndCapture.js";

const b64gzipFromBuffer = async (buffer: Buffer<ArrayBufferLike>) =>
  (await promisify(gzip)(buffer)).toString("base64");

//   const b64gzipFromFile = async (path: string) =>
//     b64gzipFromBuffer(await readFile(path));

export const buildCloudInit = async (phoneHomeUrl: string): Promise<string> => {
  let cloudInit = await readFile("./etc/cloud-init.yml", "utf-8");

  // We use "gtar" to avoid archiving the various MacOS extensions.
  // Or, we could use "tar --no-fflags --no-xattrs --no-mac-metadata".
  // Or we could just ignore the warnings on unpack.
  const tarFileResult = await runAndCapture("gtar", ["-cf-", "my"], {
    cwd: "./etc/exim4",
    stdinData: Buffer.of(),
  });

  if (!tarFileResult.succeeded) {
    throw new Error(`tar failed: ${tarFileResult.stderr.toString("utf-8")}`);
  }

  return cloudInit
    .replaceAll(/\bPHONE_HOME_URL\b/g, phoneHomeUrl)
    .replaceAll(
      /\bEXIM_MY_TAR\b/g,
      await b64gzipFromBuffer(tarFileResult.stdout),
    );
};
