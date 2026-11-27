import assert from "node:assert/strict";
import test from "node:test";
import {
  findUnhandledCalls,
  normalizePhoneNumber,
  toTelHref,
  toWhatsAppHref,
  type CallRecord,
} from "./unhandledCalls";

function call(
  overrides: Partial<CallRecord> & Pick<CallRecord, "id">,
): CallRecord {
  return {
    number: "0542444505",
    contactName: "ישראל",
    startDate: new Date("2026-11-01T08:00:00.000Z"),
    type: "MISSED",
    isAnswered: false,
    messageCount: 0,
    ...overrides,
  };
}

test("normalizes Israeli numbers that share the same subscriber digits", () => {
  assert.equal(normalizePhoneNumber("054-244-4505"), "542444505");
  assert.equal(normalizePhoneNumber("+972542444505"), "542444505");
  assert.equal(normalizePhoneNumber("972542444505"), "542444505");
  assert.equal(normalizePhoneNumber(""), "");
});

test("builds call and WhatsApp links", () => {
  assert.equal(toTelHref("054-244-4505"), "tel:0542444505");
  assert.equal(toWhatsAppHref("0542444505"), "https://wa.me/972542444505");
  assert.equal(toWhatsAppHref("+972542444505"), "https://wa.me/972542444505");
});

test("a missed call with no message and no follow-up is unhandled", () => {
  const result = findUnhandledCalls([call({ id: "m1" })]);
  assert.deepEqual(
    result.map(item => item.id),
    ["m1"],
  );
  assert.equal(result[0]?.type, "MISSED");
});

test("a message sent on the call handles it", () => {
  const result = findUnhandledCalls([call({ id: "m1", messageCount: 1 })]);
  assert.equal(result.length, 0);
});

test("a later outgoing call to the same number handles it, including different formatting", () => {
  const result = findUnhandledCalls([
    call({ id: "m1", startDate: new Date("2026-11-01T08:00:00.000Z") }),
    call({
      id: "o1",
      type: "OUTGOING",
      number: "+972-54-244-4505",
      startDate: new Date("2026-11-01T09:00:00.000Z"),
    }),
  ]);
  assert.equal(result.length, 0);
});

test("an outgoing call to a different number does not handle it", () => {
  const result = findUnhandledCalls([
    call({ id: "m1" }),
    call({
      id: "o1",
      type: "OUTGOING",
      number: "0500000000",
      startDate: new Date("2026-11-01T10:00:00.000Z"),
    }),
  ]);
  assert.deepEqual(
    result.map(item => item.id),
    ["m1"],
  );
});

test("an earlier outgoing call does not handle a later missed call", () => {
  const result = findUnhandledCalls([
    call({
      id: "o1",
      type: "OUTGOING",
      startDate: new Date("2026-11-01T07:00:00.000Z"),
    }),
    call({ id: "m1", startDate: new Date("2026-11-01T08:00:00.000Z") }),
  ]);
  assert.deepEqual(
    result.map(item => item.id),
    ["m1"],
  );
});

test("answered incoming calls are handled; unanswered incoming calls are not", () => {
  const result = findUnhandledCalls([
    call({ id: "answered", type: "INCOMING", isAnswered: true }),
    call({
      id: "missed-incoming",
      type: "INCOMING",
      isAnswered: false,
      number: "0501111111",
    }),
  ]);
  assert.deepEqual(
    result.map(item => item.id),
    ["missed-incoming"],
  );
});

test("a later answered call or a later message to the same number handles the missed call", () => {
  const byAnswer = findUnhandledCalls([
    call({ id: "m1", startDate: new Date("2026-11-01T08:00:00.000Z") }),
    call({
      id: "in1",
      type: "INCOMING",
      isAnswered: true,
      startDate: new Date("2026-11-01T11:00:00.000Z"),
    }),
  ]);
  assert.equal(byAnswer.length, 0);

  const byMessage = findUnhandledCalls([
    call({ id: "m1", startDate: new Date("2026-11-01T08:00:00.000Z") }),
    call({
      id: "in2",
      type: "INCOMING",
      isAnswered: false,
      messageCount: 2,
      startDate: new Date("2026-11-01T12:00:00.000Z"),
    }),
  ]);
  assert.equal(byMessage.length, 0);
});

