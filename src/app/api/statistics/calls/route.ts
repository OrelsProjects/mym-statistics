import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import moment from "moment";
import loggerServer from "@/loggerServer";
import { CallsStatistics } from "@/lib/utils/statisticsUtils";
import { CallRecord, findUnhandledCalls } from "@/lib/utils/unhandledCalls";
import { loadHandledCallIds } from "@/lib/utils/handledCallMarks";
import { requireUser } from "@/app/api/_utils/requireUser";

export async function GET(req: NextRequest): Promise<NextResponse<any>> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
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

    const fromMoment = moment(from);
    const toMoment = moment(to);
    if (!fromMoment.isValid() || !toMoment.isValid()) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const fromDate = fromMoment.clone().startOf("day").toDate();
    const toDate = toMoment.clone().endOf("day").toDate();

    // Calls are "in the period" by start time. Follow-ups after `to` are
    // loaded too so a callback made later still clears an older missed call.
    // endDate is not used: missed calls often have no reliable end.
    // Manual marks are per user, so one account cannot hide another's calls.
    // The marks table may not exist until the production migration runs.
    // That case returns no marks and leaves these statistics unchanged.
    const [calls, marks] = await Promise.all([
      prisma.phoneCall.findMany({
        where: {
          userId: auth.userId,
          startDate: { gte: fromDate },
        },
        select: {
          id: true,
          number: true,
          contactName: true,
          startDate: true,
          type: true,
          isAnswered: true,
          messagesSent: {
            select: {
              id: true,
            },
          },
        },
      }),
      loadHandledCallIds(() =>
        prisma.handledCallMark
          .findMany({
            where: { userId: auth.userId },
            select: { phoneCallId: true },
          })
          .then(rows => rows.map(row => row.phoneCallId)),
      ),
    ]);

    const records: CallRecord[] = calls.map(call => ({
      id: call.id,
      number: call.number,
      contactName: call.contactName,
      startDate: call.startDate,
      type: call.type,
      isAnswered: call.isAnswered,
      messageCount: call.messagesSent.length,
    }));

    const periodRecords = records.filter(
      call => call.startDate.getTime() <= toDate.getTime(),
    );

    const outgoingCalls = periodRecords.filter(
      call => call.type.trim().toUpperCase() === "OUTGOING",
    ).length;
    const incomingCalls = periodRecords.filter(
      call => call.type.trim().toUpperCase() === "INCOMING",
    ).length;
    const taggedCalls = periodRecords.filter(
      call => call.messageCount > 0,
    ).length;
    const unhandledCalls = findUnhandledCalls(
      records,
      {
        from: fromDate,
        to: toDate,
      },
      marks,
    );

    const statistics: CallsStatistics = {
      outgoing: outgoingCalls,
      incoming: incomingCalls,
      tagged: taggedCalls,
      unhandled: unhandledCalls.length,
      unhandledCalls,
    };

    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    loggerServer.error("Error in GET /api/statistics/calls", auth.userId, {
      data: { error },
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
