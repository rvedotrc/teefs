import { PublicIPv4, type PublicIPv6 } from "./hetzner/model/networking.js";
import runAndCapture from "./runAndCapture.js";

const setForwardRecord = (
  domain: string,
  hostname: string,
  type: string,
  address: string,
) =>
  runAndCapture(
    "hcloud",
    [
      "zone",
      "rrset",
      "set-records",
      domain,
      hostname,
      type,
      `--record=${address}`,
    ],
    { stdinData: Buffer.of() },
  ).then((r) => r.decode("utf-8").assertSuccess());

const setReverseRecord = (
  domain: string,
  hostname: string,
  publicIpId: number,
) =>
  runAndCapture(
    "hcloud",
    [
      "primary-ip",
      "set-rdns",
      `--hostname=${hostname}.${domain}`,
      String(publicIpId),
    ],
    { stdinData: Buffer.of() },
  ).then((r) => r.decode("utf-8").assertSuccess());

export const configureDns = async (
  hostname: string,
  domain: string,
  ipv4: PublicIPv4,
  ipv6: PublicIPv6,
) => {
  await Promise.all([
    setForwardRecord(domain, hostname, "A", ipv4.ip),
    setForwardRecord(domain, hostname, "AAAA", ipv6.ip.split("/")[0]!),
    setReverseRecord(domain, hostname, ipv4.id),
    setReverseRecord(domain, hostname, ipv6.id),
  ]);
};
