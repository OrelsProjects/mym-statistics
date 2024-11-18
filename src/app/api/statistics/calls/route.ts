import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/authOptions";
import prisma from "@/app/api/_db/db";
import moment from "moment";
import loggerServer from "@/loggerServer";
import { CallsStatistics } from "@/lib/utils/statisticsUtils";

export async function GET(req: NextRequest): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing 'from' or 'to' query parameters" },
        { status: 400 },
      );
    }

    const fromDate = moment(from).startOf("day").toDate();
    const toDate = moment(to).endOf("day").toDate();

    const calls = await prisma.phoneCall.findMany({
      where: {
        AND: [
          { startDate: { gte: fromDate } },
          { endDate: { lte: toDate } },
          { userId: "aec62020-877f-4f18-b9c2-3d767791d46b" },
        ],
      },
      include: {
        messagesSent: {
          select: {
            id: true,
          },
        },
      },
    });

    const outgoingCalls = calls.filter(call => call.type === "OUTGOING").length;
    const incomingCalls = calls.filter(call => call.type === "INCOMING").length;
    const taggedCalls = calls.filter(
      call => call.messagesSent.length > 0,
    ).length;

    const statistics: CallsStatistics = {
      outgoing: outgoingCalls,
      incoming: incomingCalls,
      tagged: taggedCalls,
    };

    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    loggerServer.error(
      "Error in GET /api/statistics/callsCount",
      session.user?.userId,
      { data: { error } },
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
