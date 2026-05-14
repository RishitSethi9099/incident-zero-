"use client";

import { useEffect, useMemo, useState } from "react";

import type { RoomState } from "@/lib/roomState";

export type CrashLogEntry = {
  time: string;
  text: string;
  type: "info" | "warn" | "error";
  corrupted?: boolean;
  decoded?: string;
  redacted?: boolean;
  actual?: string;
};

type CrashLogProps = {
  entries: readonly CrashLogEntry[];
  roomState: RoomState;
  decodeEnabled: boolean;
  onDecoded: () => void;
  onRedactedFound: () => void;
};

function colorForType(type: CrashLogEntry["type"]) {
  if (type === "error") return "text-[#E24B4A]";
  if (type === "warn") return "text-[#EF9F27]";
  return "text-zinc-400";
}

function TypeBadge({ type }: { type: CrashLogEntry["type"] }) {
  const cls =
    type === "error"
      ? "border-[#E24B4A]/40 bg-[#E24B4A]/10 text-[#E24B4A]"
      : type === "warn"
        ? "border-[#EF9F27]/40 bg-[#EF9F27]/10 text-[#EF9F27]"
        : "border-white/10 bg-white/5 text-zinc-400";

  return (
    <span className={`shrink-0 rounded border px-2 py-0.5 text-[11px] ${cls}`}>
      {type.toUpperCase()}
    </span>
  );
}

export function CrashLog({
  entries,
  roomState,
  decodeEnabled,
  onDecoded,
  onRedactedFound,
}: CrashLogProps) {
  const [decodedLines, setDecodedLines] = useState<Set<number>>(new Set());
  const [revealedRedacted, setRevealedRedacted] = useState(false);

  useEffect(() => {
    if (!roomState.crashLogDecoded) return;
    const next = new Set<number>();
    entries.forEach((entry, idx) => {
      if (entry.corrupted && entry.decoded) next.add(idx);
    });
    setDecodedLines(next);
  }, [entries, roomState.crashLogDecoded]);

  const corruptedCount = useMemo(
    () => entries.filter((entry) => entry.corrupted && entry.decoded).length,
    [entries],
  );

  function handleDecode(idx: number) {
    if (!decodeEnabled || roomState.crashLogDecoded) return;

    setDecodedLines((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      if (next.size >= corruptedCount && corruptedCount > 0) {
        window.setTimeout(onDecoded, 0);
      }
      return next;
    });
  }

  function handleRedactedCopy() {
    if (revealedRedacted) return;
    setRevealedRedacted(true);
    onRedactedFound();
  }

  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-950/30">
      <div className="divide-y divide-white/10">
        {entries.map((entry, idx) => {
          const isCorrupted = Boolean(entry.corrupted && entry.decoded);
          const decoded = entry.decoded;
          const isRouteFail = entry.text.includes("ROUTE_FAIL_NULL");

          return (
            <div key={`${entry.time}-${idx}`} className="flex items-start gap-3 px-3 py-2 font-mono text-sm">
              <div className="w-[92px] shrink-0 tabular-nums text-[#5E7269]">{entry.time}</div>
              <TypeBadge type={entry.type} />
              <div className={`min-w-0 flex-1 ${colorForType(entry.type)}`}>
                {isCorrupted ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all text-[#EF9F27]">
                      {decodedLines.has(idx) ? decoded : entry.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDecode(idx)}
                      disabled={!decodeEnabled || roomState.crashLogDecoded}
                      className="cursor-pointer rounded-md border border-[#1E2623] bg-[#131817] px-2 py-0.5 text-[11px] text-[#E8F0ED] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      decode
                    </button>
                  </div>
                ) : entry.redacted ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{entry.text.split("██████████")[0]}</span>
                    {revealedRedacted ? (
                      <span className="text-[#EF9F27]">
                        {entry.actual?.split("██████████")[1] ?? "routing_v1_backup"}
                      </span>
                    ) : (
                      <span
                        className="cursor-pointer select-all rounded bg-[#5E7269] px-1 text-[#5E7269] transition-colors hover:bg-[#EF9F27] hover:text-[#EF9F27]"
                        title="Try selecting this text..."
                        onClick={handleRedactedCopy}
                      >
                        ██████████
                      </span>
                    )}
                    {!revealedRedacted && (
                      <span className="text-[10px] text-[#5E7269]">← click to reveal</span>
                    )}
                  </div>
                ) : isRouteFail ? (
                  <span className="text-[#E24B4A]">{entry.text}</span>
                ) : (
                  <span>{entry.text}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
