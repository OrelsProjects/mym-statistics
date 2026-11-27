import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import Logger from "../../../../loggerServer";
import { requireUser } from "../../_utils/requireUser";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } },
): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  try {
    if (!params.messageId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    const message = await prisma.message.findFirst({
      where: { id: params.messageId, userId: auth.userId },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    await prisma.message.update({
      where: { id: params.messageId },
      data: { isActive: false },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting message", auth.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
