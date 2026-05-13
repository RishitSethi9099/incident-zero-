import { NextResponse } from "next/server";
import Pusher from "pusher";

import { getRoleOrder, getRosterForTeam, setRosterForTeam } from "@/app/api/pusher/store";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { teamCode?: string; memberName?: string };
    const teamCode = body.teamCode?.trim().toUpperCase();
    const memberName = body.memberName?.trim();

    if (!teamCode || !memberName) {
      return new NextResponse("Missing teamCode or memberName", { status: 400 });
    }

    const roleOrder = getRoleOrder();
    const current = getRosterForTeam(teamCode);
    const existing = current.find((m) => m.name === memberName);

    if (existing) {
      return NextResponse.json({ role: existing.role, channelName: `team-${teamCode}` });
    }

    const role = roleOrder[current.length] ?? null;
    if (!role) {
      return NextResponse.json({ role: null, channelName: `team-${teamCode}` });
    }

    const updated = [...current, { name: memberName, role }];
    setRosterForTeam(teamCode, updated);

    await pusher.trigger(`team-${teamCode}`, "member-joined", {
      name: memberName,
      role,
    });

    if (updated.length >= roleOrder.length) {
      await pusher.trigger(`team-${teamCode}`, "team-ready", { ready: true });
    }

    return NextResponse.json({ role, channelName: `team-${teamCode}` });
  } catch (e) {
    return new NextResponse("Failed to join team", { status: 500 });
  }
}
