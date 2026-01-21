import * as s from "effect/Schema";
import { TaggedUnknown } from "./util.js";

export const Zone = s
  .Struct({
    id: s.Int,
    name: s.String,
    created: s.String, // ISO8601
    ttl: s.Int,
    mode: s.Literal("primary"),
    primary_nameservers: s.Array(TaggedUnknown),
    protection: s
      .Struct({
        delete: s.Boolean,
      })
      .annotations({
        parseOptions: { exact: true, onExcessProperty: "error" },
      }),
    labels: s.Record({ key: s.String, value: TaggedUnknown }),
    authoritative_nameservers: s
      .Struct({
        assigned: s.Array(s.String),
        delegated: s.Array(s.String),
        delegation_last_check: s.String, // ISO8601
        delegation_status: s.Literal("valid"), // and presumably others
      })
      .annotations({
        parseOptions: { exact: true, onExcessProperty: "error" },
      }),
    registrar: s.String, // e.g. "other"
    status: s.String, // e.g. "ok"
    record_count: s.Int,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type Zone = typeof Zone.Type;

export const ZoneList = s.Array(Zone);
export type ZoneList = typeof ZoneList.Type;

export const RRSet = s
  .Struct({
    id: s.String,
    name: s.String,
    type: s.String,
    ttl: s.NullOr(s.Int),
    labels: s.Record({ key: s.String, value: TaggedUnknown }),
    protection: s
      .Struct({
        change: s.Boolean,
      })
      .annotations({
        parseOptions: { exact: true, onExcessProperty: "error" },
      }),
    records: s.Array(s.String), // always?
    zone: s.Int,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type RRSet = typeof RRSet.Type;

export const RRSetList = s.Array(RRSet);
export type RRSetList = typeof RRSetList.Type;
