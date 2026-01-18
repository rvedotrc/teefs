import assert from "node:assert";
import * as t from "node:test";
import { analyseTimestampedText } from "./analyseTimestampedText.js";

t.suite("startupAndShutdown (via analyseTimestampedText)", () => {
  t.it("cwd_and_args", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("cwd=/ 3 args: /usr/sbin/exim4 -bdf -q30m"),
      {
        type: "cwd_and_args",
        cwd: "/",
        argCount: "3",
        argText: "/usr/sbin/exim4 -bdf -q30m",
      }
    )
  );

  t.it("no_server_certificate", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "Warning: No server certificate defined; will use a selfsigned one."
      ),
      {
        type: "no_server_certificate",
      }
    )
  );

  // This one's not timestamped, so it's handled by "mainlog"
  //  Suggested action: either install a certificate or change tls_advertise_hosts option

  t.it("daemon_started", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        "exim 4.97 daemon started: pid=174151, -q30m, listening for SMTP on port 25 (IPv6 and IPv4)"
      ),
      {
        type: "daemon_started",
        version: "4.97",
        pid: "174151",
      }
    )
  );

  t.it("sighup_received", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("pid 727: SIGHUP received: re-exec daemon"),
      {
        type: "sighup_received",
        pid: "727",
      }
    )
  );
});
