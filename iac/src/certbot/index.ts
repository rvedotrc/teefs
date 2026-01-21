// import { stat } from "node:fs/promises";
// import runAndCapture from "../runAndCapture.js";
// import { execFile } from "node:child_process";

// export type CertbotFiles = {
//   readonly chain: string;
//   readonly cert: string;
//   readonly privkey: string;
//   readonly fullchain: string;
// };

// export const fileExists = (path: string) =>
//   stat(path).then(
//     (s) => s.isFile(),
//     () => false,
//   );

// export const alreadyProvisioned = async ({
//   baseDir,
//   serverName,
// }: {
//   baseDir: string;
//   serverName: string;
// }): Promise<CertbotFiles | null> => {
//   const serverDir = `${baseDir}/var/config/live/${serverName}`;
//   const certbotFiles = certbotFilesFor(serverDir);

//   const existence = await Promise.all(
//     Object.values(certbotFiles).map(fileExists),
//   );

//   return existence.every(Boolean) ? certbotFiles : null;
// };

// export const provision = async ({
//   baseDir,
//   serverName,
// }: {
//   baseDir: string;
//   serverName: string;
// }): Promise<CertbotFiles> => {
//   const serverDir = `${baseDir}/var/config/live/${serverName}`;

//   await execFile(
//     `./certbot`,
//     [
//       "certonly",
//       "--manual",
//       "--preferred-challenges",
//       "dns",
//       "--manual-auth-hook",
//       "./with-hcloud ./manual-auth-hook",
//       "--manual-cleanup-hook",
//       "./with-hcloud ./manual-cleanup-hook",
//       "--domains",
//       serverName,
//     ],
//     { cwd: baseDir },
//   );
// };

// export const certbotFilesFor = (serverDir: string): CertbotFiles => ({
//   chain: `${serverDir}/chain.pem`,
//   cert: `${serverDir}/cert.pem`,
//   privkey: `${serverDir}/privkey.pem`,
//   fullchain: `${serverDir}/fullchain.pem`,
// });

// export const findOrProvisionCert = async ({
//   baseDir,
//   serverName,
// }: {
//   baseDir: string;
//   serverName: string;
// }): Promise<CertbotFiles> => {
//   return (
//     (await alreadyProvisioned({ baseDir, serverName })) ??
//     (await provision({ baseDir, serverName }))
//   );
// };
