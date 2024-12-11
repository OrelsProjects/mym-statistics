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
            id: "aec62020-877f-4f18-b9c2-3d767791d46b",
            // webUserId: session.user?.webUserId,
          },
          isActive: true,
        },
        include: {
          messagesInFolder: {
            include: {
              folder: true,
            },
          },
        },
      });

    // remove folders that are not active
    userMessages = userMessages.map(message => {
      message.messagesInFolder = message.messagesInFolder.filter(
        messageInFolder => messageInFolder.folder?.isActive,
      );
      return message;
    });

    const userFolders = await prisma.folder.findMany({
      where: {
        appUser: {
          id: "aec62020-877f-4f18-b9c2-3d767791d46b",
          // webUserId: session.user?.webUserId,
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
