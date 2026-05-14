"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DiscoveriesBar } from "@/components/DiscoveriesBar";
import { TeamChat } from "@/components/TeamChat";
import { BrokenOutputTable } from "@/components/phase1/BrokenOutputTable";
import { CrashLog } from "@/components/phase1/CrashLog";
import { DashboardStats } from "@/components/phase1/DashboardStats";
import { ClueStrip } from "@/components/phase1/ClueStrip";
import { PanelModals } from "@/components/phase1/PanelModals";
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
import { InboxPanel } from "../../components/phase1/InboxPanel";

export default function InvestigatePage() {
  const router = useRouter();
  const [roomState, setRoomState] = useState(() => getRoomState());
  const game = useMemo(() => getGameState(), []);
  const [currentPhase, setCurrentPhase] = useState(game.currentPhase);
  const [selectedTicket, setSelectedTicket] = useState<{ preview: string; zone: string; time: string } | null>(null);
  const [showTickerModal, setShowTickerModal] = useState(false);
  type SelectedTicket = { preview: string; zone: string; time: string };

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
  const solvedClue = roomState.systemNotesRead;

  function solveClue() {
    if (roomState.systemNotesRead) return;
    pushUpdate(
      { versionPassphraseEntered: true, systemNotesRead: true, artifact4: true },
      { id: "clue-unlocked", label: "System notes unlocked" },
    );
  }

  return (
    <div className="relative h-[calc(100vh-120px)] px-6 py-5 overflow-hidden flex flex-col pb-12">
      <div className="fixed inset-0 pointer-events-none bg-[#E24B4A] opacity-[0.03] mix-blend-multiply animate-alarm-pulse" />

      <div className="relative z-10 grid h-[calc(100vh-120px)]" style={{ gridTemplateColumns: "280px 1fr 300px" }}>
        <aside className={(analystLocked ? "opacity-40 pointer-events-none " : "") + "min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent"}>
          <div className="space-y-4 pr-2">
            <DashboardStats
              zones={zoneCards}
              roomState={roomState}
              onErrorModal={() => {
                setShowTickerModal(true);
                if (!roomState.errorModalTriggered) {
                  pushUpdate({ errorModalTriggered: true }, { id: "error-modal", label: "NULL_DESTINATION" });
                }
              }}
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
            <ClueStrip solved={solvedClue} onSolved={solveClue} />
          </div>
        </aside>

        <main className={(investigatorLocked ? "opacity-40 pointer-events-none " : "") + "min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent"}>
          <div className="h-full min-h-0 px-4">
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

            <div className="mt-4 flex-1 min-h-0">
              <InboxPanel
                items={inboxItems}
                roomState={roomState}
                onTooltipRead={(count: number) =>
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
                onSelectionChange={(item: SelectedTicket) => setSelectedTicket({ preview: item.preview, zone: item.zone, time: item.time })}
              />
            </div>

            {selectedTicket && (
              <div className="mt-4 rounded-lg border border-[#1E2623] bg-[#0C0F0E] p-4">
                <div className="text-xs text-[#5E7269]">Ticket Detail</div>
                <div className="mt-1 text-sm text-[#E8F0ED]">{selectedTicket.preview}</div>
                <div className="mt-3 text-xs text-[#5E7269]">Zone {selectedTicket.zone} • {selectedTicket.time}</div>
              </div>
            )}
          </div>
        </main>

        <aside className={(communicatorLocked ? "opacity-40 pointer-events-none " : "") + "min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent"}>
          <div className="h-full min-h-0 pr-2">
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
          </div>
        </aside>
        <DiscoveriesBar discoveries={roomState.discoveries} allArtifacts={allArtifacts} />
      </div>

      <PanelModals
        showTicker={showTickerModal}
        showCsv={false}
        tickerClose={() => setShowTickerModal(false)}
        csvClose={() => undefined}
      />
      <TeamChat />
    </div>
  );
}
