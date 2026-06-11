export type DevAdviceEntry = {
  id: string;
  title: string;
  date: string;
  priority: "high" | "medium" | "low";
  tags: string[];
  summary: string;
  actions: string[];
};

/**
 * Working notes for implementation advice that should stay visible in the site UI.
 * Add new advice entries at the top so the latest recommendation appears first.
 */
export const DEV_ADVICE_ENTRIES: DevAdviceEntry[] = [
  {
    id: "advice-2026-06-10-dev-notes",
    title: "Track implementation follow-ups separately from release notes",
    date: "2026-06-10",
    priority: "medium",
    tags: ["workflow", "handoff"],
    summary:
      "Use this panel for build advice, technical caveats, and next-step recommendations that do not belong in the shipped devlog.",
    actions: [
      "Write one advice card per decision or follow-up so teammates can scan unresolved work quickly.",
      "Keep release-facing summaries in src/data/devlog.ts and use this file for implementation guidance only.",
      "When an advice item is resolved, either remove it or rewrite it into a completed history/devlog note."
    ]
  }
];

export function getLatestDevAdviceEntry() {
  return DEV_ADVICE_ENTRIES[0] ?? null;
}
