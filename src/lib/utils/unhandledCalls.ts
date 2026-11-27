/**
 * Unhandled conversations ("שיחות שלא טופלו").
 *
 * A call in the selected period is unhandled when all of the following hold:
 * - The other party called: type is INCOMING or MISSED.
 * - It was not answered. MISSED calls count as not answered. An INCOMING
 *   call counts only when isAnswered is false. An answered incoming call
 *   is treated as handled on the phone.
 * - No template message was sent for that call (it is not "tagged").
 * - Nothing later handled the same number (digits only, 972 / leading 0
 *   ignored): a later OUTGOING call, a later answered call, or any later
 *   call to that number that has a sent message.
 * - The logged-in user has not manually marked that specific call handled.
 *   The mark is per call id. A later call from the same number is unhandled
 *   again until something handles that new call.
 *
 * Follow-up is checked through now, including after the selected period, so
 * the list is "still unhandled" rather than "was unhandled at the time".
 * Each call is listed separately (not collapsed to one row per number).
 * A call with an empty number is never matched to another call.
 */

export interface CallRecord {
  id: string;
  number: string;
  contactName: string;
  startDate: Date;
  type: string;
  isAnswered: boolean;
  messageCount: number;
}

export interface UnhandledCall {
  id: string;
  number: string;
  contactName: string;
  startDate: string;
  type: string;
  isAnswered: boolean;
}

export function normalizePhoneNumber(number: string): string {
  let digits = number.replace(/\D/g, "");
  if (digits.startsWith("972")) {
    digits = digits.slice(3);
  }
  return digits.replace(/^0+/, "");
}

export function toTelHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export function toWhatsAppHref(number: string): string {
  let digits = number.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = `972${digits.slice(1)}`;
  }
  return `https://wa.me/${digits}`;
}

function callType(call: CallRecord): string {
  return call.type.trim().toUpperCase();
}

function isUnansweredInbound(call: CallRecord): boolean {
  const type = callType(call);
  if (type === "MISSED") return true;
  if (type === "INCOMING") return !call.isAnswered;
  return false;
}

function countsAsFollowUp(call: CallRecord): boolean {
  const type = callType(call);
  if (type === "OUTGOING") return true;
  if (call.messageCount > 0) return true;
  if (type === "INCOMING" && call.isAnswered) return true;
  return false;
}

export function findUnhandledCalls(
  calls: CallRecord[],
  range?: { from: Date; to: Date },
  manuallyHandledIds?: ReadonlySet<string> | readonly string[],
): UnhandledCall[] {
  const byId = new Map<string, CallRecord>();
  for (const call of calls) {
    byId.set(call.id, call);
  }
  const unique = Array.from(byId.values());
  const fromTime = range?.from.getTime();
  const toTime = range?.to.getTime();
  const handledIds = new Set(manuallyHandledIds ?? []);

  const unhandled: UnhandledCall[] = [];
  for (const call of unique) {
    const time = call.startDate.getTime();
    if (fromTime !== undefined && time < fromTime) continue;
    if (toTime !== undefined && time > toTime) continue;
    // A manual mark hides this call in every date range. It does not
    // count as a follow-up, so other calls from the same number stay.
    if (handledIds.has(call.id)) continue;
    if (!isUnansweredInbound(call)) continue;
    if (call.messageCount > 0) continue;

    const key = normalizePhoneNumber(call.number);
    if (key) {
      const followedUp = unique.some(other => {
        if (other.id === call.id) return false;
        if (other.startDate.getTime() <= time) return false;
        if (normalizePhoneNumber(other.number) !== key) return false;
        return countsAsFollowUp(other);
      });
      if (followedUp) continue;
    }

    unhandled.push({
      id: call.id,
      number: call.number,
      contactName: call.contactName,
      startDate: call.startDate.toISOString(),
      type: callType(call),
      isAnswered: call.isAnswered,
    });
  }

  unhandled.sort((a, b) => {
    if (a.startDate === b.startDate) return 0;
    return a.startDate < b.startDate ? 1 : -1;
  });
  return unhandled;
}
