import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/authOptions";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";
import { Message } from "@prisma/client";

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
    const { message }: { message: Message } = await req.json();
    await prisma.message.create({
      data: {
        ...message,
        userId: session.user.userId,
      },
    });
    return NextResponse.json({}, { status: 200 });
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
    await prisma.message.delete({
      where: { id },
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
    const data: Partial<Message> = await req.json();
    await prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        ...data,
      },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating message", session.user?.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
