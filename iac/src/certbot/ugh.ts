// import { readdir, stat } from "node:fs/promises";
// import * as fp from "unnecessarily-reinventing-fp";

// export const certbot = (baseDir: string) => {
//   const configDir = `${baseDir}/var/configs`;
//   const workDir = `${baseDir}/var/work`;
//   const logsDir = `${baseDir}/var/logs`;

//   const doesFileExist = async (path: string) => {
//     const stats = await fp.tryThrowCatch.doTryAsync(() => stat(path));
//     return fp.either.isRight(stats) && stats.right.isFile();
//   };

//   const isCertComplete = async (path: string) =>
//     Promise.all(
//       ["chain.pem", "cert.pem", "privkey.pem", "fullchain.pem"].map((f) =>
//         doesFileExist(`${path}/${f}`),
//       ),
//     ).then((r) => r.every(Boolean));

//   return {
//     listNames: async () =>
//       fp.pipeAndFlow.flowAsync(
//         fp.tryThrowCatch.doTryAsync(() => readdir(`${configDir}/live`)),
//         fp.either.mapRightAsync((names) =>
//           Promise.all(
//             names.map((name) =>
//               isCertComplete(`${configDir}/live/${name}`).then(
//                 (isComplete) => ({ name, isComplete }),
//               ),
//             ),
//           ),
//         ),
//         fp.either.mapRightAsync(async (r) =>
//           r.filter((t) => t.isComplete).map((t) => t.name),
//         ),
//       ),
//     getPaths: (name: string) => ({
//       chain: `${configDir}/live/${name}/chain.pem`,
//       cert: `${configDir}/live/${name}/cert.pem`,
//       privateKey: `${configDir}/live/${name}/privkey.pem`,
//       fullChain: `${configDir}/live/${name}/fullchain.pem`,
//     }),
//     provision: (name: string) =>
//       provision({ configDir, logsDir, workDir, name }),
//   };
// };
