import { TypedRegEx } from "typed-regex";
import { maybe, maybeExact } from "./parts.js";

const cwd_and_args = TypedRegEx(
  `^cwd=(?<cwd>.*?) (?<argCount>\\d+) args: (?<argText>.*)$`
);
const sighup_received = TypedRegEx(
  `^pid (?<pid>\\d+): SIGHUP received: re-exec daemon$`
);

const no_server_certificate =
  "Warning: No server certificate defined; will use a selfsigned one.";

const daemon_started = TypedRegEx(
  `^exim (?<version>\\S+) daemon started: pid=(?<pid>\\d+),.*$`
);

export const startupAndShutdown = (s: string) =>
  maybe("cwd_and_args" as const, cwd_and_args.captures(s)) ??
  maybe("sighup_received" as const, sighup_received.captures(s)) ??
  maybeExact("no_server_certificate", no_server_certificate, s) ??
  maybe("daemon_started" as const, daemon_started.captures(s)) ??
  null;
