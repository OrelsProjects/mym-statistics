import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import { requireUser } from "@/app/api/_utils/requireUser";
import loggerServer from "@/loggerServer";

const MAX_IDS = 5000;

class CallNotFoundError extends Error {
  constructor() {
    super("Call not found");
    this.name = "CallNotFoundError";
  }
}

function parseCallIds(body: unknown): string[] | null {
  if (!body || typeof body !== "object" || !("ids" in body)) return null;
  const ids = (body as { ids: unknown }).ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_IDS) {
    return null;
  }

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string") return null;
    const trimmed = id.trim();
    if (!trimmed || trimmed.length > 100) return null;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    unique.push(trimmed);
  }
  return unique.length > 0 ? unique : null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const ids = parseCallIds(body);
    if (!ids) {
      return NextResponse.json({ error: "Invalid call ids" }, { status: 400 });
    }

    await prisma.$transaction(async tx => {
      const owned = await tx.phoneCall.findMany({
        where: { id: { in: ids }, userId: auth.userId },
        select: { id: true },
      });
      if (owned.length !== ids.length) {
        throw new CallNotFoundError();
      }

      await tx.handledCallMark.createMany({
        data: ids.map(phoneCallId => ({
          id: randomUUID(),
          userId: auth.userId,
          phoneCallId,
        })),
        skipDuplicates: true,
      });
    });

    return NextResponse.json({ marked: ids.length }, { status: 200 });
  } catch (error) {
    if (error instanceof CallNotFoundError) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2025")
    ) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    loggerServer.error(
      "Error in POST /api/statistics/calls/handled",
      auth.userId,
      { data: { error } },
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
