import * as s from "effect/Schema";
import { TaggedUnknown, TimestampString } from "./util.js";

export const Image = s
  .Struct({
    id: s.Int,
    status: s.String, // e.g. "available"
    type: s.String, // e.g. "system", "app"
    name: s.String,
    description: s.String,
    image_size: TaggedUnknown,
    disk_size: s.Number, // GB
    created: TimestampString,
    created_from: TaggedUnknown,
    bound_to: s.NullOr(TaggedUnknown),
    os_flavor: s.String, // e.g. "ubuntu",
    os_version: s.String, // e.g. "24.04",
    architecture: s.String, // e.g. "arm",
    rapid_deploy: s.Boolean,
    protection: s.Struct({ delete: s.Boolean }).annotations({
      parseOptions: { exact: true, onExcessProperty: "error" },
    }),
    deprecated: s.NullOr(TimestampString), // guess
    deleted: s.NullOr(TimestampString), // guess
    labels: TaggedUnknown,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type Image = typeof Image.Type;
