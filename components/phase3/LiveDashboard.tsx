"use client";

import { useEffect, useState } from "react";

import { getGameState } from "@/lib/gameState";
import { updateRoomState } from "@/lib/roomState";

type RecentRequest = {
  timestamp: string;
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
};

type ScorePayload = {
  accuracy: number;
  totalRequests: number;
  passed: number;
  failed: number;
  recentRequests: RecentRequest[];
};

export function LiveDashboard() {
  const [score, setScore] = useState<ScorePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpointUrl, setEndpointUrl] = useState("");

  useEffect(() => {
    const read = () => setEndpointUrl(getGameState().endpointUrl);
    read();
    window.addEventListener("storage", read);
    window.addEventListener("game-state", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("game-state", read);
    };
  }, []);

  useEffect(() => {
    if (!endpointUrl) return;

    let mounted = true;

    async function fetchScore() {
      setLoading(true);
      setError(null);
      try {
        const teamCode = getGameState().teamCode;
        const res = await fetch(`/api/score?teamCode=${teamCode}`);
        if (!res.ok) throw new Error("Failed to load score");
        const data = (await res.json()) as ScorePayload;
        if (!mounted) return;
        setScore(data);
        updateRoomState({ liveAccuracyScore: data.accuracy });
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load score");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void fetchScore();
    const id = window.setInterval(fetchScore, 300000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [endpointUrl]);

  if (!endpointUrl) {
    return (
      <div className="rounded-lg border border-[#1E2623] bg-[#131817] p-5">
        <div className="text-sm font-semibold text-[#E8F0ED]">Live Dashboard</div>
        <div className="mt-2 text-sm text-[#5E7269]">Awaiting endpoint...</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1E2623] bg-[#131817] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1E2623] flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#E8F0ED]">Live Dashboard</div>
          <div className="mt-1 text-xs text-[#5E7269]">
            Scored every 5 minutes
          </div>
        </div>
        {score && (
          <div className="text-right">
            <div className="text-xs text-[#5E7269]">Accuracy</div>
            <div className="text-lg font-semibold text-[#1D9E75]">
              {(score.accuracy * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {loading && (
          <div className="text-xs text-[#5E7269]">Updating scores...</div>
        )}
        {error && (
          <div className="rounded-md border border-[#E24B4A]/40 bg-[#E24B4A]/10 px-3 py-2 text-xs text-[#E8F0ED]">
            {error}
          </div>
        )}

        {score && (
          <div className="mt-3 overflow-hidden rounded-md border border-[#1E2623]">
            <table className="w-full text-sm">
              <thead className="bg-[#0C0F0E] text-[#5E7269]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Time</th>
                  <th className="px-3 py-2 text-left font-medium">Input</th>
                  <th className="px-3 py-2 text-left font-medium">Returned</th>
                  <th className="px-3 py-2 text-left font-medium">Expected</th>
                  <th className="px-3 py-2 text-left font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2623]">
                {score.recentRequests.map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-xs text-[#5E7269]">
                      {r.timestamp}
                    </td>
                    <td className="px-3 py-2 text-xs text-[#E8F0ED] max-w-[220px] truncate">
                      {r.input}
                    </td>
                    <td className="px-3 py-2 text-xs text-[#E8F0ED]">
                      {r.actual}
                    </td>
                    <td className="px-3 py-2 text-xs text-[#1D9E75]">
                      {r.expected}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.pass ? (
                        <span className="text-[#1D9E75]">PASS</span>
                      ) : (
                        <span className="text-[#E24B4A]">FAIL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
