import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import prisma from "@/app/api/_db/db";
import Logger from "@/loggerServer";
import { MessagePosition } from "@/lib/hooks/useMessage";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { messageId: string } },
): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as MessagePosition[];
    Logger.info("Updating messages position", session.user?.userId, {
      data: {
        body,
      },
    });
    await prisma.$transaction(
      body.map(({ id, position }) =>
        prisma.message.update({
          where: { id },
          data: { position },
        }),
      ),
    );
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting message", session.user?.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
