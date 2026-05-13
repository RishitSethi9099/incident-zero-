"use client";

import { publicTestCases } from "@/data/fakeData";

export function TestCases() {
  return (
    <div className="rounded-lg border border-[#1E2623] bg-[#131817] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1E2623]">
        <div className="text-sm font-semibold text-[#E8F0ED]">Public Test Cases</div>
        <div className="mt-1 text-xs text-[#5E7269]">
          Use these inputs before submitting your endpoint.
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-[#0C0F0E] text-[#5E7269]">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Input</th>
              <th className="px-3 py-2 text-left font-medium">Zone</th>
              <th className="px-3 py-2 text-left font-medium">Expected</th>
              <th className="px-3 py-2 text-left font-medium">Webhook</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2623]">
            {publicTestCases.map((t, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 font-mono text-[#E8F0ED]">{t.input}</td>
                <td className="px-3 py-2 text-[#5E7269]">{t.zone}</td>
                <td className="px-3 py-2 text-[#1D9E75] font-semibold">
                  {t.expected}
                </td>
                <td className="px-3 py-2 text-xs text-[#5E7269] font-mono">
                  {t.webhook}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
