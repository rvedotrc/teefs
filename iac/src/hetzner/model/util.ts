import * as s from "effect/Schema";

export const timestampSym = Symbol("TimestampString");
export const TimestampString = s.String.pipe(s.brand(timestampSym));

const NumberAsString = s.String.pipe(
  s.filter((value) => !Number.isNaN(Number(value))),
);
export type NumberAsString = typeof NumberAsString.Type;

export const TaggedUnknown = s.Unknown.pipe(
  s.transform(s.Struct({ tag: s.Literal("!UNKNOWN!"), value: s.Unknown }), {
    encode(toI, toA) {
      return toI.value;
    },
    decode(fromA, fromI) {
      return { tag: "!UNKNOWN!", value: fromA } as const;
    },
    strict: true,
  }),
);
export type TaggedUnknown = typeof TaggedUnknown.Type;

// Unknown currency. Always EUR maybe?
export const NetAndGross = s
  .Struct({
    net: NumberAsString,
    gross: NumberAsString,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type NetAndGross = typeof NetAndGross.Type;

export const Deprecation = s
  .Struct({
    announced: TimestampString,
    unavailable_after: TimestampString,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type Deprecation = typeof Deprecation.Type;
