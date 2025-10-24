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
  publicIPv4: string,
  publicKeys: string[]
) =>
  addToKnownHosts(
    join(process.env.HOME!, ".ssh", "known_hosts"),
    publicKeys.map((key) => `${publicIPv4} ${key.trim()}`)
  );
