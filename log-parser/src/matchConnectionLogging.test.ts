import assert from "node:assert";
import * as t from "node:test";
import { analyseTimestampedText } from "./analyseTimestampedText.js";
import { connectionId } from "./parts.js";

t.suite("matchConnectionLogging (via analyseTimestampedText)", () => {
  t.it("connection_from", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "SMTP connection from [64.62.156.38]:3010 I=[46.62.234.65]:25 Ci=175346 (TCP/IP connection count = 1)"
      ),
      {
        type: "connection_from",
        remoteIpAddress: "64.62.156.38",
        remotePort: "3010",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "175346",
        connectionCount: "1",
      }
    )
  );

  t.it("no_ptr", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("no host name found for IP address 178.16.53.46"),
      {
        type: "no_ptr",
        remoteIpAddress: "178.16.53.46",
      }
    )
  );

  t.it("too_many_unrecognized_commands", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'SMTP call from scan.cypex.ai [3.130.96.91]:46642 I=[46.62.234.65]:25 Ci=166533 dropped: too many unrecognized commands (last was "Accept: */*")'
      ),
      {
        type: "too_many_unrecognized_commands",
        ptr: "scan.cypex.ai",
        helo: undefined,
        remoteIpAddress: "3.130.96.91",
        remotePort: "46642",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "166533",
        lastCommand: "Accept: */*",
      }
    )
  );

  t.it("too_many_syntax_or_protocol_errors", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'SMTP call from scan.cypex.ai [3.130.96.91]:46642 I=[46.62.234.65]:25 Ci=166533 dropped: too many syntax or protocol errors (last command was "\\?\\b", NULL)'
      ),
      {
        type: "too_many_syntax_or_protocol_errors",
        ptr: "scan.cypex.ai",
        helo: undefined,
        remoteIpAddress: "3.130.96.91",
        remotePort: "46642",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "166533",
      }
    )
  );

  // "SMTP connection Ci=175433 from ec2-98-80-4-71.compute-1.amazonaws.com (localhost) [98.80.4.71]:42050 I=[46.62.234.65]:25 lost D=0.397s"

  t.it("smtp_syntax_error", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'SMTP syntax error in "GET / HTTP/1.1" H=scan.cypex.ai [3.130.96.91]:46642 I=[46.62.234.65]:25 Ci=166533 unrecognized command'
      ),
      {
        type: "smtp_syntax_error",
        garbage: "GET / HTTP/1.1",
        ptr: "scan.cypex.ai",
        helo: undefined,
        remoteIpAddress: "3.130.96.91",
        remotePort: "46642",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "166533",
        errorText: "unrecognized command",
      }
    )
  );

  t.it("smtp_protocol_error", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'SMTP protocol error in "AUTH LOGIN" H=(User) [213.209.157.207]:58870 I=[46.62.234.65]:25 Ci=111810 AUTH command used when not advertised'
      ),
      {
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
      }
    )
  );

  t.it("closed_by_quit", () =>
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
        durationUnit: "s",
      }
    )
  );

  t.it("no_mail_in_smtp_connection (without commands)", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "no MAIL in SMTP connection from [45.140.17.97]:64899 I=[46.62.234.65]:25 Ci=157361 D=0.003s"
      ),
      {
        type: "no_mail_in_smtp_connection",
        ptr: undefined,
        helo: undefined,
        remoteIpAddress: "45.140.17.97",
        remotePort: "64899",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "157361",
        duration: "0.003",
        durationUnit: "s",
        commands: undefined,
      }
    )
  );

  t.it("no_mail_in_smtp_connection (with commands)", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "no MAIL in SMTP connection from [45.140.17.97]:64899 I=[46.62.234.65]:25 Ci=157361 D=0.003s C=EHLO,AUTH,QUIT"
      ),
      {
        type: "no_mail_in_smtp_connection",
        ptr: undefined,
        helo: undefined,
        remoteIpAddress: "45.140.17.97",
        remotePort: "64899",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "157361",
        duration: "0.003",
        durationUnit: "s",
        commands: "EHLO,AUTH,QUIT",
      }
    )
  );

  t.it("smtp_command_timeout", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "SMTP command timeout on connection from crawler175.deepfield.net [216.180.246.175]:21060 I=[46.62.234.65]:25 Ci=167041 D=5m"
      ),
      {
        type: "smtp_command_timeout",
        ptr: "crawler175.deepfield.net",
        helo: undefined,
        remoteIpAddress: "216.180.246.175",
        remotePort: "21060",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "167041",
        duration: "5",
        durationUnit: "m",
      }
    )
  );

  t.it("smtp_connection_lost (without error)", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "SMTP connection Ci=174917 from [78.153.140.207]:47398 I=[46.62.234.65]:25 lost D=0.082s"
      ),
      {
        type: "smtp_connection_lost",
        ptr: undefined,
        helo: undefined,
        remoteIpAddress: "78.153.140.207",
        remotePort: "47398",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "174917",
        duration: "0.082",
        durationUnit: "s",
        errorText: undefined,
      }
    )
  );

  t.it("smtp_connection_lost (with error)", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "SMTP connection Ci=174917 from [78.153.140.207]:47398 I=[46.62.234.65]:25 lost (error: Connection reset by peer) D=0.082s"
      ),
      {
        type: "smtp_connection_lost",
        ptr: undefined,
        helo: undefined,
        remoteIpAddress: "78.153.140.207",
        remotePort: "47398",
        localIpAddress: "46.62.234.65",
        localPort: "25",
        connectionId: "174917",
        duration: "0.082",
        durationUnit: "s",
        errorText: "Connection reset by peer",
      }
    )
  );
});
