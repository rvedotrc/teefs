import assert from "node:assert";
import * as t from "node:test";
import { analyseTimestampedText } from "./analyseTimestampedText.js";

t.suite("matchQueueRunnerLogging (via analyseTimestampedText)", () => {
  t.it("start_queue_run", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("Start queue run: pid=167838"),
      {
        type: "start_queue_run",
        pid: "167838",
      }
    )
  );

  t.it("end_queue_run", () =>
    assert.deepStrictEqual(
      analyseTimestampedText("End queue run: pid=167838"),
      {
        type: "end_queue_run",
        pid: "167838",
      }
    )
  );
});
