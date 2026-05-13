"use client";

import { useMemo, useState } from "react";

import type { RoomState } from "@/lib/roomState";
import { routingMatrix } from "@/data/fakeData";

type SlackMessage = {
  time: string;
  sender: string;
  text: string;
  attachment?: string;
};

type Props = {
  messages: SlackMessage[];
  roomState: RoomState;
  onScrolledToCSV: () => void;
  onAttachmentOpened: () => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function csvFromRouting() {
  const lines = ["team,webhook,zones"];
  for (const team of routingMatrix.teams) {
    lines.push(`${team.name},${team.webhook},${team.zones}`);
  }
  lines.push("");
  lines.push(`priority_order,${routingMatrix.priorityOrder.join("|")}`);
  lines.push(`confidence_threshold,${routingMatrix.confidenceThreshold}`);
  lines.push(`unclassified_webhook,${routingMatrix.unclassifiedWebhook}`);
  return lines.join("\n");
}

export function SlackChannel({
  messages,
  roomState,
  onScrolledToCSV,
  onAttachmentOpened,
}: Props) {
  const [open, setOpen] = useState(false);

  const csv = useMemo(() => csvFromRouting(), []);

  return (
    <div className="h-full min-w-0 rounded-lg border border-[#1E2623] bg-[#131817] overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#1E2623]">
        <div className="text-sm font-semibold text-[#E8F0ED]">#ops-routing</div>
        <div className="mt-1 text-xs text-[#5E7269]">Recovered Slack channel</div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3"
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop > 120 && !roomState.slackScrolledToCSV) {
            onScrolledToCSV();
          }
        }}
      >
        {messages.map((m, idx) => (
          <div key={`${m.time}-${idx}`} className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-[#1E2623] text-xs text-[#E8F0ED] flex items-center justify-center">
              {initials(m.sender)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-[#E8F0ED]">
                  {m.sender}
                </div>
                <div className="text-[11px] text-[#5E7269]">{m.time}</div>
              </div>
              <div className="mt-1 text-sm text-[#E8F0ED] break-words">{m.text}</div>
              {m.attachment && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(true);
                    if (!roomState.priyaAttachmentOpened) onAttachmentOpened();
                  }}
                  className="mt-2 inline-flex items-center gap-2 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-2 py-1 text-xs text-[#E8F0ED]"
                >
                  <span className="text-[#5E7269]">📎</span>
                  {m.attachment}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[680px] rounded-lg border border-[#1E2623] bg-[#131817] p-5">
            <div className="text-sm font-semibold text-[#E8F0ED]">
              routing_matrix_FINAL_v2.csv
            </div>
            <pre className="mt-3 max-h-[320px] overflow-y-auto rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3 text-xs text-[#E8F0ED] font-mono">
              {csv}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[#1E2623] px-3 py-1.5 text-sm text-[#E8F0ED]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
