import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../../auth/authOptions";
import prisma from "../../../_db/db";
import {
  PhonecallCountStatistics,
  PhonecallCountStatisticsType,
} from "../../../../../models/statistics";
import {
  dividePhoneCallsToDays,
  dividePhoneCallsToWeeks,
  dividePhoneCallsToMonths,
} from "./_utils";
import loggerServer from "../../../../../loggerServer";

export async function GET(
  req: NextRequest,
  { params }: { params: { type: PhonecallCountStatisticsType } },
): Promise<NextResponse<PhonecallCountStatistics | any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { type } = params;
    let statistics: PhonecallCountStatistics = {};
    // if type is daily, get the last 7 days phonecalls, set them in a json object and return it
    if (type === "daily") {
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const calls = await prisma.phoneCall.findMany({
        where: {
          appUser: {
            webUserId: session.user?.webUserId,
          },
          AND: [
            { startDate: { gte: oneWeekAgo } },
            { endDate: { lte: today } },
          ],
        },
      });
      const dailyCalls = dividePhoneCallsToDays(calls || []);
      statistics.daily = dailyCalls;
    } else if (type === "weekly") {
      const today = new Date();
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const calls = await prisma.phoneCall.findMany({
        where: {
          AND: [
            { startDate: { gte: fourWeeksAgo } },
            { endDate: { lte: today } },
            { userId: session.user?.userId },
          ],
        },
      });
      const dailyCalls = dividePhoneCallsToWeeks(calls || []);
      statistics.weekly = dailyCalls;
    } else if (type === "monthly") {
      const today = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const calls = await prisma.phoneCall.findMany({
        where: {
          AND: [
            { startDate: { gte: twelveMonthsAgo } },
            { endDate: { lte: today } },
            { userId: session.user?.userId },
          ],
        },
      });
      const monthlyCalls = dividePhoneCallsToMonths(calls || []);
      statistics.monthly = monthlyCalls;
    }

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
