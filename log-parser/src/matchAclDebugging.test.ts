import assert from "node:assert";
import * as t from "node:test";
import { analyseTimestampedText } from "./analyseTimestampedText.js";

t.suite("matchAclDebugging (via analyseTimestampedText)", () => {
  t.it("handles ACL_SMTP_CONNECT", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("ACL_SMTP_CONNECT [196.251.83.16]:53895"),
      {
        type: "acl_smtp_connect",
        remoteIpAddress: "196.251.83.16",
        remotePort: "53895",
      }
    )
  );

  t.it("handles ACL_SMTP_HELO", () =>
    assert.deepStrictEqual(
      analyseTimestampedText('ACL_SMTP_HELO [196.251.83.16]:53895 "User"'),
      {
        type: "acl_smtp_helo",
        remoteIpAddress: "196.251.83.16",
        remotePort: "53895",
        helo: "User",
      }
    )
  );

  t.it("handles ACL_SMTP_STARTTLS", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("ACL_SMTP_STARTTLS [98.80.4.71]:42050"),
      {
        type: "acl_smtp_starttls",
        remoteIpAddress: "98.80.4.71",
        remotePort: "42050",
      }
    )
  );

  t.it("handles ACL_SMTP_MAIL", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'ACL_SMTP_MAIL [154.23.141.175]:56504 "spameri@tiscali.it"'
      ),
      {
        type: "acl_smtp_mail",
        remoteIpAddress: "154.23.141.175",
        remotePort: "56504",
        mailFrom: "spameri@tiscali.it",
      }
    )
  );

  t.it("handles ACL_SMTP_RCPT", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'ACL_SMTP_RCPT [154.23.141.175]:56504 "spameri@tiscali.it"'
      ),
      {
        type: "acl_smtp_rcpt",
        remoteIpAddress: "154.23.141.175",
        remotePort: "56504",
        rcptTo: "spameri@tiscali.it",
      }
    )
  );

  t.it("handles ACL_SMTP_QUIT", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("ACL_SMTP_QUIT [98.80.4.71]:42050"),
      {
        type: "acl_smtp_quit",
        remoteIpAddress: "98.80.4.71",
        remotePort: "42050",
      }
    )
  );

  t.it("handles ACL_SMTP_NOTQUIT", () =>
    assert.deepStrictEqual(
      analyseTimestampedText(
        'ACL_SMTP_NOTQUIT [98.80.4.71]:42050 "connection-lost"'
      ),
      {
        type: "acl_smtp_notquit",
        remoteIpAddress: "98.80.4.71",
        remotePort: "42050",
        reason: "connection-lost",
      }
    )
  );
});
