import { NextRequest, NextResponse } from "next/server";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { Message } from "@prisma/client";
import { CreateMessage } from "../../../models/message";
import { requireUser } from "../_utils/requireUser";

export async function GET(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const userMessages = await prisma.message.findMany({
      where: {
        userId: auth.userId,
        isActive: true,
      },
    });
    return NextResponse.json(userMessages, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting user messages", auth.userId, {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
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

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: auth.userId },
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: {
        title: message.title,
        shortTitle: message.shortTitle,
        body: message.body,
        position: message.position,
        createdAt: new Date(),
        isActive: true,
        timesUsed: 0,
        userId: auth.userId,
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
    Logger.error("Error creating message", auth.userId, {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    const message = await prisma.message.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    await prisma.message.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting message", auth.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  try {
    const data: {
      message: Partial<Message>;
      messageId: string;
      folderId: string;
      oldFolderId?: string;
    } = await req.json();

    if (!data.messageId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const message = await prisma.message.findFirst({
      where: { id: data.messageId, userId: auth.userId },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (data.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: data.folderId, userId: auth.userId },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 },
        );
      }
    }

    const messageUpdate: {
      title?: string;
      shortTitle?: string;
      body?: string;
      position?: number;
      isActive: boolean;
    } = { isActive: true };
    if (typeof data.message?.title === "string") {
      messageUpdate.title = data.message.title;
    }
    if (typeof data.message?.shortTitle === "string") {
      messageUpdate.shortTitle = data.message.shortTitle;
    }
    if (typeof data.message?.body === "string") {
      messageUpdate.body = data.message.body;
    }
    if (typeof data.message?.position === "number") {
      messageUpdate.position = data.message.position;
    }

    await prisma.message.update({
      where: {
        id: data.messageId,
      },
      data: messageUpdate,
    });
    if (
      data.oldFolderId &&
      data.folderId &&
      data.folderId !== data.oldFolderId
    ) {
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
    Logger.error("Error updating message", auth.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
