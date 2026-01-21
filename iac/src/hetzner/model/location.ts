import * as s from "effect/Schema";

export const Location = s
  .Struct({
    id: s.Int,
    name: s.String,
    description: s.String,
    country: s.String,
    city: s.String,
    latitude: s.Number,
    longitude: s.Number,
    network_zone: s.String,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type Location = typeof Location.Type;
