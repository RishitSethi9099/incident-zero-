"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MissionBrief } from "@/components/phase3/MissionBrief";
import { TestCases } from "@/components/phase3/TestCases";
import { LiveDashboard } from "@/components/phase3/LiveDashboard";
import { SubmissionPanel } from "@/components/phase3/SubmissionPanel";
import { TeamChat } from "@/components/TeamChat";
import { getGameState } from "@/lib/gameState";
import { pusherClient, subscribeToTeam } from "@/lib/pusherClient";

export default function BuildPage() {
  const router = useRouter();
  const game = useMemo(() => getGameState(), []);
  const [currentPhase, setCurrentPhase] = useState(game.currentPhase);
  const [twist, setTwist] = useState<{ twist: number; message: string } | null>(null);

  useEffect(() => {
    const read = () => setCurrentPhase(getGameState().currentPhase);
    read();
    window.addEventListener("game-state", read);
    return () => window.removeEventListener("game-state", read);
  }, []);

  useEffect(() => {
    if (!game.teamCode) return;
    return subscribeToTeam(game.teamCode, () => undefined);
  }, [game.teamCode]);

  useEffect(() => {
    if (currentPhase < 3) router.replace("/diagnose");
  }, [currentPhase, router]);

  useEffect(() => {
    if (!game.teamCode || !pusherClient) return;
    const channel = pusherClient.subscribe(`team-${game.teamCode}`);
    channel.bind("twist-drop", (data: { twist: number; message: string }) => {
      setTwist(data);
    });
    return () => {
      pusherClient?.unsubscribe(`team-${game.teamCode}`);
    };
  }, [game.teamCode]);

  if (currentPhase < 3) return null;

  return (
    <div className="min-h-[calc(100vh-104px)] px-6 py-6">
      <div className="grid grid-cols-[360px_1fr] gap-6">
        <div className="space-y-6">
          <MissionBrief />
          <SubmissionPanel />
        </div>
        <div className="space-y-6">
          <LiveDashboard />
          <TestCases />
        </div>
      </div>

      {twist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-[520px] rounded-lg border border-[#1E2623] bg-[#131817] p-5">
            <div className="text-sm font-semibold text-[#E8F0ED]">
              Twist #{twist.twist}
            </div>
            <div className="mt-2 text-sm text-[#5E7269]">{twist.message}</div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setTwist(null)}
                className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <TeamChat />
    </div>
  );
}
