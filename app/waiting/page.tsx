"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getGameState } from "@/lib/gameState";
import { hasPusherClient, pusherClient } from "@/lib/pusherClient";

type Member = {
  name: string;
  role: "Analyst" | "Communicator" | "Investigator" | null;
};

type StoredMember = Member & { ts: number };

const STALE_MEMBER_MS = 6 * 60 * 60 * 1000;

function localTeamKey(teamCode: string) {
  return `incident-zero:team:${teamCode}:members`;
}

function readLocalMembers(teamCode: string): Member[] {
  const raw = window.localStorage.getItem(localTeamKey(teamCode));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredMember[];
    const now = Date.now();
    return parsed
      .filter((m) => now - m.ts < STALE_MEMBER_MS)
      .map(({ name, role }) => ({ name, role }));
  } catch {
    return [];
  }
}

function writeLocalMembers(teamCode: string, members: Member[]) {
  const now = Date.now();
  const payload: StoredMember[] = members.map((m) => ({ ...m, ts: now }));
  window.localStorage.setItem(localTeamKey(teamCode), JSON.stringify(payload));
}

function mergeMemberList(members: Member[], incoming: Member) {
  const exists = members.some((m) => m.name === incoming.name);
  return exists ? members : [...members, incoming];
}

export default function WaitingPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const team = useMemo(() => getGameState(), []);

  useEffect(() => {
    if (!team.teamCode || !team.memberName) {
      router.replace("/");
      return;
    }

    const self: Member = { name: team.memberName, role: team.role };
    setMembers([self]);

    if (!pusherClient) {
      const next = mergeMemberList(readLocalMembers(team.teamCode), self);
      setMembers(next);
      writeLocalMembers(team.teamCode, next);

      const onStorage = (event: StorageEvent) => {
        if (event.key !== localTeamKey(team.teamCode)) return;
        setMembers(readLocalMembers(team.teamCode));
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    const channel = pusherClient.subscribe(`team-${team.teamCode}`);

    fetch(`/api/pusher/roster?teamCode=${team.teamCode}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { members?: Member[] } | null) => {
        if (data?.members?.length) setMembers(data.members);
      })
      .catch(() => undefined);

    channel.bind("member-joined", (data: Member) => {
      setMembers((prev) => {
        const exists = prev.some((m) => m.name === data.name);
        return exists ? prev : [...prev, data];
      });
    });

    channel.bind("team-ready", () => {
      setCountdown(3);
    });

    return () => {
      pusherClient.unsubscribe(`team-${team.teamCode}`);
    };
  }, [router, team.memberName, team.role, team.teamCode]);

  useEffect(() => {
    if (hasPusherClient) return;
    if (members.length >= 3 && countdown === null) setCountdown(3);
  }, [countdown, members.length]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.push("/investigate");
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => (c ? c - 1 : 0)), 1000);
    return () => window.clearTimeout(id);
  }, [countdown, router]);

  return (
    <div className="min-h-[calc(100vh-104px)] px-6 py-10">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-6">
          <div className="text-sm text-[#5E7269]">Waiting Room</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            Team {team.teamCode}
          </div>
          <div className="mt-2 text-sm text-[#5E7269]">
            You are locked in as {team.memberName} ({team.role}).
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {members.map((m) => (
              <div
                key={m.name}
                className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3"
              >
                <div className="text-sm font-semibold text-[#E8F0ED]">
                  {m.name}
                </div>
                <div className="mt-1 text-xs text-[#5E7269]">
                  {m.role ?? "Assigning role"}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - members.length) }).map((_, idx) => (
              <div
                key={`slot-${idx}`}
                className="rounded-md border border-dashed border-[#1E2623] bg-[#0C0F0E]/40 p-3 text-xs text-[#5E7269]"
              >
                Awaiting teammate...
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-sm text-[#5E7269]">
            {hasPusherClient
              ? "We will begin once all roles are filled."
              : "Pusher is not configured. Enter your team code in one browser and press Start anyway."}
          </div>

          {!hasPusherClient && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => router.push("/investigate")}
                className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E]"
              >
                Start anyway →
              </button>
            </div>
          )}

          {countdown !== null && (
            <div className="mt-6 text-center text-4xl font-semibold text-[#1D9E75]">
              {countdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
