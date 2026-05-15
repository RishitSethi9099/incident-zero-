"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import ZoneA from "./zones/ZoneA";

type ZoneKey = "A" | "B" | "C" | "D" | "E" | "F";

const ZONES: { key: ZoneKey; title: string; short: string }[] = [
  { key: "A", title: "Zone A — Cipher", short: "Unscramble a message" },
  { key: "B", title: "Zone B — Pattern", short: "Re-categorize requests" },
  { key: "C", title: "Zone C — Fill", short: "Fill blanks in staff note" },
  { key: "D", title: "Zone D — Timeline", short: "Order events chronologically" },
  { key: "E", title: "Zone E — Threshold", short: "Select low-confidence requests" },
  { key: "F", title: "Zone F — Freebie", short: "Silent discard log" },
];

export default function ZoneGrid() {
  const [activeModal, setActiveModal] = useState<ZoneKey | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Record<ZoneKey, boolean>>({
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
  });

  function open(key: ZoneKey) {
    setActiveModal(key);
  }

  function close() {
    setActiveModal(null);
  }

  function markSolved(key: ZoneKey) {
    setSolvedPuzzles((s) => ({ ...s, [key]: true }));
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ZONES.map((z) => (
          <button
            key={z.key}
            onClick={() => open(z.key)}
            className="group relative flex flex-col items-start justify-between gap-3 rounded-lg border border-[#1E2623] bg-slate-900 p-5 text-left hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="text-sm font-semibold tracking-wider text-white">{z.title}</div>
                <div className="mt-1 text-xs text-zinc-400">{z.short}</div>
              </div>
              <div className="text-xs font-mono text-zinc-400">{z.key}</div>
            </div>

            <div className="mt-4 w-full">
              <div className="text-xs text-zinc-500">Status</div>
              <div className="mt-1 text-sm">
                {solvedPuzzles[z.key] ? (
                  <span className="text-amber-300 font-semibold">Unlocked</span>
                ) : (
                  <span className="text-zinc-400">Locked</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Modal open={activeModal !== null} title={activeModal ? `Zone ${activeModal}` : undefined} onClose={close}>
        {activeModal === "A" && (
          <ZoneA
            solved={!!activeModal && solvedPuzzles.A}
            onSolved={() => markSolved("A")}
          />
        )}

        {activeModal === "B" && <div>Placeholder for Zone B puzzle (Pattern)</div>}
        {activeModal === "C" && <div>Placeholder for Zone C puzzle (Fill-in-blank)</div>}
        {activeModal === "D" && <div>Placeholder for Zone D puzzle (Timeline)</div>}
        {activeModal === "E" && <div>Placeholder for Zone E puzzle (Threshold)</div>}
        {activeModal === "F" && <div>Silent discard log — no puzzle here.</div>}
      </Modal>
    </div>
  );
}
