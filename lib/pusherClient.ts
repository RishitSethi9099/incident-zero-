import Pusher from "pusher-js";

import { setGameState } from "@/lib/gameState";
import type { RoomState } from "@/lib/roomState";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
const isBrowser = typeof window !== "undefined";

export const hasPusherClient = Boolean(key && cluster);
export const pusherClient = isBrowser && hasPusherClient
  ? new Pusher(key as string, { cluster: cluster as string })
  : null;

export function subscribeToTeam(
  teamCode: string,
  onUpdate: (data: Partial<RoomState>) => void,
) {
  if (!pusherClient) return () => {};
  const channel = pusherClient.subscribe(`team-${teamCode}`);
  channel.bind("room-update", onUpdate);
  channel.bind("phase-transition", (data: { phase: number }) => {
    const phase = data.phase === 2 || data.phase === 3 ? data.phase : 1;
    setGameState({ currentPhase: phase });
  });
  channel.bind("member-joined", (data: { name: string; role: string | null }) => {
    // notify any listeners across the client via a window event
    try {
      window.dispatchEvent(new CustomEvent("team-member-joined", { detail: data }));
    } catch {}
  });
  channel.bind("twist-drop", (_data: { twist: number; message: string }) => {
    // UI listens to this event where needed.
  });

  return () => {
    pusherClient.unsubscribe(`team-${teamCode}`);
  };
}
