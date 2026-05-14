export type CrashLogLine = {
  time: string;
  text: string;
  type: "info" | "warn" | "error";
  corrupted: boolean;
  decoded?: string;
  redacted?: boolean;
  actual?: string;
};

export const crashLogLines: CrashLogLine[] = [
  {
    time: "02:31:07",
    text: "Agent initialized. Queue size: 211 requests.",
    type: "info",
    corrupted: false,
  },
  {
    time: "02:38:44",
    text: "726f7574696e6720636f6e66696720686173206e6f207465616d20646566696e6974696f6e73206c6f61646564",
    type: "warn",
    corrupted: true,
    decoded: "routing config has no team definitions loaded",
  },
  {
    time: "02:41:12",
    text: "6b657920757365643a20524e5f524f5554494e475f4b45595f32303234",
    type: "warn",
    corrupted: true,
    decoded: "key used: RN_ROUTING_KEY_2024",
  },
  {
    time: "02:43:58",
    text: "Fallback attempted. Config: ██████████",
    type: "warn",
    corrupted: false,
    redacted: true,
    actual: "Fallback attempted. Config: routing_v1_backup — file not found",
  },
  {
    time: "02:47:01",
    text: "Process terminated. Exit code: ROUTE_FAIL_NULL",
    type: "error",
    corrupted: false,
  },
  {
    time: "02:47:13",
    text: "System offline. Queue frozen.",
    type: "error",
    corrupted: false,
  },
];

export const brokenOutputRows = [
  {
    id: "#RN-00230",
    input: "No food in Sector 7...",
    label: "MISC_7",
    routed: "NULL",
    confidence: 0.31,
    endpoint: "https://reliefnet.internal/hooks/???",
  },
  {
    id: "#RN-00231",
    input: "Medical emergency, insulin...",
    label: "POSITIVE?",
    routed: "NULL",
    confidence: 0.18,
    endpoint: "https://reliefnet.internal/hooks/???",
  },
  {
    id: "#RN-00232",
    input: "paani nahi hai 2 din se...",
    label: "UNKNOWN_TYPE",
    routed: "NULL",
    confidence: 0.12,
    endpoint: "https://reliefnet.internal/hooks/???",
  },
  {
    id: "#RN-00233",
    input: "Tent collapsed Zone C...",
    label: "MISC_7",
    routed: "NULL",
    confidence: 0.44,
    endpoint: "https://reliefnet.internal/hooks/???",
  },
  {
    id: "#RN-00234",
    input: "URGENT generator fuel empty...",
    label: "SHELTER_INFRA",
    routed: "NULL",
    confidence: 0.71,
    endpoint: "https://reliefnet.internal/hooks/???",
  },
];

export const slackMessages = [
  {
    time: "YESTERDAY 11:47 PM",
    sender: "Arjun",
    text: "system is completely down, 847 requests frozen, nobody panic",
  },
  {
    time: "YESTERDAY 11:33 PM",
    sender: "Arjun",
    text: "...oh no. I thought you did that",
  },
  {
    time: "YESTERDAY 11:35 PM",
    sender: "Priya",
    text: "I sent it to you TWO WEEKS AGO",
    attachment: "routing_matrix_FINAL_v2.csv",
  },
  {
    time: "YESTERDAY 11:31 PM",
    sender: "Priya",
    text: "did anyone ever upload the final routing_matrix.csv? The agent has been running on the blank template since yesterday",
  },
  {
    time: "YESTERDAY 8:33 PM",
    sender: "Arjun",
    text: "ok cool ill handle it before tonight",
  },
  {
    time: "YESTERDAY 8:31 PM",
    sender: "Priya",
    text: "it needs them explicitly, there is a routing_matrix.csv it reads on startup",
  },
  {
    time: "YESTERDAY 8:22 PM",
    sender: "Arjun",
    text: "yo quick q — does the agent need team names explicitly or does it figure it out",
  },
  {
    time: "3 DAYS AGO",
    sender: "Priya",
    text: "nice work! make sure the routing_matrix is loaded before it goes live",
  },
  {
    time: "3 DAYS AGO",
    sender: "Vikram (Intern)",
    text: "pushed the agent to prod! tested on 5 sample tickets all passed 🎉",
  },
  {
    time: "3 DAYS AGO",
    sender: "Vikram (Intern)",
    text: "what is the routing_matrix?",
  },
];

