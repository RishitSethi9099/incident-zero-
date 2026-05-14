"use client";

import { useEffect, useMemo, useState } from "react";

import type { RoomState } from "@/lib/roomState";

type Tooltip = {
  label: string;
  confidence: number;
  language: string;
  status: string;
};

type InboxItem = {
  id: string;
  preview: string;
  time: string;
  zone: string;
  unread: boolean;
  tooltip: Tooltip;
};

type Props = {
  items: InboxItem[];
  roomState: RoomState;
  onTooltipRead: (nextCount: number) => void;
  onPassphraseEntered: () => void;
  onSystemNotesRead: () => void;
  onSelectionChange?: (item: InboxItem) => void;
};

export function InboxPanel({
  items,
  roomState,
  onTooltipRead,
  onPassphraseEntered,
  onSystemNotesRead,
  onSelectionChange,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [seenTooltips, setSeenTooltips] = useState<string[]>([]);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [shakePassphrase, setShakePassphrase] = useState(false);

  const readCount = roomState.inboxTooltipsRead;

  useEffect(() => {
    if (roomState.systemNotesRead) setShowNotes(true);
  }, [roomState.systemNotesRead]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  function handleTooltipRead(id: string) {
    if (readCount >= 3) return;
    if (seenTooltips.includes(id)) return;
    const nextSeen = [...seenTooltips, id];
    setSeenTooltips(nextSeen);
    const nextCount = Math.min(3, readCount + 1);
    if (nextCount !== readCount) onTooltipRead(nextCount);
  }

  function submitPassphrase() {
    if (passphrase.trim() !== "ROUTEFAILNULL") {
      setShakePassphrase(true);
      window.setTimeout(() => setShakePassphrase(false), 1000);
      return;
    }
    if (!roomState.versionPassphraseEntered) onPassphraseEntered();
    if (!roomState.systemNotesRead) onSystemNotesRead();
    setShowNotes(true);
  }

  return (
    <div className="relative h-full rounded-lg border border-[#1E2623] bg-[#131817] overflow-hidden">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-[#1E2623] px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-[#E8F0ED]">Inbox</div>
            <div className="mt-1 text-xs text-[#5E7269]">Requests (read-only)</div>
          </div>
          <button
            type="button"
            onClick={() => setShowPassphrase((v) => !v)}
            className="cursor-pointer text-[11px] text-[#5E7269] hover:text-[#E8F0ED]"
          >
            v2.1.7
          </button>
        </div>

        {showPassphrase && (
          <div className="border-b border-[#1E2623] px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Passphrase"
                className={
                  "flex-1 rounded-md border bg-[#0C0F0E] px-3 py-2 text-xs text-[#E8F0ED] font-mono outline-none transition " +
                  (shakePassphrase ? "border-[#E24B4A] animate-pulse" : "border-[#1E2623]")
                }
              />
              <button
                type="button"
                onClick={submitPassphrase}
                className="rounded-md bg-[#1D9E75] px-3 py-2 text-xs font-semibold text-[#0C0F0E]"
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent">
          <ul className="divide-y divide-[#1E2623]">
            {items.map((item) => (
              <li key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    onSelectionChange?.(item);
                  }}
                  onMouseEnter={() => {
                    setHoveredId(item.id);
                    handleTooltipRead(item.id);
                  }}
                  onMouseLeave={() => setHoveredId((id) => (id === item.id ? null : id))}
                  className={
                    "w-full text-left px-4 py-3 hover:bg-[#0C0F0E]/50 " +
                    (selectedId === item.id ? "bg-[#0C0F0E]/70" : "")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-mono text-[#5E7269]">{item.id}</div>
                        {item.unread && <div className="h-2 w-2 rounded-full bg-[#1D9E75]" />}
                      </div>
                      <div className="mt-1 truncate text-sm text-[#E8F0ED]">{item.preview}</div>
                    </div>
                    <div className="whitespace-nowrap text-xs text-[#5E7269]">{item.time}</div>
                  </div>
                </button>
                {hoveredId === item.id && (
                  <div className="absolute left-[60%] top-2 z-10 w-[260px] rounded-md border border-[#1E2623] bg-[#0C0F0E] p-2 text-[11px] font-mono text-[#E8F0ED] shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                    <div>label: {item.tooltip.label}</div>
                    <div>confidence: {item.tooltip.confidence.toFixed(2)}</div>
                    <div>language: {item.tooltip.language}</div>
                    <div className="text-[#EF9F27]">{item.tooltip.status}</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#1E2623] p-4">
          {selected ? (
            <div className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-4">
              <div className="text-xs text-[#5E7269]">Ticket Detail</div>
              <div className="mt-1 text-sm text-[#E8F0ED]">{selected.preview}</div>
              <div className="mt-3 text-xs text-[#5E7269]">
                Zone {selected.zone} • {selected.time}
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[#1E2623] bg-[#0C0F0E]/40 p-4 text-xs text-[#5E7269]">
              Click a ticket to inspect details.
            </div>
          )}
        </div>
      </div>

      <div
        className={
          "absolute top-0 right-0 h-full w-[360px] border-l border-[#1E2623] bg-[#131817] p-5 transition-transform duration-500 " +
          (showNotes ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="text-sm font-semibold text-[#E8F0ED]">System Notes</div>
        <div className="mt-2 text-xs text-[#5E7269]">Confidential routing rules</div>
        <div className="mt-4 rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3 text-xs font-mono text-[#E8F0ED]">
          <div>min_confidence = 0.65</div>
          <div>routing_matrix.csv must include team names</div>
          <div>routing_matrix.csv must include all zone webhooks</div>
        </div>
        <button
          type="button"
          onClick={() => setShowNotes(false)}
          className="mt-4 rounded-md border border-[#1E2623] px-3 py-1.5 text-sm text-[#E8F0ED]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
