import * as s from "effect/Schema";
import { TaggedUnknown } from "../hetzner/model/util.js";

export const CloudInitErrors = s.Array(TaggedUnknown);
export type CloudInitErrors = typeof CloudInitErrors.Type;

export const CloudInitPhoneHome = s.Struct({
  pub_key_rsa: s.String,
  pub_key_ecdsa: s.String,
  pub_key_ed25519: s.String,
  instance_id: s.String,
  hostname: s.String,
  fqdn: s.String,
});
export type CloudInitPhoneHome = typeof CloudInitPhoneHome.Type;

export const CloudInitRecoverableErrors = s.Record({
  key: s.String, // e.g. WARNING
  value: s.Array(s.String),
});
export type CloudInitRecoverableErrors = typeof CloudInitRecoverableErrors.Type;

export const CloudInitStageStatus = s.Struct({
  start: s.Number,
  finished: s.Number,
  errors: CloudInitErrors,
  recoverable_errors: CloudInitRecoverableErrors,
});
export type CloudInitStageStatus = typeof CloudInitStageStatus.Type;

export const CloudInitLongStatus = s.Struct({
  boot_status_code: s.String,
  datasource: s.String,
  detail: s.String,

  stage: s.NullOr(TaggedUnknown),
  status: s.Literal("running", "done", "disabled", "error"),
  extended_status: s.String,

  errors: CloudInitErrors,
  recoverable_errors: CloudInitRecoverableErrors,

  init: CloudInitStageStatus,
  "init-local": CloudInitStageStatus,
  "modules-config": CloudInitStageStatus,
  "modules-final": CloudInitStageStatus,
});
export type CloudInitLongStatus = typeof CloudInitLongStatus.Type;
