import assert from "node:assert";
import * as t from "node:test";
import { analyseEximMainLogLine } from "./analyseEximMainLogLine.js";

t.suite("analyseEximMainLogLine", () => {
  t.it("recognises timestamped lines", () =>
    assert.deepStrictEqual(
      analyseEximMainLogLine(
        "2025-11-05 07:14:23.534 [113690] ACL_SMTP_CONNECT [196.251.83.16]:56258"
      ),
      {
        type: "timestamped",
        timestamp: "2025-11-05 07:14:23.534",
        connection_id: "113690",
        body: {
          text: "ACL_SMTP_CONNECT [196.251.83.16]:56258",
          analysis: {
            type: "acl_smtp_connect",
            remoteIpAddress: "196.251.83.16",
            remotePort: "56258",
          },
        },
      }
    )
  );

  t.suite("non-timestamped lines", () => {
    t.it("no_tls_certificate_suggestion", () =>
      assert.deepStrictEqual(
        analyseEximMainLogLine(
          " Suggested action: either install a certificate or change tls_advertise_hosts option"
        ),
        {
          type: "no_tls_certificate_suggestion",
        }
      )
    );
  });

  t.it("returns null otherwise", () =>
    assert.deepStrictEqual(analyseEximMainLogLine("what is this?"), null)
  );
});
