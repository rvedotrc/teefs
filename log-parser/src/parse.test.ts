import assert from "node:assert";
import * as t from "node:test";
import { analyseEximMainLogLine, analyseTimestampedText } from "./parse.js";

t.suite("eximLogProcessing", () => {
  t.it("recognises timestamped lines", () => {
    const l =
      "2025-11-05 07:14:23.534 [113690] ACL_SMTP_CONNECT [196.251.83.16]:56258";

    assert.deepStrictEqual(analyseEximMainLogLine(l), {
      _input: l,
      type: "timestamped",
      timestamp: "2025-11-05 07:14:23.534",
      connection_id: "113690",
      text: {
        _input: "ACL_SMTP_CONNECT [196.251.83.16]:56258",
        type: "acl_smtp_connect",
        remoteIpAddress: "196.251.83.16",
        remotePort: "56258",
      },
    });
  });

  t.it("handles ACL_SMTP_CONNECT", () => {
    const l =
      "2025-11-05 05:51:26.431 [105878] ACL_SMTP_CONNECT [196.251.83.16]:53895";

    assert.deepStrictEqual(analyseEximMainLogLine(l), {
      _input: l,
      type: "timestamped",
      timestamp: "2025-11-05 05:51:26.431",
      connection_id: "105878",
      text: {
        _input: "ACL_SMTP_CONNECT [196.251.83.16]:53895",
        type: "acl_smtp_connect",
        remoteIpAddress: "196.251.83.16",
        remotePort: "53895",
      },
    });
  });

  t.it("handles SMTP with nulls", () => {
    const l = `SMTP syntax error in "\\300\\024\\023\\001???" H=[45.82.78.105]:41768 I=[46.62.234.65]:25 Ci=105546 NUL character(s) present (shown as '?')`;

    assert.deepStrictEqual(analyseTimestampedText(l), {
      type: "smtp_syntax_error",

      ptr: undefined,
      helo: undefined,
      remoteIpAddress: "45.82.78.105",
      remotePort: "41768",

      localIpAddress: "46.62.234.65",
      localPort: "25",

      connectionId: "105546",

      garbage: '"\\300\\024\\023\\001???"',
      errorText: "NUL character(s) present (shown as '?')",
    });
  });

  t.it("handles ACL_SMTP_HELO", () => {
    const l =
      '2025-11-05 05:51:26.431 [105878] ACL_SMTP_HELO [196.251.83.16]:53895 "User"';

    assert.deepStrictEqual(analyseEximMainLogLine(l), {
      _input: l,
      type: "timestamped",
      timestamp: "2025-11-05 05:51:26.431",
      connection_id: "105878",
      text: {
        _input: 'ACL_SMTP_HELO [196.251.83.16]:53895 "User"',
        type: "acl_smtp_helo",
        remoteIpAddress: "196.251.83.16",
        remotePort: "53895",
        helo: "User",
      },
    });
  });

  t.it("handles SMTP protocol error", () => {
    const l =
      'SMTP protocol error in "AUTH LOGIN" H=(User) [213.209.157.207]:58870 I=[46.62.234.65]:25 Ci=111810 AUTH command used when not advertised';

    assert.deepStrictEqual(analyseTimestampedText(l), {
      type: "smtp_protocol_error",
      command: "AUTH LOGIN",

      ptr: undefined,
      helo: "User",
      remoteIpAddress: "213.209.157.207",
      remotePort: "58870",

      localIpAddress: "46.62.234.65",
      localPort: "25",

      connectionId: "111810",

      errorText: "AUTH command used when not advertised",
    });
  });

  // Remote host forms:
  // H=[167.94.138.160]:49454
  // H=(User) [196.251.83.16]:53650
  // H=scan.cypex.ai [3.130.96.91]:52562
  // H=ec2-18-97-5-34.compute-1.amazonaws.com (localhost) [18.97.5.34]:45842

  // t.it("remote host with ptr and helo", () => {
  //   const l =
  //     "SMTP connection Ci=146197 from ec2-18-97-5-34.compute-1.amazonaws.com (localhost) [18.97.5.34]:45842 I=[46.62.234.65]:25 lost D=0.717s";

  //   assert.deepStrictEqual(analyseTimestampedText(l), {});
  // });

  t.suite("Remote host forms", () => {
    const makeLine = (host: string) =>
      `SMTP syntax error in "GET / HTTP/1.1" H=${host} I=[46.62.234.65]:25 Ci=104229 unrecognized command`;

    const check = (host: string, payload: object) =>
      t.it(`understands ${host}`, () => {
        const r = analyseTimestampedText(makeLine(host));
        assert.strictEqual(r.type, "smtp_syntax_error");

        assert.deepStrictEqual(r, {
          type: "smtp_syntax_error",
          garbage: '"GET / HTTP/1.1"',
          errorText: "unrecognized command",

          ...payload,

          localIpAddress: "46.62.234.65",
          localPort: "25",

          connectionId: "104229",
        });
      });

    check("[3.130.96.91]:37268", {
      ptr: undefined,
      helo: undefined,
      remoteIpAddress: "3.130.96.91",
      remotePort: "37268",
    });

    check("(localhost) [3.130.96.91]:37268", {
      ptr: undefined,
      helo: "localhost",
      remoteIpAddress: "3.130.96.91",
      remotePort: "37268",
    });

    check("scan.cypex.ai [3.130.96.91]:37268", {
      ptr: "scan.cypex.ai",
      helo: undefined,
      remoteIpAddress: "3.130.96.91",
      remotePort: "37268",
    });

    check("scan.cypex.ai (localhost) [3.130.96.91]:37268", {
      ptr: "scan.cypex.ai",
      helo: "localhost",
      remoteIpAddress: "3.130.96.91",
      remotePort: "37268",
    });
  });

  // SMTP connection from [18.97.5.34]:45842 I=[46.62.234.65]:25 Ci=146197 (TCP/IP connection count = 1)

  // no MAIL in SMTP connection from [45.140.17.97]:64899 I=[46.62.234.65]:25 Ci=157361 D=0.003s

  t.it("handles 'closed by QUIT'", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "SMTP connection Ci=175444 from (WIN-7N1FIECL6IC) [178.16.53.46]:54959 I=[46.62.234.65]:25 D=0.407s closed by QUIT"
      ),
      {
        type: "closed_by_quit",
        connectionId: "175444",

        ptr: undefined,
        helo: "WIN-7N1FIECL6IC",
        remoteIpAddress: "178.16.53.46",
        remotePort: "54959",

        localIpAddress: "46.62.234.65",
        localPort: "25",

        duration: "0.407",
      }
    )
  );
});
