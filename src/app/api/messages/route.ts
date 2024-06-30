import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/authOptions";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { Message } from "@prisma/client";
import { CreateMessage } from "../../../models/message";

export async function GET(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userMessages = await prisma.message.findMany({
      where: {
        id: session.user?.userId,
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

export async function POST(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { message, folderId }: { message: CreateMessage; folderId: string } =
      await req.json();
    if (!message || !folderId) {
      return NextResponse.json(
        { error: "Message or folder not found" },
        { status: 404 },
      );
    }
    const newMessage = await prisma.message.create({
      data: {
        ...message,
        createdAt: new Date(),
        isActive: true,
        timesUsed: 0,
        userId: session.user.userId,
      },
    });
    await prisma.messageInFolder.create({
      data: {
        folderId: folderId,
        messageId: newMessage.id,
      },
    });
    return NextResponse.json({ ...newMessage }, { status: 200 });
  } catch (error: any) {
    Logger.error(
      "Error initializing logger",
      session.user.userId || "unknown",
      {
        error,
      },
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    await prisma.message.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting message", session.user?.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data: {
      message: Partial<Message>;
      messageId: string;
      folderId: string;
      oldFolderId?: string;
    } = await req.json();
    await prisma.message.update({
      where: {
        id: data.messageId,
      },
      data: {
        ...data.message,
        isActive: true,
      },
    });
    if (data.oldFolderId && data.folderId !== data.oldFolderId) {
      await prisma.messageInFolder.update({
        where: {
          messageId_folderId: {
            messageId: data.messageId,
            folderId: data.oldFolderId,
          },
        },
        data: {
          folderId: data.folderId,
          messageId: data.messageId,
        },
      });
    }
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating message", session.user?.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
