import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import Logger from "../../../../loggerServer";
import { requireUser } from "../../_utils/requireUser";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { folderId: string } },
): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  try {
    if (!params.folderId) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    const folder = await prisma.folder.findFirst({
      where: { id: params.folderId, userId: auth.userId },
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    await prisma.folder.update({
      where: { id: params.folderId },
      data: { isActive: false },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting folder", auth.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
