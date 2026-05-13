"use client";

import { getGameState } from "@/lib/gameState";

export function MissionBrief() {
  const game = getGameState();

  return (
    <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-5">
      <div className="text-sm text-[#5E7269]">Phase 3</div>
      <div className="mt-1 text-2xl font-semibold text-[#E8F0ED]">
        Build & Deploy
      </div>
      <div className="mt-3 text-sm text-[#5E7269]">
        You are now the response engineer. Ship the routing fix and keep accuracy
        above 70%.
      </div>
      <div className="mt-4 rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3 text-xs text-[#E8F0ED]">
        Team {game.teamCode || "—"} • {game.memberName || "Unknown"}
      </div>
    </div>
  );
}
