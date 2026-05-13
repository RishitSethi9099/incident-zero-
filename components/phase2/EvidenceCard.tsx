"use client";

import type { DraggableProvided } from "react-beautiful-dnd";

type Props = {
  text: string;
  provided: DraggableProvided;
  isDragging: boolean;
};

export function EvidenceCard({ text, provided, isDragging }: Props) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={
        "rounded-md border px-3 py-2 text-xs font-mono text-[#E8F0ED] " +
        (isDragging
          ? "border-[#1D9E75] bg-[#0C0F0E]"
          : "border-[#1E2623] bg-[#131817]")
      }
    >
      {text}
    </div>
  );
}
