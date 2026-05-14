import { NextResponse } from "next/server";
import Pusher from "pusher";
import { setRoomStateForTeam } from "@/app/api/pusher/store";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      teamCode?: string;
      teamSize?: number;
    };

    const teamCode = body.teamCode?.trim().toUpperCase();
    if (!teamCode) {
      return new NextResponse("Missing teamCode", { status: 400 });
    }

    // Mark the team as started by setting an initial room state.
    // This makes hasStarted = true for anyone polling /api/pusher/team-state.
    setRoomStateForTeam(teamCode, {
      phase: 1,
      teamSize: body.teamSize ?? 2,
      startedAt: Date.now(),
    });

    // Broadcast so waiting-room clients get an instant push instead of
    // waiting up to 3 s for their next poll.
    await pusher.trigger(`team-${teamCode}`, "game-started", {
      teamSize: body.teamSize ?? 2,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Failed to start game", { status: 500 });
  }
}
