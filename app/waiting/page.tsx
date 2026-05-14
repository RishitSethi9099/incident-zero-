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
        const fetched = data?.members ?? [];
        // include self and dedupe by name
        const byName = new Map<string, Member>();
        for (const m of [...fetched, self]) byName.set(m.name, m);
        const list = Array.from(byName.values());
        // sort by role order (Analyst, Communicator, Investigator, null last)
        const order = (r: Member["role"]) => {
          const idx = ROLE_ORDER.indexOf(r);
          return idx === -1 ? 99 : idx;
        };
        list.sort((a, b) => order(a.role) - order(b.role));
        if (list.length) setMembers(list);
      })
      .catch(() => undefined);

    channel.bind("member-joined", (data: Member) => {
      setMembers((prev) => {
        const exists = prev.some((m) => m.name === data.name);
        const next = exists ? prev : [...prev, data];
        // sort by role order
        next.sort((a, b) => {
          const ia = ROLE_ORDER.indexOf(a.role);
          const ib = ROLE_ORDER.indexOf(b.role);
          const va = ia === -1 ? 99 : ia;
          const vb = ib === -1 ? 99 : ib;
          return va - vb;
        });
        try {
          writeLocalMembers(team.teamCode, next);
        } catch {}
        return next;
      });
    });

    const onMemberJoined = (ev: Event) => {
      // also handle window-dispatched joins
      try {
        const detail = (ev as CustomEvent).detail as Member;
        setMembers((prev) => {
          const exists = prev.some((m) => m.name === detail.name);
          const next = exists ? prev : [...prev, detail];
          next.sort((a, b) => {
            const ia = ROLE_ORDER.indexOf(a.role);
            const ib = ROLE_ORDER.indexOf(b.role);
            const va = ia === -1 ? 99 : ia;
            const vb = ib === -1 ? 99 : ib;
            return va - vb;
          });
          try {
            writeLocalMembers(team.teamCode, next);
          } catch {}
          return next;
        });
      } catch {}
    };
    window.addEventListener("team-member-joined", onMemberJoined as any);

    channel.bind("team-ready", () => {
      setCountdown(3);
    });

    return () => {
      pusherClient.unsubscribe(`team-${team.teamCode}`);
      window.removeEventListener("team-member-joined", onMemberJoined as any);
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

  const ROLE_ORDER: Array<Member["role"]> = ["Analyst", "Communicator", "Investigator"];

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
            {ROLE_ORDER.map((role, idx) => {
              const m = members.find((x) => x.role === role);
              return m ? (
                <div key={m.name} className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3">
                  <div className="text-sm font-semibold text-[#E8F0ED] truncate">{m.name}</div>
                  <div className="mt-1 text-xs text-[#5E7269]">{m.role}</div>
                </div>
              ) : (
                <div key={`slot-${idx}`} className="rounded-md border border-dashed border-[#1E2623] bg-[#0C0F0E]/40 p-3 text-xs text-[#5E7269]">
                  Awaiting {role}...
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-sm text-[#5E7269]">
            {hasPusherClient
              ? "Start when you are ready or wait for more teammates to join."
              : "Pusher is not configured. Enter your team code in one browser and press Start anyway."}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => router.push("/investigate")}
              className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E]"
            >
              Enter now →
            </button>
          </div>

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
