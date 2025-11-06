import assert, * as a from "node:assert";
import * as t from "node:test";

import runAndCapture, { type CaptureResult } from "./runAndCapture.js";

export const runExim = async (
  args: string[]
): Promise<CaptureResult<string>> => {
  const output = (
    await runAndCapture("sudo", ["exim4", ...args], {
      stdinData: Buffer.of(),
    })
  ).decode("utf-8");

  //   console.log(
  //     output.stdout.trim() +
  //       `\ncode=${output.child.code} signal=${output.child.signal}`
  //   );

  return output;
};

export const ipv4Pattern = /\[\d+\.\d+\.\d+\.\d+\]/;
export const ipv6Pattern = /\[[0-9a-f]*:[0-9a-f:]*\]/i;

export const testAddress = async (
  address: string,
  opts: {
    verify?: boolean;
    route?:
      | boolean
      | {
          router?: string;
          transport?: string;
          matches?: readonly RegExp[];
        };
  }
) => {
  t.suite(address, async () => {
    if (opts.verify === undefined) {
      // don't test verification
    } else {
      t.suite(
        `verification should ${opts.verify ? "succeed" : "fail"}`,
        async () => {
          const r = await runExim(["-bv", address]);
          t.it("exit code", () => a.equal(r.child.code, opts.verify ? 0 : 2));
          t.it("stdout", () =>
            a.match(r.stdout, opts.verify ? /verified/ : /failed to verify/)
          );
        }
      );
    }

    if (opts.route === undefined) {
      // don't test routing
    } else if (!opts.route) {
      t.suite(`routing should fail`, async () => {
        const r = await runExim(["-bt", address]);
        t.it("exit code", () => a.equal(r.child.code, 2));
        t.it("stdout", () => a.match(r.stdout, /is undeliverable/));
      });
    } else {
      const {
        router,
        transport,
        matches,
      }: Exclude<(typeof opts)["route"], boolean | undefined> =
        opts.route === true ? {} : opts.route;

      t.suite(`routing should succeed`, async () => {
        const r = await runExim(["-bt", address]);
        t.it("exit code", () => a.equal(r.child.code, 0));

        // FIXME RegExp escape
        if (router)
          t.it(`routes via ${router}`, () =>
            a.match(r.stdout, new RegExp(`router = ${router}`))
          );

        // FIXME RegExp escape
        if (transport)
          t.it(`transports via ${transport}`, () =>
            a.match(r.stdout, new RegExp(`transport = ${transport}`))
          );

        for (const pattern of matches ?? []) {
          t.it(`should output ${pattern}`, () => a.match(r.stdout, pattern));
        }
      });
    }
  });
};
