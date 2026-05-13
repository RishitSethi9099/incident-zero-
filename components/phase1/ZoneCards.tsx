"use client";

import type { RoomState } from "@/lib/roomState";

type ZoneCard = {
  zone: string;
  requests: number;
  status: "normal" | "critical";
  warning?: string;
};

type Props = {
  zones: ZoneCard[];
  roomState: RoomState;
  onZoneF: () => void;
};

export function ZoneCards({ zones, roomState, onZoneF }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {zones.map((z) => (
        <button
          type="button"
          key={z.zone}
          onClick={() => {
            if (z.zone === "F" && !roomState.zoneFFound) onZoneF();
          }}
          className={
            "rounded-md border px-3 py-2 text-left " +
            (z.zone === "F"
              ? "border-[#EF9F27] bg-[#EF9F27]/10"
              : "border-[#1E2623] bg-[#131817]")
          }
        >
          <div className="text-xs text-[#5E7269]">Zone</div>
          <div className="text-lg font-semibold text-[#E8F0ED]">{z.zone}</div>
          <div className="text-xs text-[#5E7269]">{z.requests} requests</div>
          {z.warning && (
            <div className="mt-2 text-[11px] text-[#EF9F27]">{z.warning}</div>
          )}
        </button>
      ))}
    </div>
  );
}
