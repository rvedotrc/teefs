import { TypedRegEx } from "typed-regex";
import {
  connectionId,
  duration,
  ipAddress,
  ipAddressAndPort,
  localHost,
  maybe,
  remoteHostTagged,
  remoteHostUntagged,
} from "./parts.js";

const connection_from = TypedRegEx(
  `^SMTP connection from ${ipAddressAndPort(
    "remote"
  )} ${localHost} ${connectionId} \\(TCP/IP connection count = (?<connectionCount>\\d+)\\)`
);

const smtp_syntax_error = TypedRegEx(
  `^SMTP syntax error in "(?<garbage>.*?)" ${remoteHostTagged} ${localHost} ${connectionId} (?<errorText>.*)$`
);

const smtp_protocol_error = TypedRegEx(
  `^SMTP protocol error in "(?<command>.*?)" ${remoteHostTagged} ${localHost} ${connectionId} (?<errorText>.*)$`
);

const closed_by_quit = TypedRegEx(
  `^SMTP connection ${connectionId} from ${remoteHostUntagged} ${localHost} ${duration} closed by QUIT$`
);

const no_mail_in_smtp_connection = TypedRegEx(
  `no MAIL in SMTP connection from ${remoteHostUntagged} ${localHost} ${connectionId} ${duration}(?: C=(?<commands>.*))?$`
);

const no_ptr = TypedRegEx(
  `^no host name found for IP address ${ipAddress("remote")}$`
);

const too_many_unrecognized_commands = TypedRegEx(
  `^SMTP call from ${remoteHostUntagged} ${localHost} ${connectionId} dropped: too many unrecognized commands \\(last was "(?<lastCommand>.*?)"\\)$`
);

const too_many_syntax_or_protocol_errors = TypedRegEx(
  `^SMTP call from ${remoteHostUntagged} ${localHost} ${connectionId} dropped: too many syntax or protocol errors \\(last command was .*\\)$`
);

const smtp_command_timeout = TypedRegEx(
  `^SMTP command timeout on connection from ${remoteHostUntagged} ${localHost} ${connectionId} ${duration}$`
);

const smtp_connection_lost = TypedRegEx(
  `^SMTP connection ${connectionId} from ${remoteHostUntagged} ${localHost} lost(?: \\(error: (?<errorText>.*)\\))? ${duration}$`
);

export const matchConnectionLogging = (s: string) =>
  maybe("connection_from" as const, connection_from.captures(s)) ??
  maybe("smtp_syntax_error" as const, smtp_syntax_error.captures(s)) ??
  maybe("smtp_protocol_error" as const, smtp_protocol_error.captures(s)) ??
  maybe("closed_by_quit" as const, closed_by_quit.captures(s)) ??
  maybe(
    "no_mail_in_smtp_connection" as const,
    no_mail_in_smtp_connection.captures(s)
  ) ??
  maybe("no_ptr" as const, no_ptr.captures(s)) ??
  maybe(
    "too_many_unrecognized_commands" as const,
    too_many_unrecognized_commands.captures(s)
  ) ??
  maybe(
    "too_many_syntax_or_protocol_errors" as const,
    too_many_syntax_or_protocol_errors.captures(s)
  ) ??
  maybe("smtp_command_timeout" as const, smtp_command_timeout.captures(s)) ??
  maybe("smtp_connection_lost" as const, smtp_connection_lost.captures(s)) ??
  null;
