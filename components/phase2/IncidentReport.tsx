"use client";

type Props = {
  attempts: number;
  correct: boolean;
};

export function IncidentReport({ attempts, correct }: Props) {
  return (
    <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-4">
      <div className="text-sm font-semibold text-[#E8F0ED]">Incident Report</div>
      <div className="mt-2 text-xs text-[#5E7269]">
        Connect each clue to the right column before you can proceed.
      </div>
      <div className="mt-4 rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3 text-xs text-[#E8F0ED] font-mono">
        <div>Attempts: {attempts}</div>
        <div>Status: {correct ? "Correct" : "Pending"}</div>
      </div>
      <div className="mt-3 text-[11px] text-[#5E7269]">
        Hint: Decoys belong nowhere. Only place evidence that supports the story.
      </div>
    </div>
  );
}
