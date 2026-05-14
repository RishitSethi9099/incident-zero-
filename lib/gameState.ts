const GAME_STATE_KEY = "incident-zero:gameState";

export type Role = "Analyst" | "Communicator" | "Investigator" | null;

export type GameState = {
  teamCode: string;
  memberName: string;
  role: Role;
  teamSize: 2 | 3;
  currentPhase: 1 | 2 | 3;
  phase2Penalty: number;
  submissionUrl: string;
  endpointUrl: string;
};

const DEFAULT_STATE: GameState = {
  teamCode: "",
  memberName: "",
  role: null,
  teamSize: 2,
  currentPhase: 1,
  phase2Penalty: 0,
  submissionUrl: "",
  endpointUrl: "",
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getGameState(): GameState {
  if (!isBrowser()) return DEFAULT_STATE;
  const raw = window.localStorage.getItem(GAME_STATE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function setGameState(updates: Partial<GameState>): void {
  if (!isBrowser()) return;
  const next = { ...getGameState(), ...updates };
  window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("game-state"));
}

export function resetGame(): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(DEFAULT_STATE));
}
