import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import prisma from "@/app/api/_db/db";
import { PhonecallCountStatistics } from "@/models/statistics";
import loggerServer from "@/loggerServer";
import moment from "moment";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<PhonecallCountStatistics | any>> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const fromDate = moment(from).startOf("day").toDate();
    const toDate = moment(to).endOf("day").toDate();

    const group = await prisma.messageSent.groupBy({
      by: ["messageId"],
      where: {
        sentAt: {
          gte: fromDate,
          lte: toDate,
        },
        message: {
          userId: "aec62020-877f-4f18-b9c2-3d767791d46b",
        },
      },
      _count: {
        messageId: true,
      },
      orderBy: {
        _count: {
          messageId: "desc",
        },
      },
    });

    // get the message title by id
    const messages = await prisma.message.findMany({
      where: {
        id: {
          in: group.map(stat => stat.messageId),
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    // add the title to the statistics
    const statistics = group.map(stat => {
      const message = messages.find(msg => msg.id === stat.messageId);
      return {
        title: message?.title,
        count: stat._count.messageId,
      };
    });

    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    loggerServer.error(
      "Error in GET /api/statistics/callsCount/:type",
      session.user?.userId,
      { data: { error } },
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<any> {}
