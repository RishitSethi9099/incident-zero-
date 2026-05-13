import { NextResponse } from "next/server";
import Pusher from "pusher";

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
      update?: Record<string, unknown>;
      event?: string;
      payload?: Record<string, unknown>;
    };

    const teamCode = body.teamCode?.trim().toUpperCase();
    if (!teamCode) return new NextResponse("Missing teamCode", { status: 400 });

    const event = body.event ?? "room-update";
    const payload = body.payload ?? body.update ?? {};

    await pusher.trigger(`team-${teamCode}`, event, payload);

    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Failed to broadcast", { status: 500 });
  }
}
