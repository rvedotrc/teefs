import { readFile } from "fs/promises";
import { join } from "path";
import writeFileAtomic from "write-file-atomic";

const addToKnownHosts = async (knownHostsFile: string, entries: string[]) => {
  const oldKnownHosts = await readFile(knownHostsFile, "utf-8");
  const newKnownHosts = oldKnownHosts.trim() + "\n" + entries.join("\n") + "\n";

  await writeFileAtomic(knownHostsFile, newKnownHosts, {
    mode: 0o600,
    encoding: "utf-8",
  });
};

export const addNewServerToKnownHosts = async (
  hostname: string,
  port: number,
  publicKeys: string[],
) =>
  addToKnownHosts(
    join(process.env.HOME!, ".ssh", "known_hosts"),
    publicKeys.map(
      (key) =>
        `${port === 22 ? hostname : `[${hostname}]:${port}`} ${key.trim()}`,
    ),
  );
