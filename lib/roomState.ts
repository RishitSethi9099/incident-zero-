import { getGameState } from "@/lib/gameState";

type DiscoveryEntry = {
  id: string;
  label: string;
  member: string;
};

export type RoomState = {
  crashLogDecoded: boolean;
  redactedLineFound: boolean;
  hiddenColumnsFound: boolean;
  errorModalTriggered: boolean;
  slackScrolledToCSV: boolean;
  priyaAttachmentOpened: boolean;
  arjunDeleteFound: boolean;
  inboxTooltipsRead: number;
  zoneFFound: boolean;
  versionPassphraseEntered: boolean;
  systemNotesRead: boolean;
  artifact1: boolean;
  artifact2: boolean;
  artifact3: boolean;
  artifact4: boolean;
  corkboardSubmitted: boolean;
  corkboardCorrect: boolean;
  corkboardAttempts: number;
  endpointDeployed: boolean;
  twist1Handled: boolean;
  twist2Handled: boolean;
  twist3Handled: boolean;
  twist4Handled: boolean;
  twist5Handled: boolean;
  liveAccuracyScore: number;
  discoveries: DiscoveryEntry[];
};

const ROOM_STATE_KEY = "incident-zero:roomState";

const DEFAULT_STATE: RoomState = {
  crashLogDecoded: false,
  redactedLineFound: false,
  hiddenColumnsFound: false,
  errorModalTriggered: false,
  slackScrolledToCSV: false,
  priyaAttachmentOpened: false,
  arjunDeleteFound: false,
  inboxTooltipsRead: 0,
  zoneFFound: false,
  versionPassphraseEntered: false,
  systemNotesRead: false,
  artifact1: false,
  artifact2: false,
  artifact3: false,
  artifact4: false,
  corkboardSubmitted: false,
  corkboardCorrect: false,
  corkboardAttempts: 0,
  endpointDeployed: false,
  twist1Handled: false,
  twist2Handled: false,
  twist3Handled: false,
  twist4Handled: false,
  twist5Handled: false,
  liveAccuracyScore: 0,
  discoveries: [],
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getRoomState(): RoomState {
  if (!isBrowser()) return DEFAULT_STATE;
  const raw = window.localStorage.getItem(ROOM_STATE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<RoomState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function updateRoomState(updates: Partial<RoomState>): RoomState {
  if (!isBrowser()) return { ...DEFAULT_STATE, ...updates };
  const current = getRoomState();
  const merged = mergeRoomState(current, updates);
  window.localStorage.setItem(ROOM_STATE_KEY, JSON.stringify(merged));
  return merged;
}

export function broadcastUpdate(update: Partial<RoomState>): void {
  const { teamCode } = getGameState();
  if (!teamCode) return;

  fetch("/api/pusher/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamCode, update }),
  }).catch(() => {
    // Best-effort broadcast to teammates.
  });
}

export function mergeRoomState(
  current: RoomState,
  updates: Partial<RoomState>,
): RoomState {
  const merged = { ...current, ...updates };

  if (updates.discoveries) {
    const byId = new Map<string, DiscoveryEntry>();
    for (const d of current.discoveries) byId.set(d.id, d);
    for (const d of updates.discoveries) byId.set(d.id, d);
    merged.discoveries = Array.from(byId.values());
  }

  return merged;
}

export function addDiscovery(
  state: RoomState,
  entry: DiscoveryEntry,
): { next: RoomState; added: boolean } {
  const exists = state.discoveries.some((d) => d.id === entry.id);
  if (exists) return { next: state, added: false };
  const next = {
    ...state,
    discoveries: [...state.discoveries, entry],
  };
  return { next, added: true };
}
