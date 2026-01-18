import { TypedRegEx } from "typed-regex";
import { maybe } from "./parts.js";

const start_queue_run = TypedRegEx(`^Start queue run: pid=(?<pid>\\d+)$`);
const end_queue_run = TypedRegEx(`^End queue run: pid=(?<pid>\\d+)$`);

export const matchQueueRunnerLogging = (s: string) =>
  maybe("start_queue_run" as const, start_queue_run.captures(s)) ??
  maybe("end_queue_run" as const, end_queue_run.captures(s)) ??
  null;