test("another missed call is not a follow-up", () => {
  const result = findUnhandledCalls([
    call({ id: "m1", startDate: new Date("2026-11-01T08:00:00.000Z") }),
    call({ id: "m2", startDate: new Date("2026-11-01T09:00:00.000Z") }),
  ]);
  assert.deepEqual(
    result.map(item => item.id),
    ["m2", "m1"],
  );
});

test("follow-up after the selected period clears the call, and calls outside the period are not listed", () => {
  const result = findUnhandledCalls(
    [
      call({ id: "m1", startDate: new Date("2026-11-01T08:00:00.000Z") }),
      call({
        id: "o1",
        type: "OUTGOING",
        startDate: new Date("2026-11-03T08:00:00.000Z"),
      }),
      call({
        id: "m-later",
        number: "0502222222",
        startDate: new Date("2026-11-03T09:00:00.000Z"),
      }),
    ],
    {
      from: new Date("2026-11-01T00:00:00.000Z"),
      to: new Date("2026-11-01T23:59:59.999Z"),
    },
  );
  assert.equal(result.length, 0);
});

test("calls with an empty number are not matched to each other", () => {
  const result = findUnhandledCalls([
    call({
      id: "blank-1",
      number: "",
      startDate: new Date("2026-11-01T08:00:00.000Z"),
    }),
    call({
      id: "blank-2",
      number: "---",
      type: "OUTGOING",
      startDate: new Date("2026-11-01T09:00:00.000Z"),
    }),
  ]);
  assert.deepEqual(
    result.map(item => item.id),
    ["blank-1"],
  );
});

test("outgoing calls are never unhandled", () => {
  const result = findUnhandledCalls([
    call({ id: "o1", type: "OUTGOING", isAnswered: false }),
  ]);
  assert.equal(result.length, 0);
});

test("a manually marked call is excluded from every date range and does not count", () => {
  const missed = call({
    id: "m1",
    startDate: new Date("2026-11-15T08:00:00.000Z"),
  });
  const other = call({
    id: "other",
    number: "0500000001",
    startDate: new Date("2026-11-15T09:00:00.000Z"),
  });
  const handled = new Set(["m1"]);
  const ranges: Array<{ from: Date; to: Date } | undefined> = [
    undefined,
    {
      from: new Date("2026-11-15T00:00:00.000Z"),
      to: new Date("2026-11-15T23:59:59.999Z"),
    },
    {
      from: new Date("2026-11-09T00:00:00.000Z"),
      to: new Date("2026-11-15T23:59:59.999Z"),
    },
    {
      from: new Date("2026-11-01T00:00:00.000Z"),
      to: new Date("2026-11-30T23:59:59.999Z"),
    },
    {
      from: new Date("2026-10-01T00:00:00.000Z"),
      to: new Date("2026-12-31T23:59:59.999Z"),
    },
  ];

  for (const range of ranges) {
    const result = findUnhandledCalls([missed, other], range, handled);
    assert.deepEqual(
      result.map(item => item.id),
      ["other"],
    );
  }
});

test("a new call from the same number after a manual mark is unhandled again", () => {
  const result = findUnhandledCalls(
    [
      call({ id: "marked", startDate: new Date("2026-11-01T08:00:00.000Z") }),
      call({ id: "later", startDate: new Date("2026-11-02T08:00:00.000Z") }),
    ],
    undefined,
    ["marked"],
  );
  assert.deepEqual(
    result.map(item => item.id),
    ["later"],
  );
});

test("a manual mark is not a follow-up, so an earlier call from the same number stays", () => {
  const result = findUnhandledCalls(
    [
      call({ id: "earlier", startDate: new Date("2026-11-01T08:00:00.000Z") }),
      call({ id: "later", startDate: new Date("2026-11-02T08:00:00.000Z") }),
    ],
    undefined,
    new Set(["later"]),
  );
  assert.deepEqual(
    result.map(item => item.id),
    ["earlier"],
  );
});

test("handled ids that are not in the call list are ignored", () => {
  const result = findUnhandledCalls([call({ id: "m1" })], undefined, [
    "missing",
  ]);
  assert.deepEqual(
    result.map(item => item.id),
    ["m1"],
  );
});
