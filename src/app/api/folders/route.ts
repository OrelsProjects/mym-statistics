import { NextRequest, NextResponse } from "next/server";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { CreateFolder } from "../../../models/folder";
import { Folder } from "@prisma/client";
import { requireUser } from "../_utils/requireUser";

export async function POST(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  try {
    const { folder }: { folder: CreateFolder } = await req.json();
    if (!folder || typeof folder.title !== "string") {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    const newFolder = await prisma.folder.create({
      data: {
        title: folder.title,
        position: typeof folder.position === "number" ? folder.position : 0,
        createdAt: new Date(),
        isActive: true,
        timesUsed: 0,
        userId: auth.userId,
      },
    });
    return NextResponse.json({ ...newFolder }, { status: 200 });
  } catch (error: any) {
    Logger.error("Error creating folder", auth.userId, {
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
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    const folder = await prisma.folder.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    await prisma.folder.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting folder", auth.userId, { error });
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
      folder: Partial<Folder>;
      folderId: string;
    } = await req.json();
    if (!data.folderId) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    const existing = await prisma.folder.findFirst({
      where: { id: data.folderId, userId: auth.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const folderUpdate: { title?: string; position?: number } = {};
    if (typeof data.folder?.title === "string") {
      folderUpdate.title = data.folder.title;
    }
    if (typeof data.folder?.position === "number") {
      folderUpdate.position = data.folder.position;
    }
    if (Object.keys(folderUpdate).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await prisma.folder.update({
      where: {
        id: data.folderId,
      },
      data: folderUpdate,
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating folder", auth.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
