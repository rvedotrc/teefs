import { TypedRegEx } from "typed-regex";
import { analyseTimestampedText } from "./analyseTimestampedText.js";

const timestampedLogLine = TypedRegEx(
  `^(?<timestamp>\\d\\d\\d\\d-\\d\\d-\\d\\d \\d\\d:\\d\\d:\\d\\d\.\\d+) \\[(?<connection_id>\\d+)\\] (?<body>.*)$`
);

export const analyseEximMainLogLine = (text: string) => {
  {
    const captures = timestampedLogLine.captures(text);
    if (captures)
      return {
        type: "timestamped",
        ...captures,
        body: {
          text: captures.body,
          analysis: analyseTimestampedText(captures.body),
        },
      } as const;
  }

  if (
    text ===
    " Suggested action: either install a certificate or change tls_advertise_hosts option"
  ) {
    return {
      type: "no_tls_certificate_suggestion",
    } as const;
  }

  return null;
};
