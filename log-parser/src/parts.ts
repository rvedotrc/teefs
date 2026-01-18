export const ipAddress = <T extends string>(prefix: T) =>
  `(?<${prefix}IpAddress>[0-9a-fA-f\\.:]+)` as const;
export const port = <T extends string>(prefix: T) =>
  `(?<${prefix}Port>\\d+)` as const;
export const ipAddressAndPort = <T extends string>(prefix: T) =>
  `\\[${ipAddress(prefix)}\\]:${port(prefix)}` as const;

export const helo = "\\((?<helo>[^)]*)\\)" as const;
export const ptr = "(?<ptr>\\S+)" as const;

export const remoteHostUntagged =
  `(?:(?=\\w)${ptr} )?(?:${helo} )?${ipAddressAndPort("remote")}` as const;

export const remoteHostTagged = `H=${remoteHostUntagged}` as const;

export const localHost = `I=${ipAddressAndPort("local")}` as const;
export const connectionId = `Ci=(?<connectionId>\\d+)`;
export const duration = `D=(?<duration>[0-9.]+)(?<durationUnit>[sm])`;

export const maybe = <T, D extends object>(
  type: T,
  data: Readonly<D> | null | undefined
) => (data === null || data == undefined ? null : ({ type, ...data } as const));

export const maybeExact = <T>(type: T, exact: string, s: string) =>
  s === exact ? ({ type } as const) : null;
