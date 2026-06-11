export type DevlogEntry = {
  version: string;
  date: string;
  changes: string[];
};

/**
 * Site version and changelog.
 * On each release: bump SITE_VERSION, add a new entry at the top, and sync package.json + index.html meta.
 */
export const SITE_VERSION = "0.6.0";

export const DEVLOG_ENTRIES: DevlogEntry[] = [
  {
    version: "0.6.0",
    date: "2026-06-11",
    changes: [
      "Merged the active old app back into the documented canonical game-flow folder so the workspace has one current React prototype again.",
      "Added a dedicated Florist NPC page for present-day interaction design with notebook-gated unlocks and friendship tiers.",
      "Added a level-2 florist dialogue choice that unlocks different level-3 interaction branches."
    ]
  },
  {
    version: "0.5.0",
    date: "2026-06-11",
    changes: [
      "Added an Asset Gallery tab in the node editor so authors can browse local `src/assets/gallery` references and assign or clear node images without pasting URLs by hand.",
      "Expanded the Collectables page into an authoring workflow with a cross-board registry, memory filters, section dropdown browsing, and direct create-collectable actions that write back into the shared site document.",
      "Synced the new release version across the footer devlog, package metadata, and HTML application version fields so the shipped build reports the current site state consistently."
    ]
  },
  {
    version: "0.4.0",
    date: "2026-06-10",
    changes: [
      "Added a dedicated Dev Advice panel so implementation guidance can live in the UI without mixing into release history.",
      "Split release notes and technical follow-up notes into separate data files for easier handoff maintenance.",
      "Synced the app version metadata so the footer log, package version, and document title all point to the same release."
    ]
  },
  {
    version: "0.3.0",
    date: "2026-06-10",
    changes: [
      "Added a prototype Stats page with toggleable source nodes and editable per-node stat deltas.",
      "Added a fake newspaper ending page composed from reusable content blocks driven by simulated stat totals and flags.",
      "Kept the stat simulation separate from live graph data so ending experiments can move fast before formal schema changes."
    ]
  },
  {
    version: "0.2.0",
    date: "2026-06-10",
    changes: [
      "Fixed node drag flicker and blank-screen crash across Present, Florist, and R&J graph views.",
      "Added Collectables memory filter and per-section dropdown browsing.",
      "Added collectable image previews with a shared placeholder when no image is set."
    ]
  },
  {
    version: "0.1.0",
    date: "2026-06-07",
    changes: [
      "Initial React site with Present Map, Florist Memory, and R&J Memory flow editors.",
      "Browser-side graph editing with Excel workbook import and export.",
      "Collectables registry view wired to the unified site JSON."
    ]
  }
];

export function getLatestDevlogEntry() {
  return DEVLOG_ENTRIES[0] ?? null;
}