export const routingMatrix = {
  teams: [
    {
      name: "Food Supply",
      webhook: "https://reliefnet.internal/hooks/food",
      zones: "ALL",
    },
    {
      name: "Medical",
      webhook: "https://reliefnet.internal/hooks/medical/urgent",
      zones: "ALL",
    },
    {
      name: "Volunteer",
      webhook: "https://reliefnet.internal/hooks/volunteer",
      zones: "ALL",
    },
    {
      name: "Shelter Zone A",
      webhook: "https://reliefnet.internal/hooks/shelter/zone-a",
      zones: "A",
    },
    {
      name: "Shelter Zone B",
      webhook: "https://reliefnet.internal/hooks/shelter/zone-b",
      zones: "B",
    },
    {
      name: "Shelter Zone C",
      webhook: "https://reliefnet.internal/hooks/shelter/zone-c",
      zones: "C",
    },
    {
      name: "Shelter Zone D",
      webhook: "https://reliefnet.internal/hooks/shelter/zone-d",
      zones: "D",
    },
    {
      name: "Shelter Zone E",
      webhook: "https://reliefnet.internal/hooks/shelter/zone-e",
      zones: "E",
    },
    {
      name: "Shelter Zone F",
      webhook: "https://reliefnet.internal/hooks/shelter/zone-f",
      zones: "F",
    },
  ],
  priorityOrder: ["Medical", "Food", "Shelter", "Volunteer"],
  confidenceThreshold: 0.65,
  unclassifiedWebhook: "https://reliefnet.internal/hooks/unclassified",
};

export const inboxItems = [
  {
    id: "#RN-00441",
    preview: "No food supply in Sector 7B since Tuesday",
    time: "3 min ago",
    zone: "B",
    unread: true,
    tooltip: {
      label: "MISC_7",
      confidence: 0.31,
      language: "English ✓",
      status: "ROUTE_FAILED — MISC_7 not found in routing table",
    },
  },
  {
    id: "#RN-00440",
    preview: "Medical emergency — diabetic patient out of insulin",
    time: "7 min ago",
    zone: "A",
    unread: true,
    tooltip: {
      label: "POSITIVE?",
      confidence: 0.18,
      language: "English ✓",
      status: "ROUTE_FAILED — POSITIVE? not found in routing table",
    },
  },
  {
    id: "#RN-00439",
    preview: "shelter mein paani nahi hai, 2 din se",
    time: "11 min ago",
    zone: "C",
    unread: true,
    tooltip: {
      label: "MISC_7",
      confidence: 0.12,
      language: "Unrecognized",
      status: "ROUTE_FAILED — language unrecognized, label invented",
    },
  },
  {
    id: "#RN-00438",
    preview: "Tent collapsed in Zone C. 12 people displaced.",
    time: "19 min ago",
    zone: "C",
    unread: false,
    tooltip: {
      label: "SHELTER_INFRA",
      confidence: 0.71,
      language: "English ✓",
      status: "ROUTE_FAILED — SHELTER_INFRA not found in routing table",
    },
  },
  {
    id: "#RN-00437",
    preview: "baby needs milk formula, none at distribution point",
    time: "24 min ago",
    zone: "D",
    unread: false,
    tooltip: {
      label: "FOOD_MAYBE",
      confidence: 0.29,
      language: "English ✓",
      status: "ROUTE_FAILED — FOOD_MAYBE not found in routing table",
    },
  },
  {
    id: "#RN-00436",
    preview: "Volunteer request — need 5 people for sanitation",
    time: "31 min ago",
    zone: "E",
    unread: false,
    tooltip: {
      label: "UNKNOWN_TYPE",
      confidence: 0.15,
      language: "English ✓",
      status: "ROUTE_FAILED — UNKNOWN_TYPE not found in routing table",
    },
  },
  {
    id: "#RN-00435",
    preview: "URGENT — generator fuel empty, hospital on battery",
    time: "38 min ago",
    zone: "F",
    unread: false,
    tooltip: {
      label: "MISC_7",
      confidence: 0.22,
      language: "English ✓",
      status: "ROUTE_FAILED — Zone F not configured, request discarded",
    },
  },
];

