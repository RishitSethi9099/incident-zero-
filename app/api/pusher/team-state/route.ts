import { NextResponse } from "next/server";

import { getRosterForTeam, getRoomStateForTeam } from "@/app/api/pusher/store";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teamCode = url.searchParams.get("teamCode")?.trim().toUpperCase();

    if (!teamCode) {
      return new NextResponse("Missing teamCode", { status: 400 });
    }

    const roster = getRosterForTeam(teamCode);
    const roomState = getRoomStateForTeam(teamCode);
    
    const hasStarted = roomState !== null;

    return NextResponse.json({
      roster,
      hasStarted,
      phase: roomState?.phase ?? 1,
    });
  } catch {
    return new NextResponse("Failed to get team state", { status: 500 });
  }
}
