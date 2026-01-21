import * as s from "effect/Schema";
import { PublicNet, PrivateNet, LoadBalancer } from "./networking.js";
import { Datacenter } from "./datacenter.js";
import { TaggedUnknown, TimestampString } from "./util.js";
import { ServerType } from "./serverType.js";
import { Image } from "./image.js";
import { Volume } from "./volume.js";
import { Location } from "./location.js";

export const Server = s
  .Struct({
    id: s.Int,
    name: s.String,
    status: s.Literal("running"), // and more, presumably
    created: TimestampString,
    public_net: PublicNet,
    private_net: s.Array(PrivateNet),
    server_type: ServerType,
    included_traffic: s.Number,
    outgoing_traffic: s.NullOr(TaggedUnknown),
    ingoing_traffic: s.NullOr(TaggedUnknown),
    backup_window: s.NullOr(TaggedUnknown),
    rescue_enabled: s.Boolean,
    iso: s.NullOr(TaggedUnknown),
    locked: s.Boolean,
    location: Location,
    datacenter: Datacenter,
    image: Image,
    protection: s
      .Struct({ delete: s.Boolean, rebuild: s.Boolean })
      .annotations({
        parseOptions: { exact: true, onExcessProperty: "error" },
      }),
    labels: s.Record({ key: s.String, value: TaggedUnknown }),
    volumes: s.Array(Volume),
    primary_disk_size: s.Number, // GB
    placement_group: s.NullOr(TaggedUnknown),
    load_balancers: s.Array(LoadBalancer),
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type Server = typeof Server.Type;
