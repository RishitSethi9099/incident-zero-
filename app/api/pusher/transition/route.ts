import { NextResponse } from "next/server";
import Pusher from "pusher";
import { mergeRoomStateForTeam } from "@/app/api/pusher/store";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { teamCode?: string; phase?: number };
    const teamCode = body.teamCode?.trim().toUpperCase();
    const phase = body.phase === 2 || body.phase === 3 ? body.phase : 1;

    if (!teamCode) return new NextResponse("Missing teamCode", { status: 400 });

    // Persist phase to room state for new clients
    mergeRoomStateForTeam(teamCode, { phase });

    await pusher.trigger(`team-${teamCode}`, "phase-transition", { phase });

    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Failed to broadcast transition", { status: 500 });
  }
}
