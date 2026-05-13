export type CrashLogEntry = {
  time: string;
  message: string;
  type: "info" | "warn" | "error";
};

function colorForType(type: CrashLogEntry["type"]) {
  if (type === "error") return "text-[#E24B4A]";
  if (type === "warn") return "text-[#EF9F27]";
  return "text-zinc-400";
}

function badge(type: CrashLogEntry["type"]) {
  const cls =
    type === "error"
      ? "border-[#E24B4A]/40 bg-[#E24B4A]/10 text-[#E24B4A]"
      : type === "warn"
        ? "border-[#EF9F27]/40 bg-[#EF9F27]/10 text-[#EF9F27]"
        : "border-white/10 bg-white/5 text-zinc-400";
  return (
    <span className={`rounded border px-2 py-0.5 text-[11px] ${cls}`}>
      {type.toUpperCase()}
    </span>
  );
}

export function CrashLog({
  entries,
}: {
  entries: readonly CrashLogEntry[];
}) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-950/30 overflow-hidden">
      <div className="divide-y divide-white/10">
        {entries.map((e, idx) => (
          <div
            key={idx}
            className="px-3 py-2 font-mono text-sm flex items-start gap-3"
          >
            <div className="w-[92px] shrink-0 text-zinc-500 tabular-nums">
              {e.time}
            </div>
            <div className="shrink-0">{badge(e.type)}</div>
            <div className={`min-w-0 ${colorForType(e.type)}` as string}>
              {e.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
