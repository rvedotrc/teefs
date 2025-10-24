import { singleShotJson } from "./smee/index.js";
import { readFile } from "fs/promises";
import { protoSafeParse, type JSONValue } from "@blaahaj/json";
import { Server } from "./hetzner/hetznerModels.js";
import {
  decodeUnknownPromise,
  Struct,
  type Any,
  type Never,
  type Schema,
  type Unknown,
} from "effect/Schema";
import { addNewServerToKnownHosts } from "./ssh/sshKnownHosts.js";
import type { CloudInitPhoneHome } from "./cloudInit.js";
import runAndCapture from "./runAndCapture.js";

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

const createMailServer = async (): Promise<{
  server: Server;
  phoneHome: CloudInitPhoneHome;
}> => {
  let stdoutTriple = Promise.withResolvers<string>();

  const phoneHomePromise = singleShotJson<CloudInitPhoneHome>(async (url) =>
    stdoutTriple.resolve(
      createServer(
        (await readFile("./cloud-init.yml", "utf-8")).replaceAll(
          /\bPHONE_HOME_URL\b/g,
          url
        )
      )
    )
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

console.log(`Ready. To log in, use: ssh root@${r.server.public_net.ipv4.ip}`);
