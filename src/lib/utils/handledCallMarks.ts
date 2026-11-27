/**
 * Manual "handled" marks live in `handled_call_marks`. Production may be
 * running this code before that migration has been applied. A missing table
 * must not take down call statistics.
 */

export const HANDLED_MARKS_UNAVAILABLE_MESSAGE =
  "האפשרות לסמן שיחות כטופלו עדיין לא פעילה";

const MARKS_TABLE = "handled_call_marks";

interface ErrorFacts {
  codes: Set<string>;
  text: string;
}

function collectErrorFacts(error: unknown): ErrorFacts {
  const codes = new Set<string>();
  const parts: string[] = [];
  const seen = new Set<unknown>();

  const visit = (value: unknown, depth: number) => {
    if (depth > 6 || value == null) return;
    if (typeof value === "string") {
      parts.push(value);
      return;
    }
    if (typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);

    const record = value as Record<string, unknown>;
    if (typeof record.code === "string") codes.add(record.code);
    if (typeof record.message === "string") parts.push(record.message);
    if (typeof record.table === "string") parts.push(record.table);
    if (typeof record.modelName === "string") parts.push(record.modelName);
    visit(record.meta, depth + 1);
    visit(record.cause, depth + 1);
    visit(record.original, depth + 1);
  };

  visit(error, 0);
  return { codes, text: parts.join("\n") };
}

function isMarksName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes(MARKS_TABLE) || lower.includes("handledcallmark");
}

function collectMatches(text: string, pattern: RegExp): string[] {
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match[1]) names.push(match[1]);
  }
  return names;
}

function tableNamesIn(text: string): string[] {
  return [
    ...collectMatches(text, /[`'"]((?:public\.)?[\w]+)[`'"]/gi),
    ...collectMatches(text, /(?:^|\n)((?:public\.)?[a-z0-9_]+)(?=\n|$)/gi),
  ];
}

/**
 * True when Postgres or Prisma is reporting that `handled_call_marks` is
 * not there yet: Prisma P2021, or a relation/table-does-not-exist error
 * that names this table. A missing different table is not this case.
 */
export function isMissingHandledCallMarksTable(error: unknown): boolean {
  const { codes, text } = collectErrorFacts(error);
  const names = tableNamesIn(text);
  const mentionsMarks = names.some(isMarksName) || isMarksName(text);
  const mentionsOther = names.some(name => !isMarksName(name));
  const doesNotExist = /does not exist/i.test(text);

  if (codes.has("P2021")) {
    return !(mentionsOther && !mentionsMarks);
  }
  if (!doesNotExist || !mentionsMarks) return false;
  return true;
}

/**
 * Loads manual marks. When the table has not been migrated yet, returns no
 * marks so statistics stay exactly as they were before this feature.
 * Any other failure is rethrown.
 */
export async function loadHandledCallIds(
  load: () => Promise<readonly string[]>,
): Promise<string[]> {
  try {
    return [...(await load())];
  } catch (error) {
    if (!isMissingHandledCallMarksTable(error)) throw error;
    return [];
  }
}
