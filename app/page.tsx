"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { setGameState } from "@/lib/gameState";
import { updateRoomState } from "@/lib/roomState";

export default function Home() {
  const router = useRouter();
  const [teamCode, setTeamCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!teamCode.trim() || !memberName.trim()) {
      setError("Enter both team code and member name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pusher/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamCode: teamCode.trim().toUpperCase(),
          memberName: memberName.trim(),
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to join team");
      }

      const data = (await res.json()) as {
        role: "Analyst" | "Communicator" | "Investigator" | null;
        roomState?: Record<string, unknown> | null;
      };

      if (!data.role) {
        setError("Team is full. Ask the facilitator for a new code.");
        return;
      }

      setGameState({
        teamCode: teamCode.trim().toUpperCase(),
        memberName: memberName.trim(),
        role: data.role,
        currentPhase: 1,
      });
      // apply server room state (if any) to local storage so late joiners sync
      if (data.roomState) {
        updateRoomState(data.roomState as any);
      }
      router.push("/waiting");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-104px)] flex items-center justify-center px-6">
      <div className="w-full max-w-[720px]">
        <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-8">
          <div className="text-xs uppercase tracking-[0.4em] text-[#5E7269]">
            ReliefNet / Emergency Access
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">
            Incident Zero
          </div>
          <div className="mt-2 text-sm text-[#5E7269]">
            ReliefNet{"'"}s AI agent crashed at 2:47 AM.
            <br />
            847 requests are unrouted. You have emergency access.
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#5E7269]">Team Code</label>
              <input
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="E.g. ALPHA"
                className="mt-2 w-full rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-sm text-[#E8F0ED] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50"
              />
            </div>
            <div>
              <label className="text-xs text-[#5E7269]">Member Name</label>
              <input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Your name"
                className="mt-2 w-full rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-sm text-[#E8F0ED] focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-[#E24B4A]/40 bg-[#E24B4A]/10 px-4 py-2 text-sm text-[#E8F0ED]">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="rounded-md bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-[#0C0F0E] hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Connecting..." : "Enter the system →"}
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-[#5E7269]">
          Pusher sync enabled. No external auth beyond team code.
        </div>
      </div>
    </div>
  );
}
