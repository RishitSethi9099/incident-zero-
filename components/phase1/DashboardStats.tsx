"use client";

import { useEffect, useState } from "react";

import type { RoomState } from "@/lib/roomState";
import { ZoneCards } from "@/components/phase1/ZoneCards";

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

  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => c + 1), 12000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-semibold tabular-nums text-[#1D9E75]">
              {count}
            </div>
            <div className="mt-1 text-sm text-[#E8F0ED]">Pending Requests</div>
            <div className="mt-1 text-xs text-[#5E7269]">
              ↑ +1 every 12 seconds
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

      <div className="rounded-lg border border-[#1E2623] bg-[#0C0F0E] p-4">
        <div className="text-sm font-semibold text-[#E8F0ED]">Zone Status</div>
        <div className="mt-3">
          <ZoneCards zones={zones} roomState={roomState} onZoneF={onZoneF} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[520px] rounded-lg border border-[#1E2623] bg-[#131817] p-5">
            <div className="text-sm font-semibold text-[#E8F0ED]">
              Route Failure Details
            </div>
            <div className="mt-2 text-sm text-[#5E7269] font-mono">
              ERROR: NULL_DESTINATION
              <br />
              routing_matrix.csv last loaded: NEVER
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
