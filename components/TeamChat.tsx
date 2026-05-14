"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getGameState } from "@/lib/gameState";
import { pusherClient } from "@/lib/pusherClient";

type ChatMessage = {
  id: string;
  member: string;
  role: string;
  text: string;
  timestamp: string;
};

export function TeamChat() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const game = useMemo(() => getGameState(), []);

  function appendMessage(message: ChatMessage) {
    setMessages((prev) => {
      if (prev.some((item) => item.id === message.id)) return prev;
      return [...prev, message];
    });
  }

  useEffect(() => {
    if (!game.teamCode || !pusherClient) return;
    const channel = pusherClient.subscribe(`team-${game.teamCode}`);
    const handleMessage = (data: ChatMessage) => {
      appendMessage(data);
      if (!open) setUnreadCount((count) => count + 1);
    };

    channel.bind("team-chat", handleMessage);
    return () => {
      channel.unbind("team-chat", handleMessage);
      pusherClient.unsubscribe(`team-${game.teamCode}`);
    };
  }, [game.teamCode, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  function openChat() {
    setOpen(true);
    setUnreadCount(0);
  }

  function closeChat() {
    setOpen(false);
  }

  async function send() {
    const msg = text.trim();
    if (!msg || !game.teamCode) return;
    const id = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    const payload: ChatMessage = {
      id,
      member: game.memberName,
      role: game.role ?? "Unknown",
      text: msg,
      timestamp: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
    };
    setText("");
    appendMessage(payload);

    await fetch("/api/pusher/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamCode: game.teamCode, event: "team-chat", payload }),
    }).catch(() => undefined);
  }

  return (
    <div className="fixed bottom-14 right-4 z-50 flex flex-col items-end">
      <button
        type="button"
        onClick={() => (open ? closeChat() : openChat())}
        className="flex items-center gap-2 rounded-full border border-[#1E2623] bg-[#131817] px-4 py-2 text-sm text-[#E8F0ED] shadow-lg"
      >
        <span>Team Chat</span>
        {!open && unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E24B4A] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="mb-2 mt-2 flex h-[360px] w-[320px] flex-col overflow-hidden rounded-lg border border-[#1E2623] bg-[#131817] shadow-xl">
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#1E2623] px-3 py-2 text-sm font-semibold text-[#E8F0ED]">
            <span>Team Chat</span>
            <button
              type="button"
              onClick={closeChat}
              className="text-xs text-[#5E7269] hover:text-[#E8F0ED]"
            >
              ✕
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-[#1E2623] scrollbar-track-transparent">
            {messages.map((m, idx) => (
              <div key={m.id ?? idx} className="rounded-md border border-[#1E2623] bg-[#0C0F0E] p-2">
                <div className="flex items-center justify-between text-[11px] text-[#5E7269]">
                  <span>{m.member}</span>
                  <span>{m.role}</span>
                </div>
                <div className="mt-1 text-sm text-[#E8F0ED]">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex-shrink-0 border-t border-[#1E2623] p-2">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || e.shiftKey || e.repeat) return;
                  e.preventDefault();
                  void send();
                }}
                placeholder="Message your team"
                className="flex-1 rounded-md border border-[#1E2623] bg-[#0C0F0E] px-2 py-1 text-sm text-[#E8F0ED] outline-none focus:border-[#1D9E75]"
              />
              <button
                type="button"
                onClick={() => void send()}
                className="rounded-md bg-[#1D9E75] px-3 py-1 text-sm font-semibold text-[#0C0F0E] hover:opacity-80"
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
