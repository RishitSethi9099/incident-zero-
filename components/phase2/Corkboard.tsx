"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { EvidenceCard } from "@/components/phase2/EvidenceCard";

type Evidence = {
  id: string;
  text: string;
  category: "rootcause" | "nullrouting" | "fix" | "decoy";
};

type ZoneKey = "stack" | "rootcause" | "nullrouting" | "fix";

const ZONES: Array<{ key: ZoneKey; label: string; hint: string }> = [
  { key: "rootcause", label: "Root Cause", hint: "Who/what caused it" },
  { key: "nullrouting", label: "Why NULL", hint: "Why did routing fail" },
  { key: "fix", label: "What to Fix", hint: "Deployment fixes" },
];

type Props = {
  cards: Evidence[];
  onSubmit: (result: { correct: boolean; wrongZones: ZoneKey[] }) => void;
  disabled?: boolean;
};

function reorder(list: string[], start: number, end: number) {
  const next = [...list];
  const [removed] = next.splice(start, 1);
  next.splice(end, 0, removed);
  return next;
}

export function Corkboard({ cards, onSubmit, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const [columns, setColumns] = useState<Record<ZoneKey, string[]>>(() => ({
    stack: cards.map((c) => c.id),
    rootcause: [],
    nullrouting: [],
    fix: [],
  }));
  const [wrongZones, setWrongZones] = useState<ZoneKey[]>([]);

  const cardMap = useMemo(() => {
    const map = new Map<string, Evidence>();
    cards.forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

  useEffect(() => {
    drawConnections();
    const onResize = () => drawConnections();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [columns]);

  function drawConnections() {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;
    const rect = board.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(29,158,117,0.4)";
    ctx.lineWidth = 2;

    ZONES.forEach((zone) => {
      const ids = columns[zone.key];
      if (ids.length < 2) return;
      const points = ids
        .map((id) => board.querySelector(`[data-card-id='${id}']`))
        .filter(Boolean)
        .map((el) => {
          const r = (el as HTMLElement).getBoundingClientRect();
          return {
            x: r.left - rect.left + r.width / 2,
            y: r.top - rect.top + r.height / 2,
          };
        });
      for (let i = 0; i < points.length - 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.stroke();
      }
    });
  }

  function onDragEnd(result: any) {
    if (!result.destination || disabled) return;
    const { source, destination } = result;

    const srcKey = source.droppableId as ZoneKey;
    const dstKey = destination.droppableId as ZoneKey;

    if (srcKey === dstKey) {
      setColumns((prev) => ({
        ...prev,
        [srcKey]: reorder(prev[srcKey], source.index, destination.index),
      }));
      return;
    }

    setColumns((prev) => {
      const next = { ...prev };
      const srcItems = [...next[srcKey]];
      const dstItems = [...next[dstKey]];
      const [moved] = srcItems.splice(source.index, 1);
      dstItems.splice(destination.index, 0, moved);
      next[srcKey] = srcItems;
      next[dstKey] = dstItems;
      return next;
    });
  }

  function validate() {
    const wrong: ZoneKey[] = [];
    const placement = new Map<string, ZoneKey>();
    (Object.keys(columns) as ZoneKey[]).forEach((key) => {
      columns[key].forEach((id) => placement.set(id, key));
    });

    for (const zone of ZONES) {
      const ids = columns[zone.key];
      const mismatches = ids.filter((id) => cardMap.get(id)?.category !== zone.key);
      if (mismatches.length > 0) wrong.push(zone.key);
    }

    cards.forEach((card) => {
      if (card.category === "decoy") return;
      const placed = placement.get(card.id);
      if (placed !== card.category) {
        if (!wrong.includes(card.category as ZoneKey)) {
          wrong.push(card.category as ZoneKey);
        }
      }
    });
    setWrongZones(wrong);
    onSubmit({ correct: wrong.length === 0, wrongZones: wrong });
  }

  return (
    <div ref={boardRef} className="relative h-full">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-[260px_1fr] gap-4 h-full">
          <Droppable droppableId="stack">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="rounded-lg border border-[#1E2623] bg-[#131817] p-3 space-y-3 overflow-y-auto"
              >
                <div className="text-sm font-semibold text-[#E8F0ED]">Evidence</div>
                {columns.stack.map((id, idx) => {
                  const card = cardMap.get(id);
                  if (!card) return null;
                  return (
                    <Draggable key={card.id} draggableId={card.id} index={idx}>
                      {(provided, snapshot) => (
                        <div data-card-id={card.id}>
                          <EvidenceCard
                            text={card.text}
                            provided={provided}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="grid grid-cols-3 gap-4">
            {ZONES.map((zone) => (
              <Droppable droppableId={zone.key} key={zone.key}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      "rounded-lg border p-3 space-y-3 overflow-y-auto " +
                      (wrongZones.includes(zone.key)
                        ? "border-[#EF9F27] bg-[#EF9F27]/10"
                        : "border-[#1E2623] bg-[#0C0F0E]")
                    }
                  >
                    <div className="text-sm font-semibold text-[#E8F0ED]">
                      {zone.label}
                    </div>
                    <div className="text-xs text-[#5E7269]">{zone.hint}</div>
                    {columns[zone.key].map((id, idx) => {
                      const card = cardMap.get(id);
                      if (!card) return null;
                      return (
                        <Draggable key={card.id} draggableId={card.id} index={idx}>
                          {(provided, snapshot) => (
                            <div data-card-id={card.id}>
                              <EvidenceCard
                                text={card.text}
                                provided={provided}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      <div className="absolute bottom-4 right-4">
        <button
          type="button"
          onClick={validate}
          disabled={disabled}
          className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E] disabled:opacity-50"
        >
          Submit corkboard
        </button>
      </div>
    </div>
  );
}
