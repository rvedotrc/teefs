import { TypedRegEx } from "typed-regex";
import { ipAddressAndPort, maybe } from "./parts.js";

const acl_smtp_connect = TypedRegEx(
  `^ACL_SMTP_CONNECT ${ipAddressAndPort("remote")}$` as const
);
const acl_smtp_helo = TypedRegEx(
  `^ACL_SMTP_HELO ${ipAddressAndPort("remote")} "(?<helo>.*)"` as const
);
const acl_smtp_starttls = TypedRegEx(
  `^ACL_SMTP_STARTTLS ${ipAddressAndPort("remote")}$` as const
);
const acl_smtp_mail = TypedRegEx(
  `^ACL_SMTP_MAIL ${ipAddressAndPort("remote")} "(?<mailFrom>.*)"$` as const
);
const acl_smtp_rcpt = TypedRegEx(
  `^ACL_SMTP_RCPT ${ipAddressAndPort("remote")} "(?<rcptTo>.*)"$` as const
);
const acl_smtp_quit = TypedRegEx(
  `^ACL_SMTP_QUIT ${ipAddressAndPort("remote")}$` as const
);
const acl_smtp_notquit = TypedRegEx(
  `^ACL_SMTP_NOTQUIT ${ipAddressAndPort(
    "remote"
  )} \\"(?<reason>.*?)\\"$` as const
);

export const matchAclDebugging = (s: string) =>
  maybe("acl_smtp_connect" as const, acl_smtp_connect.captures(s)) ??
  maybe("acl_smtp_helo" as const, acl_smtp_helo.captures(s)) ??
  maybe("acl_smtp_starttls" as const, acl_smtp_starttls.captures(s)) ??
  maybe("acl_smtp_mail" as const, acl_smtp_mail.captures(s)) ??
  maybe("acl_smtp_rcpt" as const, acl_smtp_rcpt.captures(s)) ??
  maybe("acl_smtp_quit" as const, acl_smtp_quit.captures(s)) ??
  maybe("acl_smtp_notquit" as const, acl_smtp_notquit.captures(s)) ??
  null;
