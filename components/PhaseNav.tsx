"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { getGameState } from "@/lib/gameState";

type Step = {
  label: string;
  slug: "/investigate" | "/diagnose" | "/build";
  phase: 1 | 2 | 3;
};

const steps: Step[] = [
  { label: "Investigate", slug: "/investigate", phase: 1 },
  { label: "Diagnose", slug: "/diagnose", phase: 2 },
  { label: "Build", slug: "/build", phase: 3 },
];

export function PhaseNav() {
  const pathname = usePathname();
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    const read = () => setPhase(getGameState().currentPhase);
    read();
    window.addEventListener("game-state", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("game-state", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const activeSlug = useMemo(() => {
    if (pathname.startsWith("/diagnose")) return "/diagnose";
    if (pathname.startsWith("/build")) return "/build";
    if (pathname.startsWith("/investigate")) return "/investigate";
    return "/investigate";
  }, [pathname]);

  return (
    <nav className="h-[48px] border-b border-[#1E2623] bg-[#131817] px-6 flex items-center">
      <div className="flex items-center gap-3 text-sm">
        {steps.map((s, idx) => {
          const unlocked = phase >= s.phase;
          const active = activeSlug === s.slug;

          const base = "flex items-center gap-2 rounded-md border px-3 py-1.5";
          const cls = unlocked
            ? active
              ? "border-[#1D9E75]/50 bg-[#1D9E75]/10 text-[#1D9E75]"
              : "border-[#1E2623] bg-[#0C0F0E] text-[#E8F0ED]"
            : "border-[#1E2623] bg-[#0C0F0E] text-[#5E7269]";

          return (
            <div key={s.slug} className={`${base} ${cls}`}>
              <div
                className={
                  unlocked
                    ? active
                      ? "bg-[#1D9E75] text-[#0C0F0E]"
                      : "bg-[#1E2623] text-[#E8F0ED]"
                    : "bg-[#1E2623] text-[#5E7269]"
                }
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {idx + 1}
              </div>
              <div className="font-medium">{s.label}</div>
              {!unlocked && (
                <span className="text-xs text-[#5E7269]">Locked</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
