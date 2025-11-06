import { TypedRegEx } from "typed-regex";

const ipAddressAndPort = <T extends string>(prefix: T) =>
  `\\[(?<${prefix}IpAddress>[^\\]]+)\\]:(?<${prefix}Port>\\d+)` as const;

const helo = "\\((?<helo>[^)]*)\\)" as const;
const ptr = "(?<ptr>\\S+)" as const;
const remoteHost = `H=(?:(?=\\w)${ptr} )?(?:${helo} )?${ipAddressAndPort(
  "remote"
)}` as const;
const localHost = `I=${ipAddressAndPort("local")}` as const;
const connectionId = `Ci=(?<connectionId>\\d+)`;
const duration = `D=(?<duration>\\d+\\.\\d+)s`;

const acl_smtp_connect = TypedRegEx(
  `^ACL_SMTP_CONNECT ${ipAddressAndPort("remote")}$` as const
);

const acl_smtp_helo = TypedRegEx(
  `^ACL_SMTP_HELO ${ipAddressAndPort("remote")} "(?<helo>.*)"` as const
);

const smtp_syntax_error = TypedRegEx(
  `^SMTP syntax error in (?<garbage>.*?) ${remoteHost} ${localHost} ${connectionId} (?<errorText>.*)$`
);

const smtp_protocol_error = TypedRegEx(
  `^SMTP protocol error in "(?<command>.*?)" ${remoteHost} ${localHost} ${connectionId} (?<errorText>.*)$`
);

const start_queue_run = TypedRegEx(`^Start queue run: pid=(?<pid>\\d+)$`);
const end_queue_run = TypedRegEx(`^End queue run: pid=(?<pid>\\d+)$`);

const connection_from = TypedRegEx(
  `^SMTP connection from ${ipAddressAndPort(
    "remote"
  )} ${localHost} ${connectionId} \\(TCP/IP connection count = (?<connectionCount>\\d+)\\)`
);

const no_mail_in_connection = TypedRegEx(
  `^no MAIL in SMTP connection from ${ipAddressAndPort(
    "remote"
  )} ${localHost} ${connectionId} ${duration}$`
);

const closed_by_quit = TypedRegEx(
  `^SMTP connection ${connectionId} from ${remoteHost.replace(
    "H=",
    ""
  )} ${localHost} ${duration} closed by QUIT$`
);

export const analyseTimestampedText = (text: string) => {
  {
    const captures = acl_smtp_connect.captures(text);
    if (captures) return { type: "acl_smtp_connect", ...captures } as const;
  }

  {
    const captures = acl_smtp_helo.captures(text);
    if (captures) return { type: "acl_smtp_helo", ...captures } as const;
  }

  {
    const captures = smtp_syntax_error.captures(text);
    if (captures) return { type: "smtp_syntax_error", ...captures } as const;
  }

  {
    const captures = smtp_protocol_error.captures(text);
    if (captures) return { type: "smtp_protocol_error", ...captures } as const;
  }

  {
    const captures = connection_from.captures(text);
    if (captures) return { type: "connection_from", ...captures } as const;
  }

  {
    const captures = start_queue_run.captures(text);
    if (captures)
      return {
        type: "queue_run",
        operation: "start",
        pid: captures.pid,
      } as const;
  }

  {
    const captures = end_queue_run.captures(text);
    if (captures)
      return {
        type: "queue_run",
        operation: "end",
        pid: captures.pid,
      } as const;
  }

  {
    const captures = no_mail_in_connection.captures(text);
    if (captures)
      return { type: "no_mail_in_connection", ...captures } as const;
  }

  {
    const captures = closed_by_quit.captures(text);
    if (captures) return { type: "closed_by_quit", ...captures } as const;
  }

  return {
    type: "unknown",
  } as const;
};

const timestampedLogLine = TypedRegEx(
  `^(?<timestamp>\\d\\d\\d\\d-\\d\\d-\\d\\d \\d\\d:\\d\\d:\\d\\d\.\\d+) \\[(?<connection_id>\\d+)\\] (?<text>.*)$`
);

export const analyseEximMainLogLine = (text: string) => {
  {
    const captures = timestampedLogLine.captures(text);
    if (captures)
      return {
        _input: text,
        type: "timestamped",
        ...captures,
        text: {
          _input: captures.text,
          ...analyseTimestampedText(captures.text),
        },
      } as const;
  }

  return {
    _input: text,
    type: "unknown",
  } as const;
};
