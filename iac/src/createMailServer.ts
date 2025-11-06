import { singleShotJson } from "./smee/index.js";
import { readFile } from "fs/promises";
import { protoSafeParse } from "@blaahaj/json";
import { Server } from "./hetzner/hetznerModels.js";
import { decodeUnknownPromise, Struct } from "effect/Schema";
import { addNewServerToKnownHosts } from "./ssh/sshKnownHosts.js";
import type { CloudInitPhoneHome } from "./cloudInit.js";
import runAndCapture from "./runAndCapture.js";
import { url } from "inspector";
import { gzip } from "zlib";
import { promisify } from "util";

const createServer = (cloudInit: string): Promise<string> =>
  runAndCapture(
    "hcloud",
    [
      "server",
      "create",
      "--output=json",
      "--firewall=jess-firewall-1",
      "--image=ubuntu-24.04",
      "--location=hel1",
      `--name=pat-${new Date().getTime()}`,
      "--ssh-key=Hetzner 20251021",
      "--start-after-create",
      "--type=cax11",
      "--user-data-from-file=-",
    ],
    { stdinData: Buffer.from(cloudInit, "utf-8") }
  ).then((r) => r.assertSuccess().decode("utf-8").stdout);

const buildCloudInit = async (phoneHomeUrl: string): Promise<string> => {
  let cloudInit = await readFile("./etc/cloud-init.yml", "utf-8");
  let eximConf = await readFile("./etc/exim4.conf", "utf-8");

  const base64GzippedEximConfig = (
    await promisify(gzip)(Buffer.from(eximConf, "utf-8"))
  ).toString("base64");

  return cloudInit
    .replaceAll(/\bPHONE_HOME_URL\b/g, phoneHomeUrl)
    .replaceAll(/\bBASE64_GZIPPED_EXIM_CONFIG\b/g, base64GzippedEximConfig);
};

const createMailServer = async (): Promise<{
  server: Server;
  phoneHome: CloudInitPhoneHome;
}> => {
  let stdoutTriple = Promise.withResolvers<string>();

  const phoneHomePromise = singleShotJson<CloudInitPhoneHome>(
    async (phoneHomeUrl) => {
      console.log(await buildCloudInit(phoneHomeUrl));
      return stdoutTriple.resolve(
        createServer(await buildCloudInit(phoneHomeUrl))
      );
    }
  );

  const server = await stdoutTriple.promise
    .then((str) => protoSafeParse(str))
    .then((unknownData) =>
      decodeUnknownPromise(Struct({ server: Server }))(unknownData)
    )
    .then((s) => s.server);
  console.log(`Server ${server.id} created: ${server.public_net.ipv4.ip}`);

  const phoneHome = await phoneHomePromise;
  console.log(`Received phone-home from ${phoneHome.instance_id}`);

  return {
    server,
    phoneHome,
  };
};

const r = await createMailServer();

// console.dir({ r }, { depth: 12 });

await addNewServerToKnownHosts(r.server.public_net.ipv4.ip, [
  r.phoneHome.pub_key_ecdsa,
  r.phoneHome.pub_key_ed25519,
  r.phoneHome.pub_key_rsa,
]);

console.log(`Ready. To log in, use: ssh ${r.server.public_net.ipv4.ip}`);
