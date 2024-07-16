import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/authOptions";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { CreateFolder } from "../../../models/folder";
import { Folder } from "@prisma/client";

export async function POST(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { folder }: { folder: CreateFolder } = await req.json();
    if (!folder) {
      return NextResponse.json(
        { error: "Message or folder not found" },
        { status: 404 },
      );
    }
    const newMessage = await prisma.folder.create({
      data: {
        ...folder,
        createdAt: new Date(),
        isActive: true,
        timesUsed: 0,
        userId: session.user.userId,
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
    await prisma.folder.update({
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
      folder: Partial<Folder>;
      folderId: string;
    } = await req.json();
    await prisma.folder.update({
      where: {
        id: data.folderId,
      },
      data: {
        ...data.folder,
      },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating message", session.user?.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
