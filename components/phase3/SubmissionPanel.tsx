"use client";

import { useEffect, useState } from "react";

import { getGameState, setGameState } from "@/lib/gameState";

const SUBMISSIONS_KEY = "incident-zero:submissions";

type Submission = {
  timestamp: string;
  endpointUrl: string;
  submissionUrl: string;
};

function loadSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SUBMISSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Submission[];
  } catch {
    return [];
  }
}

function saveSubmissions(next: Submission[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(next));
}

function isLocked() {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.getHours() >= 9;
}

export function SubmissionPanel() {
  const [endpointUrl, setEndpointUrl] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const state = getGameState();
    setEndpointUrl(state.endpointUrl);
    setSubmissionUrl(state.submissionUrl);
    setSubmissions(loadSubmissions());
    setLocked(isLocked());
  }, []);

  function submit() {
    if (locked) return;
    if (!endpointUrl.trim() || !submissionUrl.trim()) return;

    setGameState({ endpointUrl: endpointUrl.trim(), submissionUrl: submissionUrl.trim() });
    window.dispatchEvent(new Event("game-state"));

    const entry = {
      timestamp: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      endpointUrl: endpointUrl.trim(),
      submissionUrl: submissionUrl.trim(),
    };
    const next = [entry, ...submissions];
    setSubmissions(next);
    saveSubmissions(next);
  }

  return (
    <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#E8F0ED]">Submission Panel</div>
          <div className="mt-1 text-xs text-[#5E7269]">
            Multiple submissions allowed until 9:00 IST.
          </div>
        </div>
        {locked && (
          <div className="rounded-full border border-[#E24B4A]/40 bg-[#E24B4A]/10 px-3 py-1 text-xs text-[#E24B4A]">
            Locked
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <input
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          placeholder="Endpoint URL"
          className="w-full rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-sm text-[#E8F0ED] font-mono"
        />
        <input
          value={submissionUrl}
          onChange={(e) => setSubmissionUrl(e.target.value)}
          placeholder="Submission URL (repo or doc)"
          className="w-full rounded-md border border-[#1E2623] bg-[#0C0F0E] px-3 py-2 text-sm text-[#E8F0ED] font-mono"
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={submit}
          disabled={locked}
          className="rounded-md bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-[#0C0F0E] disabled:opacity-50"
        >
          Submit update
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs text-[#5E7269]">Submission history</div>
        <div className="mt-2 space-y-2">
          {submissions.map((s, idx) => (
            <div key={idx} className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-2 text-xs">
              <div className="text-[#E8F0ED]">{s.timestamp} IST</div>
              <div className="text-[#5E7269] font-mono">{s.endpointUrl}</div>
              <div className="text-[#5E7269] font-mono">{s.submissionUrl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
