import { NextResponse } from "next/server";

import { getRosterForTeam } from "@/app/api/pusher/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamCode = searchParams.get("teamCode")?.trim().toUpperCase();

  if (!teamCode) {
    return new NextResponse("Missing teamCode", { status: 400 });
  }

  const members = getRosterForTeam(teamCode);
  return NextResponse.json({ members });
}
