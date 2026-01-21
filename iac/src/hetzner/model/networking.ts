import * as s from "effect/Schema";
import { TaggedUnknown } from "./util.js";

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
        }),
    ),
  })
  .annotations({ parseOptions: { exact: true, onExcessProperty: "error" } });
export type PublicNet = typeof PublicNet.Type;

export const PrivateNet = TaggedUnknown;
export type PrivateNet = typeof PrivateNet.Type;

export const LoadBalancer = TaggedUnknown;
export type LoadBalancer = typeof LoadBalancer.Type;
