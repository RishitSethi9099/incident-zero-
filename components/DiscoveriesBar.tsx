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
  const slots = Array.from({ length: 6 }).map((_, idx) => discoveries[idx]);

  return (
    <div
      className={
        "sticky bottom-0 border-t px-6 py-2 backdrop-blur " +
        (allArtifacts
          ? "border-[#1D9E75] bg-[#1D9E75]/10"
          : "border-[#1E2623] bg-[#0C0F0E]/95")
      }
    >
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.3em] text-[#5E7269]">
          Discoveries
        </div>
        {allArtifacts && (
          <div className="text-xs font-semibold text-[#1D9E75] animate-pulse">
            All artifacts collected — check your phone
          </div>
        )}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {slots.map((d, idx) => (
          <div
            key={`slot-${idx}`}
            className={
              "rounded-md border px-2 py-1 text-[10px] " +
              (d
                ? "border-[#1D9E75]/40 bg-[#1D9E75]/10 text-[#E8F0ED]"
                : "border-[#1E2623] bg-[#131817] text-[#5E7269]")
            }
          >
            {d ? (
              <div>
                <div className="font-semibold text-[#1D9E75]">{d.member}</div>
                <div>{d.label}</div>
              </div>
            ) : (
              <div>Empty slot</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
