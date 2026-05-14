export type Member = {
  name: string;
  role: "Analyst" | "Communicator" | "Investigator" | null;
};

export type TeamMemberRecord = Member & {
  lastSeen: number;
};

const roleOrder: Array<Member["role"]> = ["Analyst", "Communicator", "Investigator"];
const teamMembers = new Map<string, TeamMemberRecord[]>();
const teamRoomStates = new Map<string, any>();
const DISCONNECT_TTL_MS = 45_000;

export function getRoleOrder() {
  return roleOrder;
}

export function getRosterForTeam(teamCode: string): Member[] {
  const now = Date.now();
  const members = teamMembers.get(teamCode) ?? [];
  const active = members.filter((member) => now - member.lastSeen < DISCONNECT_TTL_MS);
  if (active.length !== members.length) {
    teamMembers.set(teamCode, active);
  }
  return active.map(({ name, role }) => ({ name, role }));
}

export function setRosterForTeam(teamCode: string, members: Member[]) {
  const now = Date.now();
  teamMembers.set(
    teamCode,
    members.map((member) => ({ ...member, lastSeen: now })),
  );
}

export function touchMember(teamCode: string, member: Member) {
  const now = Date.now();
  const current = teamMembers.get(teamCode) ?? [];
  const next = current.filter((entry) => entry.name !== member.name);
  next.push({ ...member, lastSeen: now });
  teamMembers.set(teamCode, next);
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
