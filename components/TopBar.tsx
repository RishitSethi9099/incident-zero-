"use client";

import { useEffect, useMemo, useState } from "react";

import { getGameState, setGameState } from "@/lib/gameState";
import { getRoomState } from "@/lib/roomState";

function formatIst(d: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

export function TopBar() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [roomState, setRoomState] = useState(() => getRoomState());
  const [gameState, setLocalGameState] = useState(() => getGameState());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const read = () => {
      setRoomState(getRoomState());
      setLocalGameState(getGameState());
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("game-state", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("game-state", read);
    };
  }, []);

  const ist = useMemo(() => formatIst(now), [now]);
  const allArtifacts =
    roomState.artifact1 &&
    roomState.artifact2 &&
    roomState.artifact3 &&
    roomState.artifact4;
  const showPhone = allArtifacts && gameState.currentPhase === 1;

  return (
    <header className="h-[56px] border-b border-[#1E2623] bg-[#0C0F0E]/90 backdrop-blur px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm font-semibold tracking-[0.2em] text-[#E8F0ED]">
          INCIDENT ZERO
        </div>
        {gameState.teamCode && (
          <div className="text-xs text-[#5E7269]">
            Team {gameState.teamCode} • {gameState.role ?? "Unassigned"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showPhone && (
          <button
            type="button"
            onClick={() => {
              if (!gameState.teamCode) return;
              setGameState({ currentPhase: 2 });
              fetch("/api/pusher/transition", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamCode: gameState.teamCode, phase: 2 }),
              }).catch(() => undefined);
              setLocalGameState(getGameState());
            }}
            className="relative rounded-full border border-[#E24B4A]/40 bg-[#E24B4A]/10 px-3 py-1 text-xs font-semibold text-[#E24B4A] hover:bg-[#E24B4A]/20"
          >
            <span className="absolute -inset-1 rounded-full border border-[#E24B4A]/30 animate-pulse" />
            <span className="relative flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E24B4A]" />
              Call Command
            </span>
          </button>
        )}

        <div className="text-xs text-[#5E7269] tabular-nums">
          <span className="text-[#1D9E75]">IST</span> {ist}
        </div>
      </div>
    </header>
  );
}