export type ZoneCard = {
  zone: string;
  requests: number;
  status: "normal" | "critical";
  warning?: string;
};

export const zoneCards: ZoneCard[] = [
  { zone: "A", requests: 182, status: "normal" },
  { zone: "B", requests: 156, status: "normal" },
  { zone: "C", requests: 203, status: "normal" },
  { zone: "D", requests: 167, status: "normal" },
  { zone: "E", requests: 139, status: "normal" },
  {
    zone: "F",
    requests: 0,
    status: "critical",
    warning: "Zone F webhook not configured. Requests discarded silently.",
  },
];

export const evidenceCards = [
  { id: "card-01", text: "routing_matrix.csv — never loaded at startup", category: "rootcause" },
  { id: "card-02", text: "Arjun: I thought you did that", category: "rootcause" },
  { id: "card-03", text: "Priya: I sent it to you TWO WEEKS AGO", category: "rootcause" },
  { id: "card-04", text: "routing_matrix_FINAL_v2.csv — all teams and webhooks", category: "rootcause" },
  { id: "card-05", text: "Crash log — routing config has no team definitions", category: "rootcause" },
  { id: "card-06", text: "Output table — all routes to NULL_DESTINATION", category: "nullrouting" },
  { id: "card-07", text: "Labels: MISC_7, POSITIVE?, UNKNOWN_TYPE — invented", category: "nullrouting" },
  { id: "card-08", text: "Confidence values 0.12 to 0.44 — all low", category: "nullrouting" },
  { id: "card-09", text: "SHELTER_INFRA — high confidence, still failed", category: "nullrouting" },
  { id: "card-10", text: "Arjun DELETE FROM routing_rules — 23:58:01", category: "rootcause" },
  { id: "card-11", text: "Zone F — 0 requests, silently discarded", category: "fix" },
  { id: "card-12", text: "min_confidence threshold 0.65 in System Notes", category: "fix" },
  { id: "card-13", text: "routing_matrix_FINAL_v2.csv — use this", category: "fix" },
  { id: "decoy-a", text: "Server memory usage 94% at 02:45", category: "decoy" },
  { id: "decoy-b", text: "Database connection timeout at 01:12", category: "decoy" },
  { id: "decoy-c", text: "Intern: all tests passed 🎉", category: "decoy" },
];

export const publicTestCases = [
  {
    input: "No food since 2 days, Sector 7B",
    zone: "B",
    expected: "Food",
    webhook: "https://reliefnet.internal/hooks/food",
  },
  {
    input: "bachhe ko bukhar hai, doctor chahiye",
    zone: "A",
    expected: "Medical",
    webhook: "https://reliefnet.internal/hooks/medical/urgent",
  },
  {
    input: "tent blown away in last night storm",
    zone: "C",
    expected: "Shelter",
    webhook: "https://reliefnet.internal/hooks/shelter/zone-c",
  },
  {
    input: "need 3 helpers for distributing supplies",
    zone: "E",
    expected: "Volunteer",
    webhook: "https://reliefnet.internal/hooks/volunteer",
  },
  {
    input: "paani nahi hai aur khana bhi khatam",
    zone: "D",
    expected: "Food",
    webhook: "https://reliefnet.internal/hooks/food",
  },
  {
    input: "insulin khatam, diabetic patient critical",
    zone: "F",
    expected: "Medical",
    webhook: "https://reliefnet.internal/hooks/medical/urgent",
  },
];
