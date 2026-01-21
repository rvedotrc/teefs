import * as s from "effect/Schema";
import { Deprecation, NetAndGross } from "./util.js";

export const ServerType = s
  .Struct({
    id: s.Int,
    name: s.String,
    description: s.String,
    category: s.String, // e.g. "cost_optimized",
    cores: s.Int,
    memory: s.Int, // GB
    disk: s.Int, // GB
    storage_type: s.String, // e.g. "local",
    cpu_type: s.String, // e.g. "shared",
    architecture: s.String, // e.g. "arm",
    included_traffic: s.Int, // unknown units
    prices: s.Array(
      s
        .Struct({
          location: s.String,
          price_hourly: NetAndGross,
          price_monthly: NetAndGross,
          included_traffic: s.Int, // unknown units
          price_per_tb_traffic: NetAndGross,
        })
        .annotations({
          parseOptions: { exact: true, onExcessProperty: "error" },
        }),
    ),
    deprecated: s.Boolean,
    deprecation: s.NullOr(Deprecation),
    locations: s.Array(
      s
        .Struct({
          id: s.Int,
          name: s.String,
          deprecation: s.NullOr(Deprecation),
        })
        .annotations({
          parseOptions: { exact: true, onExcessProperty: "error" },
        }),
    ),
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type ServerType = typeof ServerType.Type;
