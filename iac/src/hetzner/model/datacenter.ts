import * as s from "effect/Schema";
import { Location } from "./location.js";

export const Datacenter = s
  .Struct({
    id: s.Int,
    name: s.String,
    description: s.String,
    location: Location,
    server_types: s
      .Struct({
        supported: s.Array(s.Int),
        available_for_migration: s.Array(s.Int),
        available: s.Array(s.Int),
      })
      .annotations({
        parseOptions: { exact: true, onExcessProperty: "error" },
      }),
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type Datacenter = typeof Datacenter.Type;
