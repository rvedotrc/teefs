import assert from "node:assert";
import * as t from "node:test";

import {
  runExim,
  testAddress,
  ipv6Pattern,
  ipv4Pattern,
} from "./testHelpers.js";

t.suite("mail server", async () => {
  t.it("has a valid config", async () => {
    (await runExim(["-bV"])).assertSuccess();
  });

  t.it("uses the correct config file", async () => {
    assert(
      (await runExim(["-bV"])).stdout.includes(
        "\nConfiguration file is /etc/exim4/exim4.conf\n"
      )
    );
  });

  //   await testAddress("root", {
  //     verify: true,
  //     route: { transport: "maildir" },
  //   });

  await testAddress("support@exim.org", {
    verify: true,
    route: {
      router: "dns_lookup",
      transport: "remote_smtp",
      matches: [ipv6Pattern, ipv4Pattern],
    },
  });

  //   // dsn_from (default: Mail Delivery System <Mailer-Daemon@$qualify_domain>)
  //   // where qualify_domain defaults to primary_hostname
  //   // testAddress("Mailer-Daemon@teefs.eu"); // or maybe this should verify, but not route

  testAddress("postmaster@bad.domain.that.does.not.exist", {
    verify: false,
    route: false,
  });

  //
  testAddress("postmaster@teefs.eu", { verify: true, route: true });

  //   // teefs.eu
  //   // blaahaj.dk / blåhaj.dk aka xn--blhaj-nra.dk (punycode.encode("blåhaj"))
});
