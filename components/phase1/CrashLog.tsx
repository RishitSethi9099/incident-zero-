"use client";

import { useEffect, useMemo, useState } from "react";

import type { RoomState } from "@/lib/roomState";

type CrashLogEntry = {
  time: string;
  text: string;
  type: "info" | "warn" | "error";
  corrupted: boolean;
  decoded?: string;
  redacted?: boolean;
  actual?: string;
};

type Props = {
  entries: CrashLogEntry[];
  roomState: RoomState;
  onDecoded: () => void;
  onRedactedFound: () => void;
  decodeEnabled: boolean;
};

function colorForType(type: CrashLogEntry["type"]) {
  if (type === "error") return "text-[#E24B4A]";
  if (type === "warn") return "text-[#EF9F27]";
  return "text-[#5E7269]";
}

function isHexLine(text: string) {
  return /^[0-9a-f]+$/i.test(text);
}

export function CrashLog({
  entries,
  roomState,
  onDecoded,
  onRedactedFound,
  decodeEnabled,
}: Props) {
  const [revealed, setRevealed] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!roomState.crashLogDecoded) return;
    const next: Record<number, string> = {};
    entries.forEach((e, idx) => {
      if (e.decoded) next[idx] = e.decoded;
    });
    setRevealed(next);
  }, [entries, roomState.crashLogDecoded]);

  const decodeTargets = useMemo(
    () => entries.map((e, idx) => ({ e, idx })).filter((x) => x.e.decoded),
    [entries],
  );

  function startDecode() {
    if (!decodeEnabled || roomState.crashLogDecoded) return;

    const next: Record<number, string> = {};
    decodeTargets.forEach(({ idx }) => {
      next[idx] = "";
    });
    setRevealed(next);

    let active = true;
    const timers: number[] = [];

    decodeTargets.forEach(({ e, idx }) => {
      const text = e.decoded ?? "";
      let i = 0;
      const timer = window.setInterval(() => {
        if (!active) return;
        i += 1;
        setRevealed((prev) => ({ ...prev, [idx]: text.slice(0, i) }));
        if (i >= text.length) window.clearInterval(timer);
      }, 30);
      timers.push(timer);
    });

    window.setTimeout(() => {
      active = false;
      timers.forEach((t) => window.clearInterval(t));
      onDecoded();
    }, 30 * 80);
  }

  return (
    <div className="rounded-md border border-[#1E2623] bg-[#0C0F0E] overflow-hidden">
      <div className="divide-y divide-[#1E2623]">
        {entries.map((e, idx) => {
          const isCorrupted = e.corrupted && e.decoded;
          const decoded = revealed[idx];
          const isRouteFail = e.text.includes("ROUTE_FAIL_NULL");

          return (
            <div
              key={`${e.time}-${idx}`}
              className="px-3 py-2 font-mono text-sm flex items-start gap-3"
              onClick={(ev) => {
                if (!e.redacted || !e.actual) return;
                if (ev.detail !== 3) return;
                void navigator.clipboard.writeText(e.actual);
                onRedactedFound();
              }}
            >
              <div className="w-[92px] shrink-0 text-[#5E7269] tabular-nums">
                {e.time}
              </div>
              <div className={`min-w-0 ${colorForType(e.type)}`}>
                {isCorrupted ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[#EF9F27]">⚠</span>
                    <span className="text-[#EF9F27]">
                      {decoded && decoded.length > 0 ? decoded : e.text}
                    </span>
                    <button
                      type="button"
                      onClick={startDecode}
                      disabled={!decodeEnabled || roomState.crashLogDecoded}
                      className="rounded-md border border-[#1E2623] bg-[#131817] px-2 py-0.5 text-[11px] text-[#E8F0ED] disabled:opacity-40"
                    >
                      decode
                    </button>
                  </div>
                ) : isHexLine(e.text) ? (
                  <div className="flex items-center gap-2 text-[#EF9F27]">
                    <span>⚠</span>
                    <span className="break-all">{e.text}</span>
                    <button
                      type="button"
                      onClick={startDecode}
                      disabled={!decodeEnabled || roomState.crashLogDecoded}
                      className="rounded-md border border-[#1E2623] bg-[#131817] px-2 py-0.5 text-[11px] text-[#E8F0ED] disabled:opacity-40"
                    >
                      decode
                    </button>
                  </div>
                ) : isRouteFail ? (
                  <span className="text-[#E24B4A]">{e.text}</span>
                ) : (
                  <span>{e.text}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
