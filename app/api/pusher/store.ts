export type Member = {
  name: string;
  role: "Analyst" | "Communicator" | "Investigator" | null;
};

const roleOrder: Array<Member["role"]> = ["Analyst", "Communicator", "Investigator"];
const teamMembers = new Map<string, Member[]>();

export function getRoleOrder() {
  return roleOrder;
}

export function getRosterForTeam(teamCode: string): Member[] {
  return teamMembers.get(teamCode) ?? [];
}

export function setRosterForTeam(teamCode: string, members: Member[]) {
  teamMembers.set(teamCode, members);
}
