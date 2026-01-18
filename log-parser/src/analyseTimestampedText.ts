import { matchAclDebugging } from "./matchAclDebugging.js";
import { matchQueueRunnerLogging } from "./matchQueueRunnerLogging.js";
import { matchConnectionLogging } from "./matchConnectionLogging.js";
import { startupAndShutdown } from "./startupAndShutdown.js";

export const analyseTimestampedText = (text: string) =>
  startupAndShutdown(text) ??
  matchConnectionLogging(text) ??
  matchAclDebugging(text) ??
  matchQueueRunnerLogging(text) ??
  null;
