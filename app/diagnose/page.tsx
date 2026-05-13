"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Corkboard } from "@/components/phase2/Corkboard";
import { IncidentReport } from "@/components/phase2/IncidentReport";
import { TeamChat } from "@/components/TeamChat";
import { evidenceCards } from "@/data/fakeData";
import { getGameState, setGameState } from "@/lib/gameState";
import { subscribeToTeam } from "@/lib/pusherClient";
import { broadcastUpdate, getRoomState, updateRoomState } from "@/lib/roomState";

export default function DiagnosePage() {
  const router = useRouter();
  const [roomState, setRoomState] = useState(() => getRoomState());
  const game = useMemo(() => getGameState(), []);
  const [currentPhase, setCurrentPhase] = useState(game.currentPhase);

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
    if (currentPhase < 2) router.replace("/investigate");
    if (currentPhase >= 3) router.replace("/build");
  }, [currentPhase, router]);

  function handleSubmit(result: { correct: boolean }) {
    const attempts = roomState.corkboardAttempts + 1;
    const next = updateRoomState({
      corkboardSubmitted: true,
      corkboardCorrect: result.correct,
      corkboardAttempts: attempts,
    });
    setRoomState(next);
    broadcastUpdate({
      corkboardSubmitted: true,
      corkboardCorrect: result.correct,
      corkboardAttempts: attempts,
    });

    if (result.correct) {
      setGameState({ currentPhase: 3 });
      fetch("/api/pusher/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: game.teamCode, phase: 3 }),
      }).catch(() => undefined);
      router.push("/build");
    }
  }

  if (currentPhase < 2) return null;

  return (
    <div className="min-h-[calc(100vh-104px)] px-6 py-6">
      <div className="grid grid-cols-[1fr_320px] gap-6 h-[calc(100vh-140px)]">
        <div className="rounded-lg border border-[#1E2623] bg-[#0C0F0E] p-4">
          <Corkboard cards={evidenceCards} onSubmit={handleSubmit} />
        </div>
        <IncidentReport
          attempts={roomState.corkboardAttempts}
          correct={roomState.corkboardCorrect}
        />
      </div>
      <TeamChat />
    </div>
  );
}
