import { NextResponse } from "next/server";
import { setRoomStateForTeam } from "@/app/api/pusher/store";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { teamCode?: string };
    const teamCode = body.teamCode?.trim().toUpperCase();

    if (!teamCode) {
      return new NextResponse("Missing teamCode", { status: 400 });
    }

    // Mark the team as started by setting a minimal room state
    setRoomStateForTeam(teamCode, { started: true, startedAt: Date.now() });

    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Failed to mark team as started", { status: 500 });
  }
}
