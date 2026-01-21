import { singleShotJson } from "./smee/index.js";
import { protoSafeParse } from "@blaahaj/json";
import { Server } from "./hetzner/model/index.js";
import { decodeUnknownPromise, Struct } from "effect/Schema";
import { addNewServerToKnownHosts } from "./ssh/sshKnownHosts.js";
import {
  CloudInitLongStatus,
  type CloudInitPhoneHome,
} from "./cloud-init/cloudInitSchema.js";
import runAndCapture from "./runAndCapture.js";
import writeFileAtomic from "write-file-atomic";
import { buildCloudInit } from "./buildCloudInit.js";
import { configureDns } from "./configureDns.js";

const createServer = (hostname: string, cloudInit: string): Promise<string> =>
  runAndCapture(
    "hcloud",
    [
      "server",
      "create",
      "--output=json",
      // "--firewall=jess-firewall-1",
      "--image=ubuntu-24.04",
      "--location=hel1",
      `--name=${hostname}`,
      "--ssh-key=Hetzner 20251021",
      "--start-after-create",
      "--type=cax11",
      "--user-data-from-file=-",
    ],
    { stdinData: Buffer.from(cloudInit, "utf-8") },
  ).then((r) => r.decode("utf-8").assertSuccess().stdout);

const createMailServer = async ({
  hostname,
}: {
  hostname: string;
}): Promise<{
  server: Server;
  phoneHome: CloudInitPhoneHome;
}> => {
  let stdoutTriple = Promise.withResolvers<string>();

  const phoneHomePromise = singleShotJson<CloudInitPhoneHome>(
    async (phoneHomeUrl) => {
      const cloudInit = await buildCloudInit(phoneHomeUrl);
      console.log(cloudInit);
      return stdoutTriple.resolve(createServer(hostname, cloudInit));
    },
  );

  const server = await stdoutTriple.promise
    .then((str) => protoSafeParse(str))
    .then((unknownData) =>
      decodeUnknownPromise(Struct({ server: Server }))(unknownData),
    )
    .then((s) => s.server);
  console.log(
    `Server ${server.id} "${hostname}" created: ${server.public_net.ipv4.ip} ${server.public_net.ipv6.ip}`,
  );

  await configureDns(
    hostname,
    "teefs.eu",
    server.public_net.ipv4,
    server.public_net.ipv6,
  );

  const phoneHome = await phoneHomePromise;
  console.log(`Received phone-home from ${phoneHome.instance_id}`);

  return {
    server,
    phoneHome,
  };
};

const main = async ({
  hostname,
}: {
  hostname: string | undefined;
}): Promise<void> => {
  if (!hostname) throw new Error("No hostname provided");

  const r = await createMailServer({ hostname });

  // console.dir({ r }, { depth: 12 });

  const sshPort = 2224;
  const sshOptions = [
    "-p",
    String(sshPort),
    "-l",
    "root",
    `${hostname}.teefs.eu`,
  ] as const;

  await addNewServerToKnownHosts(`${hostname}.teefs.eu`, sshPort, [
    r.phoneHome.pub_key_ecdsa,
    r.phoneHome.pub_key_ed25519,
    r.phoneHome.pub_key_rsa,
  ]);

  console.log(`Ready. To log in, use: ssh ${sshOptions.join(" ")}`);

  // TODO: ssh in and run "cloud-init status", check that it is "????"
  // running, done, disabled, error
  // cloud-init status --long --format=json
  // /var/log/cloud-init.log
  // /var/log/cloud-init-output.log

  const cloudInitStatus = (
    await runAndCapture(
      "ssh",
      [...sshOptions, "cloud-init", "status", "--long", "--format=json"],
      {
        stdinData: Buffer.of(),
      },
    )
  ).decode("utf-8");

  if (!cloudInitStatus.succeeded) console.dir(cloudInitStatus);

  const cloudInitStatusData = await decodeUnknownPromise(CloudInitLongStatus)(
    protoSafeParse(cloudInitStatus.stdout),
  );

  const logText = (
    await runAndCapture(
      "ssh",
      [...sshOptions, "cat", "/var/log/cloud-init.log"],
      {
        stdinData: Buffer.of(),
      },
    )
  )
    .decode("utf-8")
    .assertSuccess().stdout;

  const outputLogText = (
    await runAndCapture(
      "ssh",
      [...sshOptions, "cat", "/var/log/cloud-init-output.log"],
      {
        stdinData: Buffer.of(),
      },
    )
  )
    .decode("utf-8")
    .assertSuccess().stdout;

  await writeFileAtomic(
    "o.json",
    JSON.stringify({
      cloudInitStatus,
      cloudInitStatusData,
      logText,
      outputLogText,
    }),
    "utf-8",
  );

  console.log("Wrote to o.json");
  console.log("Result is:", cloudInitStatusData.status);

  // .cloudInitStatus.stdout | fromjson
  // tags?
};

main({ hostname: process.argv[2] }).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
