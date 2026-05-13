"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getGameState } from "@/lib/gameState";
import { pusherClient } from "@/lib/pusherClient";

type ChatMessage = {
  member: string;
  role: string;
  text: string;
  timestamp: string;
};

export function TeamChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const game = useMemo(() => getGameState(), []);

  useEffect(() => {
    if (!game.teamCode || !pusherClient) return;
    const channel = pusherClient.subscribe(`team-${game.teamCode}`);
    channel.bind("team-chat", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      pusherClient.unsubscribe(`team-${game.teamCode}`);
    };
  }, [game.teamCode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send() {
    const msg = text.trim();
    if (!msg || !game.teamCode) return;
    const payload: ChatMessage = {
      member: game.memberName,
      role: game.role ?? "Unknown",
      text: msg,
      timestamp: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
    };
    setText("");
    setMessages((prev) => [...prev, payload]);

    await fetch("/api/pusher/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamCode: game.teamCode, event: "team-chat", payload }),
    }).catch(() => undefined);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-[#1E2623] bg-[#131817] px-4 py-2 text-sm text-[#E8F0ED]"
      >
        {open ? "Close Team Chat" : "Team Chat"}
      </button>

      {open && (
        <div className="mt-2 w-[320px] rounded-lg border border-[#1E2623] bg-[#131817] overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-[#1E2623] text-sm font-semibold text-[#E8F0ED]">
            Team Chat
          </div>
          <div ref={scrollRef} className="max-h-[240px] overflow-y-auto p-3 space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-2">
                <div className="flex items-center justify-between text-[11px] text-[#5E7269]">
                  <span>{m.member}</span>
                  <span>{m.role}</span>
                </div>
                <div className="mt-1 text-sm text-[#E8F0ED]">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1E2623] p-2">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void send();
                }}
                placeholder="Message your team"
                className="flex-1 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-2 py-1 text-sm text-[#E8F0ED]"
              />
              <button
                type="button"
                onClick={() => void send()}
                className="rounded-md bg-[#1D9E75] px-3 py-1 text-sm font-semibold text-[#0C0F0E]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
