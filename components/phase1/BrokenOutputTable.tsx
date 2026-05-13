"use client";

import { useRef, useState } from "react";

import type { RoomState } from "@/lib/roomState";

type OutputRow = {
  id: string;
  input: string;
  label: string;
  routed: string;
  confidence: number;
  endpoint: string;
};

type Props = {
  rows: OutputRow[];
  roomState: RoomState;
  onHiddenColumnsFound: () => void;
};

export function BrokenOutputTable({ rows, roomState, onHiddenColumnsFound }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  function handleScroll() {
    if (!ref.current) return;
    if (ref.current.scrollLeft > 12 && !scrolled) {
      setScrolled(true);
      if (!roomState.hiddenColumnsFound) onHiddenColumnsFound();
    }
  }

  const reveal = scrolled || roomState.hiddenColumnsFound;

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
    >
      <table className="min-w-[880px] w-full text-sm">
        <thead className="bg-[#0C0F0E] text-[#5E7269]">
          <tr>
            <th className="px-3 py-2 text-left font-medium sticky left-0 bg-[#0C0F0E]">ID</th>
            <th className="px-3 py-2 text-left font-medium sticky left-[120px] bg-[#0C0F0E]">
              Input
            </th>
            <th className="px-3 py-2 text-left font-medium sticky left-[420px] bg-[#0C0F0E]">
              Label
            </th>
            <th className="px-3 py-2 text-left font-medium">Routed</th>
            <th className="px-3 py-2 text-left font-medium">Raw Confidence</th>
            <th className="px-3 py-2 text-left font-medium">Attempted Endpoint</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E2623] font-mono">
          {rows.map((row) => (
            <tr key={row.id} className="text-[#E8F0ED]">
              <td className="px-3 py-2 whitespace-nowrap sticky left-0 bg-[#0C0F0E]">
                {row.id}
              </td>
              <td className="px-3 py-2 text-[#E8F0ED] sticky left-[120px] bg-[#0C0F0E]">
                {row.input}
              </td>
              <td className="px-3 py-2 sticky left-[420px] bg-[#0C0F0E]">
                <span className="rounded bg-[#131817] px-2 py-1 text-xs">
                  {row.label}
                </span>
              </td>
              <td className="px-3 py-2 text-[#E24B4A]">{row.routed}</td>
              <td
                className={
                  "px-3 py-2 " + (reveal ? "text-[#EF9F27]" : "text-transparent")
                }
              >
                {row.confidence.toFixed(2)}
              </td>
              <td
                className={
                  "px-3 py-2 " + (reveal ? "text-[#5E7269]" : "text-transparent")
                }
              >
                {row.endpoint}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
