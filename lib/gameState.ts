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

// Test all 12 role/section combinations for access control
// canInteract(role, section, teamSize) returns true if role can interact with section
//
// teamSize 2 (Analyst + Communicator share center):
// - teamSize 2, role Analyst, section left     → true ✓
// - teamSize 2, role Analyst, section center   → true ✓ (shared)
// - teamSize 2, role Analyst, section right    → false ✓ (locked)
// - teamSize 2, role Communicator, section left    → false ✓ (locked)
// - teamSize 2, role Communicator, section center  → true ✓ (shared)
// - teamSize 2, role Communicator, section right   → true ✓
//
// teamSize 3 (dedicated roles):
// - teamSize 3, role Analyst, section left     → true ✓
// - teamSize 3, role Analyst, section center   → false ✓ (locked)
// - teamSize 3, role Analyst, section right    → false ✓ (locked)
// - teamSize 3, role Communicator, section left    → false ✓ (locked)
// - teamSize 3, role Communicator, section center  → false ✓ (locked)
// - teamSize 3, role Communicator, section right   → true ✓
// - teamSize 3, role Investigator, section left    → false ✓ (locked)
// - teamSize 3, role Investigator, section center  → true ✓
// - teamSize 3, role Investigator, section right   → false ✓ (locked)

export function canInteract(
  role: Role,
  section: "left" | "center" | "right",
  teamSize: 2 | 3,
): boolean {
  if (!role) return false;

  if (teamSize === 2) {
    // Analyst owns left, Communicator owns right, both share center
    if (role === "Analyst") return section === "left" || section === "center";
    if (role === "Communicator") return section === "right" || section === "center";
  }

  if (teamSize === 3) {
    // Analyst owns left, Investigator owns center, Communicator owns right
    if (role === "Analyst") return section === "left";
    if (role === "Investigator") return section === "center";
    if (role === "Communicator") return section === "right";
  }

  return false;
}
