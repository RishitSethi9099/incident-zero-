"use client";

import { useEffect, useState } from "react";

export function Ticker() {
  const [count, setCount] = useState(847);

  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => c + 1), 12000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-4">
      <div className="text-3xl font-semibold tabular-nums text-[#1D9E75]">
        {count}
      </div>
      <div className="mt-1 text-sm text-zinc-200">Pending Requests</div>
      <div className="mt-1 text-xs text-zinc-400">
        ↑ +1 every 12 seconds
      </div>
    </div>
  );
}
