import * as s from "effect/Schema";

const sym = Symbol("TimestampString");
export const TimestampString = s.String.pipe(s.brand(sym));

const TaggedUnknown = s.Unknown.pipe(
  s.transform(s.Struct({ tag: s.Literal("!UNKNOWN!"), value: s.Unknown }), {
    encode(toI, toA) {
      return toI.value;
    },
    decode(fromA, fromI) {
      return { tag: "!UNKNOWN!", value: fromA } as const;
    },
    strict: true,
  })
);
export type TaggedUnknown = typeof TaggedUnknown.Type;

const NumberAsString = s.String.pipe(
  s.filter((value) => !Number.isNaN(Number(value)))
);
export type NumberAsString = typeof NumberAsString.Type;

export const PublicIPv4 = s
  .Struct({
    id: s.Int,
    ip: s.String,
    blocked: s.Boolean,
    dns_ptr: s.String,
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type PublicIPv4 = typeof PublicIPv4.Type;

export const PublicIPv6 = s
  .Struct({
    id: s.Int,
    ip: s.String, // including netmask
    blocked: s.Boolean,
    dns_ptr: s.Array(s.String), // guess
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type PublicIPv6 = typeof PublicIPv6.Type;

export const FloatingIP = TaggedUnknown;
export type FloatingIP = typeof FloatingIP.Type;

export const PublicNet = s
  .Struct({
    ipv4: PublicIPv4,
    ipv6: PublicIPv6,
    floating_ips: s.Array(FloatingIP),
    firewalls: s.Array(
      s
        .Struct({
          id: s.Int,
          status: s.Literal("applied"),
        })
        .annotations({
          parseOptions: { exact: true, onExcessProperty: "error" },
        })
    ),
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type PublicNet = typeof PublicNet.Type;

export const PrivateNet = TaggedUnknown;
export type PrivateNet = typeof PrivateNet.Type;

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
        })
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
        })
    ),
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type ServerType = typeof ServerType.Type;

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

export const Volume = TaggedUnknown;
export type Volume = typeof Volume.Type;

export const LoadBalancer = TaggedUnknown;
export type LoadBalancer = typeof LoadBalancer.Type;

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
