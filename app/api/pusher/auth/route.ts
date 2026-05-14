import { NextResponse } from "next/server";
import Pusher from "pusher";

import { getRoleOrder, getRosterForTeam, setRosterForTeam, getRoomStateForTeam, touchMember } from "@/app/api/pusher/store";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID ?? "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY ?? "",
  secret: process.env.PUSHER_SECRET ?? "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "",
  useTLS: true,
});

const MAX_TEAM_SIZE = 3;

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
      touchMember(teamCode, existing);
      const roomState = getRoomStateForTeam(teamCode);
      return NextResponse.json({
        role: existing.role,
        channelName: `team-${teamCode}`,
        roomState,
        teamSize: Math.max(2, current.length) as 2 | 3,
      });
    }

    if (current.length >= MAX_TEAM_SIZE) {
      return new NextResponse(
        `Team ${teamCode} is full.\nMaximum 3 members per team.\nContact your team for a new code.`,
        { status: 409 },
      );
    }

    const role = roleOrder[current.length] ?? null;
    if (!role) {
      return new NextResponse(
        `Team ${teamCode} is full.\nMaximum 3 members per team.\nContact your team for a new code.`,
        { status: 409 },
      );
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

    const roomState = getRoomStateForTeam(teamCode);

    return NextResponse.json({
      role,
      channelName: `team-${teamCode}`,
      roomState,
      teamSize: Math.max(2, updated.length) as 2 | 3,
    });
  } catch (e) {
    return new NextResponse("Failed to join team", { status: 500 });
  }
}
