import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../../loggerServer";
import prisma from "../../_db/db";
import { OngoingCall } from "@prisma/client";
import { requireUser } from "../../_utils/requireUser";

const MAX_TIME_DIFF = 10000;

export async function GET(req: NextRequest): Promise<any> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { userId } = auth;

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
      return NextResponse.json({ ongoingCall }, { status: 200 });
    }

    const callStartDate = new Date(latestPhoneCall.startDate).getTime();
    const ongoingCallCreatedAt = new Date(ongoingCall.createdAt).getTime();
    const marginOfErrorSeconds = 10000;

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
    Logger.error("Error getting latest ongoing call", auth.userId, {
      error,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<any> {}
