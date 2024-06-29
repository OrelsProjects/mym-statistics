import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../auth/authOptions";
import prisma from "../../_db/db";
import Logger from "../../../../loggerServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { folderId: string } },
): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    if (!params.folderId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    await prisma.folder.update({
      where: { id: params.folderId },
      data: { isActive: false },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting message", session.user?.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
