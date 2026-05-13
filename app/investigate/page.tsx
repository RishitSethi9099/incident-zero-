"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DiscoveriesBar } from "@/components/DiscoveriesBar";
import { TeamChat } from "@/components/TeamChat";
import { BrokenOutputTable } from "@/components/phase1/BrokenOutputTable";
import { CrashLog } from "@/components/phase1/CrashLog";
import { DashboardStats } from "@/components/phase1/DashboardStats";
import { InboxPanel } from "@/components/phase1/InboxPanel";
import { SlackChannel } from "@/components/phase1/SlackChannel";
import {
  brokenOutputRows,
  crashLogLines,
  inboxItems,
  slackMessages,
  zoneCards,
} from "../../data/fakeData";
import { getGameState } from "@/lib/gameState";
import { subscribeToTeam } from "@/lib/pusherClient";
import type { RoomState } from "@/lib/roomState";
import { addDiscovery, broadcastUpdate, getRoomState, updateRoomState } from "@/lib/roomState";

export default function InvestigatePage() {
  const router = useRouter();
  const [roomState, setRoomState] = useState(() => getRoomState());
  const game = useMemo(() => getGameState(), []);
  const [currentPhase, setCurrentPhase] = useState(game.currentPhase);

  useEffect(() => {
    if (!game.teamCode) {
      router.replace("/");
      return;
    }
    const unsubscribe = subscribeToTeam(game.teamCode, (data: Partial<RoomState>) => {
      const next = updateRoomState(data);
      setRoomState(next);
    });
    return () => {
      unsubscribe();
    };
  }, [game.teamCode, router]);

  useEffect(() => {
    const read = () => setCurrentPhase(getGameState().currentPhase);
    read();
    window.addEventListener("game-state", read);
    return () => window.removeEventListener("game-state", read);
  }, []);

  useEffect(() => {
    if (currentPhase >= 3) router.replace("/build");
    else if (currentPhase >= 2) router.replace("/diagnose");
  }, [currentPhase, router]);

  function pushUpdate(updates: Partial<typeof roomState>, discovery?: { id: string; label: string }) {
    let next = updateRoomState(updates as any);
    if (discovery && game.memberName) {
      const added = addDiscovery(next, {
        id: discovery.id,
        label: discovery.label,
        member: game.memberName,
      });
      next = added.next;
      if (added.added) {
        updateRoomState({ discoveries: next.discoveries } as any);
        updates = { ...updates, discoveries: next.discoveries } as any;
      }
    }
    setRoomState(next);
    broadcastUpdate(updates as any);
  }

  const allArtifacts =
    roomState.artifact1 &&
    roomState.artifact2 &&
    roomState.artifact3 &&
    roomState.artifact4;

  const analystLocked = game.role !== "Analyst";
  const investigatorLocked = game.role !== "Investigator";
  const communicatorLocked = game.role !== "Communicator";

  return (
    <div className="relative min-h-[calc(100vh-104px)] px-6 py-6 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[#E24B4A] opacity-[0.03] mix-blend-multiply animate-alarm-pulse" />

      <div className="relative z-10 h-full grid grid-cols-[300px_1fr_300px] gap-6 min-w-0">
        <aside className={(analystLocked ? "opacity-40 pointer-events-none " : "") + "min-w-0"}>
          <div className="space-y-4">
            <DashboardStats
              zones={zoneCards}
              roomState={roomState}
              onErrorModal={() =>
                pushUpdate({ errorModalTriggered: true }, { id: "error-modal", label: "NULL_DESTINATION" })
              }
              onZoneF={() =>
                pushUpdate({ zoneFFound: true }, { id: "zone-f", label: "Zone F discarded" })
              }
            />
            <div>
              <div className="text-sm font-semibold text-[#E8F0ED]">Crash Log</div>
              <div className="mt-2">
                <CrashLog
                  entries={crashLogLines}
                  roomState={roomState}
                  decodeEnabled={roomState.versionPassphraseEntered || roomState.systemNotesRead}
                  onDecoded={() =>
                    pushUpdate(
                      { crashLogDecoded: true, artifact1: true },
                      { id: "artifact-1", label: "Crash log decoded" },
                    )
                  }
                  onRedactedFound={() =>
                    pushUpdate({ redactedLineFound: true }, { id: "redacted", label: "Redacted config" })
                  }
                />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#E8F0ED]">Broken Output</div>
              <div className="mt-2 rounded-md border border-[#1E2623] bg-[#0C0F0E]">
                <BrokenOutputTable
                  rows={brokenOutputRows}
                  roomState={roomState}
                  onHiddenColumnsFound={() =>
                    pushUpdate(
                      { hiddenColumnsFound: true },
                      { id: "hidden-columns", label: "Hidden columns found" },
                    )
                  }
                />
              </div>
            </div>
          </div>
        </aside>

        <main className={(investigatorLocked ? "opacity-40 pointer-events-none " : "") + "min-w-0"}>
          <div className="rounded-lg border border-[#1E2623] bg-[#131817] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#5E7269]">ReliefNet Internal</div>
                <div className="text-lg font-semibold tracking-tight">
                  Incident: Agent Crash @ 02:47 IST
                </div>
              </div>
              <div className="text-xs text-[#5E7269]">
                Queue frozen • Manual routing required
              </div>
            </div>
          </div>

          <div className="mt-4 h-[calc(100%-120px)]">
            <InboxPanel
              items={inboxItems}
              roomState={roomState}
              onTooltipRead={(count) =>
                pushUpdate({ inboxTooltipsRead: count }, { id: "tooltips", label: "Tooltips reviewed" })
              }
              onPassphraseEntered={() =>
                pushUpdate({ versionPassphraseEntered: true }, { id: "passphrase", label: "Passphrase found" })
              }
              onSystemNotesRead={() =>
                pushUpdate(
                  { systemNotesRead: true, artifact4: true },
                  { id: "artifact-4", label: "Confidence threshold" },
                )
              }
            />
          </div>
        </main>

        <aside className={(communicatorLocked ? "opacity-40 pointer-events-none " : "") + "min-w-0"}>
          <SlackChannel
            messages={slackMessages}
            roomState={roomState}
            onScrolledToCSV={() =>
              pushUpdate(
                { slackScrolledToCSV: true, artifact3: true },
                { id: "artifact-3", label: "Team names confirmed" },
              )
            }
            onAttachmentOpened={() =>
              pushUpdate(
                { priyaAttachmentOpened: true, artifact2: true },
                { id: "artifact-2", label: "Routing matrix CSV" },
              )
            }
          />
        </aside>
      </div>

      <div className="mt-4">
        <DiscoveriesBar
          discoveries={roomState.discoveries}
          allArtifacts={allArtifacts}
        />
      </div>
      <TeamChat />
    </div>
  );
}
