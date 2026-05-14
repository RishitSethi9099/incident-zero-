"use client";

type Discovery = {
  id: string;
  label: string;
  member: string;
};

type Props = {
  discoveries: Discovery[];
  allArtifacts: boolean;
};

export function DiscoveriesBar({ discoveries, allArtifacts }: Props) {
  const slots = Array.from({ length: 4 }).map((_, idx) => discoveries[idx]);

  return (
    <div
      className={
        "fixed bottom-0 left-0 right-0 z-50 h-12 border-t bg-[#0C0F0E] px-4 " +
        (allArtifacts ? "border-[#1D9E75]" : "border-[#1E2623]")
      }
    >
      <div className="flex h-full items-center gap-3">
        <div className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-[#5E7269]">
          Discoveries
        </div>
        <div className="grid flex-1 grid-cols-4 gap-2 min-w-0">
          {slots.map((d, idx) => (
          <div
            key={`slot-${idx}`}
            className={
              "min-w-0 rounded-md border px-2 py-1 text-[11px] leading-4 " +
              (d
                ? "border-[#1D9E75]/40 bg-[#1D9E75]/10 text-[#E8F0ED]"
                : "border-[#1E2623] bg-[#131817] text-[#5E7269]")
            }
          >
            {d ? (
              <div className="flex min-w-0 items-center gap-2 truncate">
                <div className="shrink-0 font-semibold text-[#1D9E75]">{d.member}</div>
                <div className="min-w-0 truncate">— {d.label}</div>
              </div>
            ) : (
              <div className="truncate">Empty slot</div>
            )}
          </div>
          ))}
        </div>
        {allArtifacts && (
          <div className="shrink-0 text-[11px] font-semibold text-[#1D9E75] animate-pulse">
            All artifacts collected
          </div>
        )}
      </div>
    </div>
  );
}
