import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import Logger from "@/loggerServer";
import { MessagePosition } from "@/lib/hooks/useMessage";
import { requireUser } from "@/app/api/_utils/requireUser";

export async function PATCH(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  try {
    const body = (await req.json()) as MessagePosition[];
    if (
      !Array.isArray(body) ||
      body.some(item => !item?.id || typeof item.position !== "number")
    ) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const ids = Array.from(new Set(body.map(item => item.id)));
    const owned = await prisma.message.findMany({
      where: { id: { in: ids }, userId: auth.userId },
      select: { id: true },
    });
    if (owned.length !== ids.length) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    Logger.info("Updating messages position", auth.userId, {
      data: {
        body,
      },
    });
    await prisma.$transaction(
      body.map(({ id, position }) =>
        prisma.message.update({
          where: { id },
          data: { position },
        }),
      ),
    );
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating message position", auth.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
