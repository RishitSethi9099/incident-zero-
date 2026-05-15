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
  onOpenZone?: (zone: string) => void;
};

export function ZoneCards({ zones, roomState, onZoneF, onOpenZone }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {zones.map((z) => (
        <button
          type="button"
          key={z.zone}
          onClick={() => {
            if (z.zone === "F" && !roomState.zoneFFound) onZoneF();
            if (onOpenZone) onOpenZone(z.zone);
          }}
          className={
            "rounded-md border px-2 py-2 text-left " +
            (z.zone === "F"
              ? "border-[#EF9F27] bg-[#EF9F27]/10"
              : "border-[#1E2623] bg-[#131817]")
          }
        >
          <div className="text-[11px] text-[#5E7269]">Zone</div>
          <div className="text-base font-semibold text-[#E8F0ED]">{z.zone}</div>
          <div className="text-[11px] text-[#5E7269]">{z.requests} req</div>
          {z.warning && (
            <div className="mt-1 flex items-start gap-1 whitespace-normal text-[10px] text-[#EF9F27]">
              <span aria-hidden="true">⚠</span>
              <span>{z.warning}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
