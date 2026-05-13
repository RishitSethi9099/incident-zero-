"use client";

import { useMemo, useState } from "react";

export type InboxItem = {
  id: string;
  preview: string;
  time: string;
  unread: boolean;
};

export function Inbox({ items }: { items: InboxItem[] }) {
  const firstId = useMemo(() => items[0]?.id ?? null, [items]);
  const [selectedId, setSelectedId] = useState<string | null>(firstId);

  return (
    <div className="flex-1 min-h-0 rounded-lg border border-white/10 bg-black/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-sm font-semibold text-zinc-200">Inbox</div>
        <div className="mt-1 text-xs text-zinc-400">Requests (read-only)</div>
      </div>

      <div className="h-full overflow-y-auto">
        <ul className="divide-y divide-white/10">
          {items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={
                    "w-full text-left px-4 py-3 hover:bg-white/5 " +
                    (selected ? "bg-white/5" : "")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-mono text-zinc-400">
                          {item.id}
                        </div>
                        {item.unread && (
                          <div className="h-2 w-2 rounded-full bg-[#1D9E75]" />
                        )}
                      </div>
                      <div className="mt-1 text-sm text-zinc-200 truncate">
                        {item.preview}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 whitespace-nowrap">
                      {item.time}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
