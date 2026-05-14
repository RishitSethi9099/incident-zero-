export type Member = {
  name: string;
  role: "Analyst" | "Communicator" | "Investigator" | null;
};

const roleOrder: Array<Member["role"]> = ["Analyst", "Communicator", "Investigator"];
const teamMembers = new Map<string, Member[]>();
const teamRoomStates = new Map<string, any>();

export function getRoleOrder() {
  return roleOrder;
}

export function getRosterForTeam(teamCode: string): Member[] {
  return teamMembers.get(teamCode) ?? [];
}

export function setRosterForTeam(teamCode: string, members: Member[]) {
  teamMembers.set(teamCode, members);
}

export function getRoomStateForTeam(teamCode: string) {
  return teamRoomStates.get(teamCode) ?? null;
}

export function setRoomStateForTeam(teamCode: string, state: any) {
  teamRoomStates.set(teamCode, state);
}

export function mergeRoomStateForTeam(teamCode: string, update: any) {
  const current = teamRoomStates.get(teamCode) ?? {};
  const merged = { ...current, ...update };
  // merge discoveries arrays specially
  if (update?.discoveries) {
    const byId = new Map();
    for (const d of current.discoveries ?? []) byId.set(d.id, d);
    for (const d of update.discoveries ?? []) byId.set(d.id, d);
    merged.discoveries = Array.from(byId.values());
  }
  teamRoomStates.set(teamCode, merged);
  return merged;
}
