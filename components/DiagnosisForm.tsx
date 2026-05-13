"use client";

import { useState } from "react";

type Opt = { id: string; text: string; correct: boolean };

export type DiagnosisOptions = {
  q1: readonly Opt[];
  q2: readonly Opt[];
};

export type DiagnosisAnswers = {
  q1: string | null;
  q2: string[];
  q3: string;
};

export function DiagnosisForm({
  options,
  onSubmit,
  disabled,
}: {
  options: DiagnosisOptions;
  onSubmit: (answers: DiagnosisAnswers) => void;
  disabled?: boolean;
}) {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string[]>([]);
  const [q3, setQ3] = useState("");

  return (
    <form
      className="rounded-lg border border-white/10 bg-black/20 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ q1, q2, q3 });
      }}
    >
      <div className="space-y-6">
        <div>
          <div className="text-sm font-semibold text-zinc-200">
            Q1) What caused the crash at 02:47?
          </div>
          <div className="mt-3 space-y-2">
            {options.q1.map((o) => (
              <label
                key={o.id}
                className="flex items-start gap-3 rounded-md border border-white/10 bg-zinc-950/30 px-3 py-2 hover:bg-white/5"
              >
                <input
                  type="radio"
                  name="q1"
                  value={o.id}
                  checked={q1 === o.id}
                  onChange={() => setQ1(o.id)}
                  className="mt-1"
                  disabled={disabled}
                />
                <span className="text-sm text-zinc-200">{o.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-zinc-200">
            Q2) Which teams should exist?
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {options.q2.map((o) => {
              const checked = q2.includes(o.id);
              return (
                <label
                  key={o.id}
                  className="flex items-start gap-3 rounded-md border border-white/10 bg-zinc-950/30 px-3 py-2 hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setQ2((prev) =>
                        checked
                          ? prev.filter((x) => x !== o.id)
                          : [...prev, o.id],
                      );
                    }}
                    className="mt-1"
                    disabled={disabled}
                  />
                  <span className="text-sm text-zinc-200">{o.text}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-zinc-200">
            Q3) In your own words, what{"'"}s the fix?
          </div>
          <textarea
            value={q3}
            onChange={(e) => setQ3(e.target.value)}
            className="mt-3 w-full min-h-[120px] rounded-md border border-white/15 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50"
            placeholder="Describe how you would implement a deterministic router..."
            disabled={disabled}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-zinc-950 hover:brightness-110 disabled:opacity-60"
          >
            Submit diagnosis
          </button>
        </div>
      </div>
    </form>
  );
}
