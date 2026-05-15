"use client";

import React, { useMemo, useState } from "react";

type ZoneAProps = {
  solved: boolean;
  onSolved: () => void;
};

const TARGET = "Food Supply team hasn't received anything all night";

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ZoneA({ solved, onSolved }: ZoneAProps) {
  const tokens = useMemo(() => TARGET.split(" "), []);
  const [shuffled] = useState(() => shuffle(tokens));
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function pick(token: string) {
    setPicked((p) => [...p, token]);
  }

  function removeLast() {
    setPicked((p) => p.slice(0, -1));
  }

  function reset() {
    setPicked([]);
    setMessage(null);
  }

  function check() {
    const candidate = picked.join(" ");
    const normalize = (s: string) => s.replace(/[\s'’]+/g, " ").trim().toLowerCase();
    if (normalize(candidate) === normalize(TARGET)) {
      setMessage("Correct — clue unlocked.");
      onSolved();
    } else {
      setMessage("Not quite — try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-300">
        A field worker left a short report — the message was scrambled. Rebuild the
        original sentence by selecting tokens in order.
      </div>

      <div className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-4">
        <div className="mb-3 text-xs text-zinc-400">Scrambled tokens</div>

        <div className="flex flex-wrap gap-2">
          {shuffled.map((t, idx) => (
            <button
              key={idx}
              onClick={() => pick(t)}
              disabled={picked.length >= tokens.length}
              className="rounded-md border border-[#263238] bg-slate-800 px-3 py-1 text-sm text-zinc-200 hover:opacity-90 disabled:opacity-40"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs text-zinc-400">Your answer</div>
          <div className="min-h-[48px] flex items-center gap-2 rounded-md border border-[#1E2623] bg-[#07100d] p-3 text-sm text-zinc-200">
            {picked.length === 0 ? (
              <span className="text-zinc-500">(pick tokens to build the sentence)</span>
            ) : (
              <span className="break-words">{picked.join(" ")}</span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={check}
              disabled={picked.length !== tokens.length}
              className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-black disabled:opacity-50"
            >
              Check
            </button>
            <button onClick={removeLast} className="rounded-md bg-zinc-700 px-3 py-1 text-sm text-zinc-200">
              Remove last
            </button>
            <button onClick={reset} className="rounded-md bg-zinc-700 px-3 py-1 text-sm text-zinc-200">
              Reset
            </button>
          </div>

          {message && (
            <div className="mt-3 rounded-md border border-[#1E2623] bg-[#062015] px-3 py-2 text-sm text-zinc-200">
              {message}
              {message.includes("Correct") && (
                <div className="mt-2 text-xs text-amber-300">Clue: "Food Supply team hasn't received anything all night"</div>
              )}
            </div>
          )}
        </div>
      </div>

      {solved && (
        <div className="rounded-md border border-[#1E2623] bg-[#05120f] p-3 text-sm text-amber-200">
          Puzzle solved — clue unlocked: "Food Supply team hasn't received anything all night"
        </div>
      )}
    </div>
  );
}
