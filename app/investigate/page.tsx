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
  const [roster, setRoster] = useState<Array<{ name: string; role: "Analyst" | "Communicator" | "Investigator" | null }>>([]);
  const [selectedTicket, setSelectedTicket] = useState<{ preview: string; zone: string; time: string } | null>(null);
  const [showTickerModal, setShowTickerModal] = useState(false);
  const [prevRosterSize, setPrevRosterSize] = useState(0);
  const [showNewMemberBanner, setShowNewMemberBanner] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<"Analyst" | "Communicator" | "Investigator" | null>(null);
  type SelectedTicket = { preview: string; zone: string; time: string };
  const teamSize = game.teamSize ?? 2;

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
    if (!game.teamCode) return;
    let mounted = true;

    const syncRoster = async () => {
      const res = await fetch(`/api/pusher/roster?teamCode=${game.teamCode}`);
      if (!res.ok) return;
      const data = (await res.json()) as { members?: Array<{ name: string; role: "Analyst" | "Communicator" | "Investigator" | null }> };
      if (!mounted) return;
      setRoster((data.members ?? []).filter((member, idx, arr) => arr.findIndex((x) => x.name === member.name) === idx));
    };

    void syncRoster();
    const id = window.setInterval(syncRoster, 3000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [game.teamCode]);

  useEffect(() => {
    if (roster.length > prevRosterSize && prevRosterSize > 0) {
      const newMember = roster.find(
        (m) => !roster.slice(0, prevRosterSize).find((old) => old.name === m.name)
      );
      if (newMember && newMember.name !== game.memberName) {
        setNewMemberRole(newMember.role);
        setShowNewMemberBanner(true);
        const timer = window.setTimeout(() => setShowNewMemberBanner(false), 5000);
        return () => window.clearTimeout(timer);
      }
    }
    setPrevRosterSize(roster.length);
  }, [roster, prevRosterSize, game.memberName]);

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

  const connectedCount = roster.length;
  const showDisconnectBanner = teamSize === 3 && connectedCount > 0 && connectedCount < teamSize;
  const analystLocked = game.role !== "Analyst";
  const investigatorLocked = teamSize === 3 ? game.role !== "Investigator" : false;
  const communicatorLocked = game.role !== "Communicator";
  const centerRoleLabel = teamSize === 2 ? "SHARED" : "INVESTIGATOR";
  const solvedClue = roomState.systemNotesRead;

  function solveClue() {
    if (roomState.systemNotesRead) return;
    pushUpdate(
      { versionPassphraseEntered: true, systemNotesRead: true, artifact4: true },
      { id: "clue-unlocked", label: "System notes unlocked" },
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#0C0F0E]">
      <div className="fixed inset-0 pointer-events-none bg-[#E24B4A] opacity-[0.03] mix-blend-multiply animate-alarm-pulse" />

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <div className="grid flex-1 min-h-0 overflow-hidden" style={{ gridTemplateColumns: "280px 1fr 300px" }}>
        {showNewMemberBanner && newMemberRole && (
          <div className="col-span-3 mb-2 rounded-md border border-[#1D9E75]/40 bg-[#1D9E75]/10 px-4 py-2 text-sm text-[#E8F0ED]">
            ⚡ New teammate joined — {newMemberRole} is now active
          </div>
        )}
        {showDisconnectBanner && (
          <div className="col-span-3 mb-2 rounded-md border border-[#E24B4A]/40 bg-[#E24B4A]/10 px-4 py-2 text-sm text-[#E8F0ED]">
            ⚠ Teammate disconnected. Their section is locked.
          </div>
        )}

        <aside className={(analystLocked ? "opacity-40 pointer-events-none " : "") + "h-full flex flex-col min-w-0 border-r border-[#1E2623] bg-[#0C0F0E] overflow-hidden"}>
          <div className="flex-shrink-0 border-b border-[#1E2623] px-4 py-3">
            <div className="rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-[#5E7269]">Analyst</div>
          </div>

          <div className="flex-shrink-0 border-b border-[#1E2623] px-4 py-4">
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
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent px-4 py-4">
            <div className="space-y-4">
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
          </div>
        </aside>

        <main className={(investigatorLocked ? "opacity-40 pointer-events-none " : "") + "h-full flex flex-col min-w-0 overflow-hidden bg-[#0C0F0E]"}>
          <div className="flex-shrink-0 border-b border-[#1E2623] px-4 py-3">
            <div className="rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-[#5E7269]">{centerRoleLabel}</div>
            <div className="mt-3 rounded-lg border border-[#1E2623] bg-[#131817] px-4 py-3">
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
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent px-4 py-4">
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
            <div className="flex-shrink-0 border-t border-[#1E2623] m-4 rounded-lg bg-[#0C0F0E] p-4">
              <div className="text-xs text-[#5E7269]">Ticket Detail</div>
              <div className="mt-1 text-sm text-[#E8F0ED]">{selectedTicket.preview}</div>
              <div className="mt-3 text-xs text-[#5E7269]">Zone {selectedTicket.zone} • {selectedTicket.time}</div>
            </div>
          )}
        </main>

        <aside className={(communicatorLocked ? "opacity-40 pointer-events-none " : "") + "h-full flex flex-col min-w-0 border-l border-[#1E2623] bg-[#0C0F0E] overflow-hidden"}>
          <div className="flex-shrink-0 border-b border-[#1E2623] px-3 py-3">
            <div className="rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-[#5E7269]">Communicator</div>
            <p className="text-[#1D9E75] font-mono text-sm mt-2">#ops-routing</p>
            <p className="text-[#5E7269] text-xs">Recovered Slack channel</p>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent px-3 py-3">
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
      </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-12 z-50 bg-[#0C0F0E] border-t border-[#1E2623] flex items-center px-4 gap-3">
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
