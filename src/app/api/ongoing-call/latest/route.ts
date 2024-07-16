import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../auth/authOptions";
import Logger from "../../../../loggerServer";
import prisma from "../../_db/db";
import { OngoingCall } from "@prisma/client";

const MAX_TIME_DIFF = 10000;

export async function GET(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = session.user;

    const ongoingCall = await prisma.ongoingCall.findFirst({
      where: {
        userId,
      },
      select: {
        number: true,
        contactName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const latestPhoneCall = await prisma.phoneCall.findFirst({
      where: {
        userId,
        number: ongoingCall?.number,
        endDate: {
          not: null,
        },
      },
      select: {
        startDate: true,
        number: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (!ongoingCall) {
      return NextResponse.json(
        { error: "No ongoing call found" },
        { status: 404 },
      );
    }

    if (!latestPhoneCall) {
      return ongoingCall;
    }

    const callStartDate = new Date(latestPhoneCall.startDate).getTime();
    const ongoingCallCreatedAt = new Date(ongoingCall.createdAt).getTime();
    const marginOfErrorSeconds = 2000;

    if (callStartDate < ongoingCallCreatedAt - marginOfErrorSeconds) {
      // the call is ongoing
      return NextResponse.json({ ongoingCall }, { status: 200 });
    }

    const diff = callStartDate - ongoingCallCreatedAt;

    const responseBody: { diff: number; ongoingCall?: Partial<OngoingCall> } = {
      diff,
    };

    if (diff > MAX_TIME_DIFF) {
      // If the difference is greater than 10 seconds, return the ongoing call.
      responseBody.ongoingCall = ongoingCall;
    }

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting latest ongoing call", session.user?.userId, {
      error,
    });
  }
}

export async function POST(req: NextRequest): Promise<any> {}
