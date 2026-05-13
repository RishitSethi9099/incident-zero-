import { NextResponse } from "next/server";

const recentRequests = [
  {
    timestamp: "08:12:41",
    input: "No food since 2 days, Sector 7B",
    expected: "Food",
    actual: "Food",
    pass: true,
  },
  {
    timestamp: "08:13:02",
    input: "tent blown away in last night storm",
    expected: "Shelter",
    actual: "Shelter",
    pass: true,
  },
  {
    timestamp: "08:13:27",
    input: "insulin khatam, diabetic patient critical",
    expected: "Medical",
    actual: "Food",
    pass: false,
  },
  {
    timestamp: "08:14:05",
    input: "need 3 helpers for distributing supplies",
    expected: "Volunteer",
    actual: "Volunteer",
    pass: true,
  },
  {
    timestamp: "08:14:42",
    input: "generator fuel empty, hospital on battery",
    expected: "Shelter",
    actual: "Shelter",
    pass: true,
  },
  {
    timestamp: "08:15:11",
    input: "medical emergency - child asthma attack",
    expected: "Medical",
    actual: "Medical",
    pass: true,
  },
  {
    timestamp: "08:15:49",
    input: "paani nahi hai aur khana bhi khatam",
    expected: "Food",
    actual: "Food",
    pass: true,
  },
  {
    timestamp: "08:16:20",
    input: "need volunteers for sanitation drive",
    expected: "Volunteer",
    actual: "Volunteer",
    pass: true,
  },
  {
    timestamp: "08:16:51",
    input: "tent collapsed in zone c",
    expected: "Shelter",
    actual: "Shelter",
    pass: true,
  },
  {
    timestamp: "08:17:30",
    input: "shelter mein paani nahi hai",
    expected: "Food",
    actual: "Food",
    pass: true,
  },
  {
    timestamp: "08:18:04",
    input: "insulin khatam, patient critical",
    expected: "Medical",
    actual: "Medical",
    pass: true,
  },
  {
    timestamp: "08:18:41",
    input: "need 5 helpers for distribution",
    expected: "Volunteer",
    actual: "Volunteer",
    pass: true,
  },
  {
    timestamp: "08:19:12",
    input: "generator down in zone d",
    expected: "Shelter",
    actual: "Shelter",
    pass: true,
  },
  {
    timestamp: "08:19:39",
    input: "no milk formula at distribution point",
    expected: "Food",
    actual: "Food",
    pass: true,
  },
  {
    timestamp: "08:20:05",
    input: "doctor chahiye, fever not going down",
    expected: "Medical",
    actual: "Medical",
    pass: true,
  },
  {
    timestamp: "08:20:30",
    input: "volunteer needed for search team",
    expected: "Volunteer",
    actual: "Volunteer",
    pass: true,
  },
  {
    timestamp: "08:20:58",
    input: "tent blown away in storm",
    expected: "Shelter",
    actual: "Shelter",
    pass: true,
  },
  {
    timestamp: "08:21:29",
    input: "no food left in camp",
    expected: "Food",
    actual: "Food",
    pass: true,
  },
  {
    timestamp: "08:21:54",
    input: "ambulance required, serious injury",
    expected: "Medical",
    actual: "Medical",
    pass: true,
  },
  {
    timestamp: "08:22:19",
    input: "need manpower to unload supplies",
    expected: "Volunteer",
    actual: "Volunteer",
    pass: true,
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamCode = searchParams.get("teamCode") ?? "";

  const payload = {
    teamCode,
    accuracy: 0.73,
    totalRequests: 847,
    passed: 618,
    failed: 229,
    recentRequests,
  };

  return NextResponse.json(payload);
}
