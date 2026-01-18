import assert from "node:assert";
import * as t from "node:test";
import { analyseTimestampedText } from "./analyseTimestampedText.js";

t.suite("analyseTimestampedText", () => {
  //   t.it("handles SMTP with nulls", () => {
  //     const l = `SMTP syntax error in "\\300\\024\\023\\001???" H=[45.82.78.105]:41768 I=[46.62.234.65]:25 Ci=105546 NUL character(s) present (shown as '?')`;
  //     assert.deepStrictEqual(analyseTimestampedText(l), {
  //       type: "smtp_syntax_error",
  //       ptr: undefined,
  //       helo: undefined,
  //       remoteIpAddress: "45.82.78.105",
  //       remotePort: "41768",
  //       localIpAddress: "46.62.234.65",
  //       localPort: "25",
  //       connectionId: "105546",
  //       garbage: '"\\300\\024\\023\\001???"',
  //       errorText: "NUL character(s) present (shown as '?')",
  //     });
  //   });

  //   // Remote host forms:
  //   // H=[167.94.138.160]:49454
  //   // H=(User) [196.251.83.16]:53650
  //   // H=scan.cypex.ai [3.130.96.91]:52562
  //   // H=ec2-18-97-5-34.compute-1.amazonaws.com (localhost) [18.97.5.34]:45842
  //   // t.it("remote host with ptr and helo", () => {
  //   //   const l =
  //   //     "SMTP connection Ci=146197 from ec2-18-97-5-34.compute-1.amazonaws.com (localhost) [18.97.5.34]:45842 I=[46.62.234.65]:25 lost D=0.717s";
  //   //   assert.deepStrictEqual(analyseTimestampedText(l), {});
  //   // });
  //   t.suite("Remote host forms", () => {
  //     const makeLine = (host: string) =>
  //       `SMTP syntax error in "GET / HTTP/1.1" H=${host} I=[46.62.234.65]:25 Ci=104229 unrecognized command`;
  //     const check = (host: string, payload: object) =>
  //       t.it(`understands ${host}`, () => {
  //         const r = analyseTimestampedText(makeLine(host));
  //         assert.strictEqual(r.type, "smtp_syntax_error");
  //         assert.deepStrictEqual(r, {
  //           type: "smtp_syntax_error",
  //           garbage: '"GET / HTTP/1.1"',
  //           errorText: "unrecognized command",
  //           ...payload,
  //           localIpAddress: "46.62.234.65",
  //           localPort: "25",
  //           connectionId: "104229",
  //         });
  //       });
  //     check("[3.130.96.91]:37268", {
  //       ptr: undefined,
  //       helo: undefined,
  //       remoteIpAddress: "3.130.96.91",
  //       remotePort: "37268",
  //     });
  //     check("(localhost) [3.130.96.91]:37268", {
  //       ptr: undefined,
  //       helo: "localhost",
  //       remoteIpAddress: "3.130.96.91",
  //       remotePort: "37268",
  //     });
  //     check("scan.cypex.ai [3.130.96.91]:37268", {
  //       ptr: "scan.cypex.ai",
  //       helo: undefined,
  //       remoteIpAddress: "3.130.96.91",
  //       remotePort: "37268",
  //     });
  //     check("scan.cypex.ai (localhost) [3.130.96.91]:37268", {
  //       ptr: "scan.cypex.ai",
  //       helo: "localhost",
  //       remoteIpAddress: "3.130.96.91",
  //       remotePort: "37268",
  //     });
  //   });

  t.it("returns null otherwise", () =>
    assert.deepStrictEqual(analyseTimestampedText("what is this?"), null)
  );
});
