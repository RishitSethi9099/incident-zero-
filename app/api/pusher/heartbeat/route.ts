import { NextResponse } from "next/server";

import { touchMember } from "@/app/api/pusher/store";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { teamCode?: string; memberName?: string; role?: "Analyst" | "Communicator" | "Investigator" | null };
    const teamCode = body.teamCode?.trim().toUpperCase();
    const memberName = body.memberName?.trim();
    const role = body.role ?? null;

    if (!teamCode || !memberName) {
      return new NextResponse("Missing teamCode or memberName", { status: 400 });
    }

    touchMember(teamCode, { name: memberName, role });
    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Failed to update heartbeat", { status: 500 });
  }
}
