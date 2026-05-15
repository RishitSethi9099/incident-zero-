"use client";

import { useEffect, useState } from "react";

import type { RoomState } from "@/lib/roomState";
import { ZoneCards } from "@/components/phase1/ZoneCards";
import Modal from "@/components/Modal";
import ZoneA from "@/components/zones/ZoneA";

type ZoneCard = {
  zone: string;
  requests: number;
  status: "normal" | "critical";
  warning?: string;
};

type Props = {
  zones: ZoneCard[];
  roomState: RoomState;
  onErrorModal: () => void;
  onZoneF: () => void;
};

export function DashboardStats({ zones, roomState, onErrorModal, onZoneF }: Props) {
  const [count, setCount] = useState(847);
  const [showModal, setShowModal] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Record<string, boolean>>({
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
  });

  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => c + 1), 12000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold tabular-nums text-[#1D9E75]">
              {count}
            </div>
            <div className="mt-1 text-xs text-[#E8F0ED]">Pending ticker</div>
            <div className="mt-1 text-[11px] text-[#5E7269]">
              +1 / 12s
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowModal(true);
              if (!roomState.errorModalTriggered) onErrorModal();
            }}
            className="h-8 w-8 rounded-full border border-[#1E2623] bg-[#0C0F0E] text-xs text-[#5E7269]"
            aria-label="Show error details"
          >
            i
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[#1E2623] bg-[#0C0F0E] p-3">
        <div className="text-sm font-semibold text-[#E8F0ED]">Zones</div>
        <div className="mt-2">
          <ZoneCards zones={zones} roomState={roomState} onZoneF={onZoneF} onOpenZone={(z) => setActiveModal(z)} />
        </div>

        <Modal open={activeModal !== null} title={activeModal ? `Zone ${activeModal}` : undefined} onClose={() => setActiveModal(null)}>
          {activeModal === "A" && (
            <ZoneA
              solved={!!activeModal && solvedPuzzles.A}
              onSolved={() => setSolvedPuzzles((s) => ({ ...s, A: true }))}
            />
          )}
          {activeModal && activeModal !== "A" && <div className="text-sm text-zinc-300">Placeholder for Zone {activeModal} — puzzle coming soon.</div>}
        </Modal>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[520px] rounded-lg border border-[#1E2623] bg-[#131817] p-5">
            <div className="text-sm font-semibold text-[#E8F0ED]">QUEUE STATUS — CRITICAL</div>
            <div className="mt-3 space-y-1 text-sm font-mono text-[#5E7269]">
              <div>847 items pending assignment</div>
              <div>0 items successfully routed (last 3 hours)</div>
              <div>211 items attempted — all failed</div>
              <div className="pt-2 text-[#E24B4A]">Last failure: ROUTE_FAIL_NULL</div>
              <div>routing_matrix.csv last loaded: NEVER</div>
              <div>File not found at agent startup.</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
