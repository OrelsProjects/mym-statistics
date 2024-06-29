import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../auth/authOptions";
import Logger from "../../../../loggerServer";
import prisma from "../../_db/db";
import { MessageWithNestedFolders } from "../../../../models/message";

export async function GET(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let userMessages: MessageWithNestedFolders[] =
      await prisma.message.findMany({
        where: {
          appUser: {
            webUserId: session.user?.webUserId,
          },
          isActive: true,
        },
        include: {
          messagesInFolder: {
            include: {
              folder: {
                where: { isActive: true },
              },
            },
          },
        },
      });
    const userFolders = await prisma.folder.findMany({
      where: {
        appUser: {
          webUserId: session.user?.webUserId,
        },
        isActive: true,
      },
    });
    return NextResponse.json(
      { data: userMessages, folders: userFolders },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error(
      "Error getting user messages",
      session.user?.userId || "unknown",
      {
        error,
      },
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
