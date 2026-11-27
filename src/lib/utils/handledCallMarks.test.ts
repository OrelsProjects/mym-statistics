import assert from "node:assert/strict";
import test from "node:test";
import { findUnhandledCalls, type CallRecord } from "./unhandledCalls";
import {
  isMissingHandledCallMarksTable,
  loadHandledCallIds,
} from "./handledCallMarks";

function call(id: string): CallRecord {
  return {
    id,
    number: "0542444505",
    contactName: "ישראל",
    startDate: new Date("2026-11-15T08:00:00.000Z"),
    type: "MISSED",
    isAnswered: false,
    messageCount: 0,
  };
}

function prismaMissingMarksTable(): Error {
  return Object.assign(
    new Error(
      "The table `public.handled_call_marks` does not exist in the current database.",
    ),
    {
      code: "P2021",
      meta: {
        modelName: "HandledCallMark",
        table: "public.handled_call_marks",
      },
    },
  );
}

test("a missing handled_call_marks table falls back to the previous unhandled results", async () => {
  const calls = [call("m1"), call("m2")];
  const withoutMarks = findUnhandledCalls(calls);

  assert.equal(isMissingHandledCallMarksTable(prismaMissingMarksTable()), true);
  assert.equal(
    isMissingHandledCallMarksTable(
      Object.assign(new Error('relation "handled_call_marks" does not exist'), {
        code: "42P01",
      }),
    ),
    true,
  );
  assert.equal(
    isMissingHandledCallMarksTable({
      code: "P2010",
      message: "raw query failed",
      cause: {
        code: "42P01",
        message: 'relation "public.handled_call_marks" does not exist',
      },
    }),
    true,
  );
  assert.equal(
    isMissingHandledCallMarksTable(
      Object.assign(new Error("table does not exist"), { code: "P2021" }),
    ),
    true,
  );

  const ids = await loadHandledCallIds(async () => {
    throw prismaMissingMarksTable();
  });
  assert.deepEqual(ids, []);
  assert.deepEqual(findUnhandledCalls(calls, undefined, ids), withoutMarks);

  const fromRelation = await loadHandledCallIds(async () => {
    throw Object.assign(
      new Error('relation "handled_call_marks" does not exist'),
      { code: "42P01" },
    );
  });
  assert.deepEqual(
    findUnhandledCalls(calls, undefined, fromRelation),
    withoutMarks,
  );
});

test("a different database failure is not treated as a missing marks table", async () => {
  assert.equal(
    isMissingHandledCallMarksTable(
      Object.assign(
        new Error(
          "The table `public.phone_calls` does not exist in the current database.",
        ),
        { code: "P2021", meta: { table: "public.phone_calls" } },
      ),
    ),
    false,
  );
  assert.equal(
    isMissingHandledCallMarksTable(
      Object.assign(new Error('relation "phone_calls" does not exist'), {
        code: "42P01",
      }),
    ),
    false,
  );
  assert.equal(
    isMissingHandledCallMarksTable(new Error("User does not exist")),
    false,
  );
  assert.equal(
    isMissingHandledCallMarksTable(
      Object.assign(new Error("Foreign key constraint failed"), {
        code: "P2003",
      }),
    ),
    false,
  );

  await assert.rejects(
    loadHandledCallIds(async () => {
      throw Object.assign(new Error("connection refused"), {
        code: "ECONNREFUSED",
      });
    }),
    /connection refused/,
  );
});
