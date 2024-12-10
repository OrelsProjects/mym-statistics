import prisma from "@/app/api/_db/db";
import { authOptions } from "@/auth/authOptions";
import Logger from "@/loggerServer";
import { MessageWithNestedFolders } from "@/models/message";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
            webUserId: "112032106198036093254",
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
          webUserId: "112032106198036093254",
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
