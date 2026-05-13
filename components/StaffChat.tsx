"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { staffChatHistory, staffReplies } from "@/data/fakeData";

type Msg = {
  sender: string;
  role: string;
  message: string;
};

function findReply(userText: string) {
  const text = userText.toLowerCase();
  const match = staffReplies.find((r) =>
    r.triggers.some((t) => text.includes(t.toLowerCase())),
  );

  if (match)
    return { sender: match.sender, role: match.role, message: match.message };

  return {
    sender: "Priya K",
    role: "staff2",
    message: "I\'m not sure about that right now, we\'re pretty overwhelmed.",
  };
}

function bubbleClass(role: string) {
  if (role === "user") return "border-[#1D9E75]/30 bg-[#1D9E75]/10";
  if (role === "system") return "border-white/10 bg-white/5";
  if (role === "staff1") return "border-[#EF9F27]/30 bg-[#EF9F27]/10";
  return "border-white/10 bg-zinc-950/40";
}

export function StaffChat() {
  const [messages, setMessages] = useState<Msg[]>(() => [...staffChatHistory]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => text.trim().length > 0 && !pending, [text, pending]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  function send() {
    const msg = text.trim();
    if (!msg) return;
    if (pending) return;

    setText("");
    setMessages((m) => [...m, { sender: "You", role: "user", message: msg }]);
    setPending(true);

    window.setTimeout(() => {
      const reply = findReply(msg);
      setMessages((m) => [...m, reply]);
      setPending(false);
    }, 900);
  }

  return (
    <div className="h-full rounded-lg border border-white/10 bg-black/20 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-sm font-semibold text-zinc-200">Staff Chat</div>
        <div className="mt-1 text-xs text-zinc-400">
          Ask about teams, routing rules, language, or the crash.
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`rounded-md border p-2 ${bubbleClass(m.role)}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-zinc-200">
                {m.sender}
              </div>
              <div className="text-[11px] text-zinc-500">{m.role}</div>
            </div>
            <div className="mt-1 text-sm text-zinc-100">{m.message}</div>
          </div>
        ))}
        {pending && (
          <div className="rounded-md border border-white/10 bg-white/5 p-2 text-sm text-zinc-300">
            Priya K is typing...
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Type a question..."
            className="flex-1 rounded-md border border-white/15 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/50"
            disabled={pending}
          />
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="rounded-md bg-[#1D9E75] px-3 py-2 text-sm font-semibold text-zinc-950 hover:brightness-110 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
