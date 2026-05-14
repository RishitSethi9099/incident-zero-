"use client";

import { useState } from "react";

type Props = {
  onSolved: () => void;
  solved: boolean;
};

const clues = [
  "Decode crash log line 02:38:44",
  "Hover #RN-00440 for a bad label",
  "Open Priya's CSV attachment",
];

export function ClueStrip({ onSolved, solved }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function submit() {
    if (code.trim().toUpperCase() !== "ROUTEFAILNULL") {
      setError(true);
      return;
    }
    setError(false);
    onSolved();
  }

  return (
    <div className="rounded-lg border border-[#1E2623] bg-[#131817] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#E8F0ED]">Clues</div>
          <div className="mt-1 text-xs text-[#5E7269]">Short leads first. No long notes.</div>
        </div>
        <div className={"text-xs font-semibold " + (solved ? "text-[#1D9E75]" : "text-[#5E7269]") }>
          {solved ? "System Notes unlocked" : "Unlock system notes"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#E8F0ED]">
        {clues.map((clue) => (
          <div key={clue} className="rounded-md border border-[#1E2623] bg-[#0C0F0E] px-2 py-1.5 truncate">
            {clue}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Puzzle code"
          className="h-8 w-full max-w-[220px] rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 text-xs text-[#E8F0ED] font-mono"
          disabled={solved}
        />
        <button
          type="button"
          onClick={submit}
          disabled={solved}
          className="h-8 rounded-md bg-[#1D9E75] px-3 text-xs font-semibold text-[#0C0F0E] disabled:opacity-50"
        >
          Unlock
        </button>
        {error && !solved && (
          <div className="text-[11px] text-[#E24B4A]">Wrong code</div>
        )}
      </div>
    </div>
  );
}
