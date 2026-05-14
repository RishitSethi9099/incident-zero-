"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getGameState, setGameState } from "@/lib/gameState";
import { hasPusherClient, pusherClient } from "@/lib/pusherClient";

type Member = {
  name: string;
  role: "Analyst" | "Communicator" | "Investigator" | null;
  status?: "waiting" | "in-game";
};

type RosterPayload = {
  members?: Member[];
  hasStarted?: boolean;
  phase?: number;
};

const ROLE_ORDER: Array<Member["role"]> = ["Analyst", "Communicator", "Investigator"];

function sortMembers(members: Member[]) {
  return [...members].sort((a, b) => {
    const ia = ROLE_ORDER.indexOf(a.role);
    const ib = ROLE_ORDER.indexOf(b.role);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function WaitingPage() {
  const router = useRouter();
  const team = useMemo(() => getGameState(), []);
  const [members, setMembers] = useState<Member[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [manualStart, setManualStart] = useState(false);
  const [teamStarted, setTeamStarted] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  // Shared: marks the game as started on the server, then navigates.
  // Called by the person who initiates (countdown=0 or button), and also
  // triggered locally when a game-started push arrives from a teammate.
  const doStart = useMemo(() => (size: number) => {
    setGameState({ teamSize: size as 2 | 3 });
    fetch("/api/pusher/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamCode: team.teamCode, teamSize: size }),
    }).catch(() => undefined);
    router.push("/investigate");
  }, [team.teamCode, router]);

  useEffect(() => {
    if (!team.teamCode || !team.memberName) {
      router.replace("/");
      return;
    }

    let mounted = true;

    const syncRoster = async () => {
      const res = await fetch(`/api/pusher/team-state?teamCode=${team.teamCode}`);
      if (!res.ok) return;
      const data = (await res.json()) as { roster: Member[]; hasStarted: boolean; phase: number };
      if (!mounted) return;
      const unique = (data.roster ?? []).filter((member, idx, arr) => arr.findIndex((x) => x.name === member.name) === idx);
      const withStatus = unique.map((m) => ({
        ...m,
        status: data.hasStarted && m.name !== team.memberName ? ("in-game" as const) : ("waiting" as const),
      }));
      setMembers(sortMembers(withStatus));
      setTeamStarted(data.hasStarted ?? false);
    };

    const heartbeat = () => {
      fetch("/api/pusher/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: team.teamCode, memberName: team.memberName, role: team.role }),
      }).catch(() => undefined);
    };

    heartbeat();
    void syncRoster();

    const rosterInterval = window.setInterval(syncRoster, 3000);
    const heartbeatInterval = window.setInterval(heartbeat, 15000);

    if (hasPusherClient && pusherClient) {
      const channel = pusherClient.subscribe(`team-${team.teamCode}`);
      channel.bind("member-joined", (data: Member) => {
        setMembers((prev) => sortMembers([...prev.filter((member) => member.name !== data.name), data]));
      });
      // Instant redirect when a teammate fires the start
      channel.bind("game-started", (data: { teamSize?: number }) => {
        if (!mounted) return;
        setGameState({ teamSize: (data.teamSize ?? 2) as 2 | 3 });
        router.push("/investigate");
      });
      return () => {
        mounted = false;
        window.clearInterval(rosterInterval);
        window.clearInterval(heartbeatInterval);
        pusherClient.unsubscribe(`team-${team.teamCode}`);
      };
    }

    return () => {
      mounted = false;
      window.clearInterval(rosterInterval);
      window.clearInterval(heartbeatInterval);
    };
  }, [team.memberName, team.role, team.teamCode, router]);

  const connectedCount = members.length;
  const activeMembers = members.slice(0, 3);
  const teamSize = connectedCount >= 3 ? 3 : 2;
  const oneMember = connectedCount === 1;
  const twoMember = connectedCount === 2;
  const threeMember = connectedCount >= 3;
  const canStart = connectedCount >= 2;

  useEffect(() => {
    if (teamStarted && team.role) {
      setGameState({ teamSize: teamSize as 2 | 3 });
      router.push("/investigate");
    }
  }, [teamStarted, team.role, teamSize, router]);


  useEffect(() => {
    if (canStart && !timerStarted) {
      setCountdown(300);
      setTimerStarted(true);
    }
  }, [canStart, timerStarted]);

  useEffect(() => {
    if (!canStart) {
      setCountdown(null);
      return;
    }
  }, [canStart]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      doStart(teamSize);
      return;
    }
    const id = window.setTimeout(() => setCountdown((current) => (current ? current - 1 : 0)), 1000);
    return () => window.clearTimeout(id);
  }, [countdown, doStart, teamSize]);

  function startNow() {
    if (!canStart) return;
    setManualStart(true);
    doStart(teamSize);
  }

  if (teamStarted && team.role) {
    return (
      <div className="min-h-[calc(100vh-104px)] px-6 py-10">
        <div className="mx-auto w-full max-w-[720px]">
          <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-6">
            <div className="text-xs uppercase tracking-[0.4em] text-[#5E7269]">Incident Zero</div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">Team {team.teamCode} is already in progress.</div>

            <div className="mt-6 space-y-2">
              {activeMembers.map((member) => (
                <div key={member.name} className="flex items-center gap-3 text-sm text-[#E8F0ED]">
                  <span className="h-2 w-2 rounded-full bg-[#1D9E75]"></span>
                  <span className="font-semibold">{member.name}</span>
                  <span className="text-xs text-[#5E7269]">— {member.role} (in game)</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-sm text-[#5E7269]">
              <div>You will join as {team.role}.</div>
              <div className="mt-2">Your section: {team.role === "Investigator" ? "Center column" : team.role === "Analyst" ? "Left column" : "Right column"}</div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setGameState({ teamSize: teamSize as 2 | 3 });
                  router.push("/investigate");
                }}
                className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E]"
              >
                Join the mission →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-104px)] px-6 py-10">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-6">
          <div className="text-sm text-[#5E7269]">Waiting Room</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">Team {team.teamCode}</div>
          <div className="mt-2 text-sm text-[#5E7269]">You are locked in as {team.memberName} ({team.role}).</div>

          <div className="mt-4 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-xs text-[#5E7269]">
            <div>⚠ Minimum 2 members required to begin.</div>
            <div className="mt-1">Maximum 3 members per team.</div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {ROLE_ORDER.map((role, idx) => {
              const member = activeMembers.find((entry) => entry.role === role);
              return member ? (
                <div key={member.name} className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#5E7269]">{role}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {member.status === "in-game" && <span className="h-2 w-2 rounded-full bg-[#1D9E75]"></span>}
                    <span className="text-sm font-semibold text-[#E8F0ED] truncate">{member.name}</span>
                  </div>
                  {member.status === "in-game" && <div className="mt-1 text-xs text-[#5E7269]">Already in game</div>}
                  {member.name === team.memberName && <div className="mt-1 text-xs text-[#1D9E75]">You (waiting)</div>}
                </div>
              ) : (
                <div key={`slot-${idx}`} className="rounded-md border border-dashed border-[#1E2623] bg-[#0C0F0E]/40 p-3 text-xs text-[#5E7269]">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#5E7269]">{role}</div>
                  <div className="mt-1">Waiting for {role}...</div>
                </div>
              );
            })}
          </div>

          {oneMember && (
            <div className="mt-6 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-sm text-[#5E7269]">
              Waiting for at least one more teammate...
            </div>
          )}

          {twoMember && (
            <div className="mt-6 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-sm text-[#5E7269]">
              {connectedCount} members connected. You can start now or wait for a 3rd member (optional).
              <div className="mt-2 text-xs text-[#1D9E75]">Starting automatically in {formatCountdown(countdown ?? 300)} unless a 3rd member joins</div>
            </div>
          )}

          {threeMember && (
            <div className="mt-6 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-4 py-3 text-sm text-[#5E7269]">
              All 3 connected. Starting automatically.
            </div>
          )}

          <div className="mt-4 flex flex-col items-start gap-3">
            {canStart ? (
              <button
                type="button"
                onClick={startNow}
                className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E]"
              >
                Start with {connectedCount} →
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E] cursor-not-allowed opacity-50"
              >
                Start with 2 →
              </button>
            )}
            {!canStart && <span className="text-xs text-[#5E7269]">Start button disabled until a second teammate joins.</span>}
          </div>

          {countdown !== null && (
            <div className="mt-6 text-center text-4xl font-semibold text-[#1D9E75]">
              {countdown >= 60 ? formatCountdown(countdown) : countdown}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
