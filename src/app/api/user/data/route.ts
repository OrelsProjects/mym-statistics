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
        },
        include: {
          messagesInFolder: {
            include: { folder: true },
          },
        },
      });

    return NextResponse.json(userMessages, { status: 200 });
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
