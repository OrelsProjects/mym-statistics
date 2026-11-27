import { authOptions } from "@/auth/authOptions";
import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";

export type AuthorizedUser =
  | { ok: true; session: Session; userId: string }
  | { ok: false; response: NextResponse };

export async function requireUser(): Promise<AuthorizedUser> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  if (!session || !userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session, userId };
}
