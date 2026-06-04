import type { GraphEdge, OverallState, PresentNode } from "../types/graph";

export const dayNotes: Record<number, string> = {
  1: "Day 1 starts in present and routes into Florist. Mira follow-up and changed present-state checks should come back through the same map.",
  2: "Day 2 keeps present as the start point, then opens the first choice set for R&J, Villain, and Child.",
  3: "Day 3 keeps the same memory choice set active, but present-side NPC layers and clue states can shift.",
  4: "Day 4 still allows R&J, Villain, and Child from present, with deeper consequence tracking.",
  5: "Day 5 opens Boris memory from present and should route back into late present consequences.",
  6: "Day 6 is currently a convergence skeleton for notebook, environment, and NPC-state checks.",
  7: "Day 7 is the ending-day present map. It should read accumulated choices, notebook progress, NPC unlocks, and environment changes."
};

export const initialOverallState: OverallState = {
  currentDay: 1,
  memoriesEntered: 1,
  presentNodesVisited: 5,
  dialogueChoicesRecorded: 3,
  collectablesRecorded: 2,
  notebookEntriesProgressed: 2,
  statAffected: true,
  endingReady: false
};

export const presentNodes: PresentNode[] = [
  {
    id: "memory-tree",
    title: "Memory Tree",
    kind: "location",
    cluster: "hub",
    emphasis: "major",
    summary: "Central present trigger point. Every memory should be entered from present, then routed back here through consequence checks.",
    detail:
      "This is the main anchor for the present map. It should always stay readable as the core route node that fans out into memory access, clue review, and return-state tracking.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Open", 6: "Open", 7: "Ending State Anchor" },
    memoryAccess: "Primary",
    npcs: ["Marc", "Petar", "Interview NPC placeholders"],
    interactions: ["Open memory routes", "Return from memory", "Review notebook and consequence state"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: [
      "Layer 2 and 3 NPC talks should point to prerequisite present nodes rather than unlocking directly here.",
      "Memory entry requirements should be queryable from linked clue and NPC nodes."
    ],
    queryPath: [
      "Present start -> Memory Tree -> memory route",
      "Memory return -> consequence check -> notebook / stat / environment update"
    ]
  },
  {
    id: "memory-entry-hub",
    title: "Memory Entry Hub",
    kind: "memory-entry",
    cluster: "hub",
    emphasis: "minor",
    parentId: "memory-tree",
    summary: "Day-aware routing node for every memory entrance.",
    detail:
      "Day 1 opens Florist. Days 2 to 4 open R&J, Villain, and Child. Day 5 opens Boris. Day 7 should stop opening new memories and only show the ending-state readout.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: {
      1: "Florist only",
      2: "R&J / Villain / Child",
      3: "R&J / Villain / Child",
      4: "R&J / Villain / Child",
      5: "Boris",
      6: "Late convergence placeholder",
      7: "No new memory"
    },
    memoryAccess: "Primary",
    npcs: ["Mira", "Jovan", "Ruzica", "Villain placeholder", "Child placeholder", "Boris"],
    interactions: ["Inspect day-specific route list", "Open memory from present"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: [
      "Use this node to inspect which present routes are needed before entering each memory.",
      "NPC layer checks should redirect the player toward route-specific present nodes."
    ],
    queryPath: ["Day 1 -> Florist", "Days 2-4 -> R&J / Villain / Child", "Day 5 -> Boris", "Day 7 -> Ending only"],
    enterButton: true
  },
  {
    id: "florist-route",
    title: "Florist Route",
    kind: "memory-entry",
    cluster: "hub",
    emphasis: "minor",
    parentId: "memory-tree",
    summary: "Day 1 route into Florist memory.",
    detail: "This route should only be actively enterable on Day 1, then remain as a recorded branch for later consequence checks.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Closed after completion", 3: "Recorded", 4: "Recorded", 5: "Recorded", 6: "Recorded", 7: "Recorded" },
    memoryAccess: "Day 1 only",
    npcs: ["Mira"],
    interactions: ["Enter Florist memory", "Check Florist completion state"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Should connect back to Mira follow-up and present environment changes."],
    queryPath: ["Memory Tree -> Florist Route -> Florist Memory -> Mira follow-up"],
    enterButton: true
  },
  {
    id: "choice-routes",
    title: "Day 2-4 Choice Set",
    kind: "trigger",
    cluster: "hub",
    emphasis: "minor",
    parentId: "memory-tree",
    summary: "Present-side selector for R&J, Villain, and Child on Days 2 to 4.",
    detail:
      "This node is a routing condition, not a scene. It should show that the player chooses one route from present, and the result affects later present state.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Locked", 2: "Open", 3: "Open", 4: "Open", 5: "Closed", 6: "Recorded", 7: "Recorded" },
    memoryAccess: "Days 2-4",
    npcs: ["Jovan", "Ruzica", "Villain placeholder", "Child placeholder"],
    interactions: ["Check available route", "Inspect gating conditions", "Choose one path"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: [
      "This should redirect into route-specific prerequisite nodes.",
      "Player choice should be stored locally and shown in the overall panel."
    ],
    queryPath: ["Present -> route choice -> chosen memory -> present consequence"]
  },
  {
    id: "boris-route",
    title: "Boris Route",
    kind: "memory-entry",
    cluster: "hub",
    emphasis: "minor",
    parentId: "memory-tree",
    summary: "Day 5 route into Boris memory.",
    detail: "This route should only become live on Day 5 and should read prior memory and notebook state.",
    x: 0,
    y: 0,
    confirmed: false,
    dayOpen: { 1: "Locked", 2: "Locked", 3: "Locked", 4: "Locked", 5: "Open", 6: "Recorded", 7: "Recorded" },
    memoryAccess: "Day 5",
    npcs: ["Boris"],
    interactions: ["Check Boris unlock path", "Enter Boris memory"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Should show prerequisite nodes from earlier days rather than unlock on click."],
    queryPath: ["Present -> Boris route -> Boris memory -> ending-state consequence"],
    enterButton: true
  },
  {
    id: "town-square",
    title: "Town Square",
    kind: "location",
    cluster: "town",
    emphasis: "major",
    summary: "Present-day free-roam connector for clue-following and NPC follow-up interactions.",
    detail:
      "This is a location node, so it should stay larger than surrounding branch nodes. It anchors movement and public-space consequences in present, distinct from memory-only flow.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Open", 6: "Open", 7: "Open" },
    memoryAccess: "Indirect",
    npcs: ["Marc", "Passerby placeholders", "Mira follow-up path"],
    interactions: ["Move through present map", "Follow clue chain", "Talk to town NPCs"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Use this location to route into day-state and clue-related branches."],
    queryPath: ["Town Square -> NPC talk -> stat or notebook change", "Town Square -> clue -> related branch node"]
  },
  {
    id: "mira-present",
    title: "Mira Follow-up",
    kind: "npc-gate",
    cluster: "town",
    emphasis: "minor",
    parentId: "town-square",
    summary: "Post-Florist present dialogue node that stores a single player choice.",
    detail:
      "This node should model one locked-in dialogue choice. That choice should update local simulated state and feed notebook, stat, and environment consequences.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "After Florist", 2: "Conditional", 3: "Conditional", 4: "Conditional", 5: "Recorded", 6: "Recorded", 7: "Recorded" },
    memoryAccess: "Post-memory follow-up",
    npcs: ["Mira"],
    interactions: ["Choose one response", "Record choice locally", "Trace consequence path"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: [
      "Layer 2 should point to Florist completion and clue-state nodes.",
      "Layer 3 should point to compounded notebook and relationship state nodes."
    ],
    queryPath: ["Florist complete -> Mira follow-up -> stat / notebook / environment consequence"]
  },
  {
    id: "town-clue-chain",
    title: "Town Clue Chain",
    kind: "trigger",
    cluster: "town",
    emphasis: "minor",
    parentId: "town-square",
    summary: "Public-space trigger path for clue and environment interpretation.",
    detail: "This node should help explain how present-side clue reading leads into other locations or NPC branches.",
    x: 0,
    y: 0,
    confirmed: false,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Open", 6: "Placeholder", 7: "Recorded" },
    memoryAccess: "Indirect",
    npcs: ["Passerby placeholders"],
    interactions: ["Inspect clue", "Route to related location", "Flag notebook consequence"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Should route to connected nodes instead of resolving directly."],
    queryPath: ["Town clue -> linked location or NPC node"]
  },
  {
    id: "museum-exterior",
    title: "Museum Exterior",
    kind: "location",
    cluster: "museum",
    emphasis: "major",
    summary: "Museum-facing staging area used for entry, exhibit routing, and interview framing.",
    detail:
      "This location should stay large and readable as a hub for museum-side present flow, separate from memory scenes.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Open", 6: "Open", 7: "Open" },
    memoryAccess: "Indirect",
    npcs: ["Marc", "Visitor placeholders"],
    interactions: ["Approach museum", "Route into exhibits", "Return to Memory Tree"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", false]
    ],
    unlocks: ["Museum exterior should branch into exhibit and interview logic rather than acting as a memory node."],
    queryPath: ["Museum Exterior -> exhibit branch", "Museum Exterior -> interview branch", "Museum Exterior -> Memory Tree"]
  },
  {
    id: "rj-present",
    title: "Jovan / Ruzica Encounter",
    kind: "npc-gate",
    cluster: "museum",
    emphasis: "minor",
    parentId: "museum-exterior",
    summary: "Present-day encounter that leads into R&J memory.",
    detail:
      "This is one of the clearest present-first routes: present conversation, memory entry, then a return to present consequences.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Setup placeholder", 2: "Open", 3: "Open", 4: "Open", 5: "Follow-up", 6: "Recorded", 7: "Recorded" },
    memoryAccess: "Direct route into R&J",
    npcs: ["Jovan", "Ruzica"],
    interactions: ["Interview framing", "Missing letter setup", "Route into memory"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: [
      "Layer 2 should point to R&J completion conditions.",
      "Layer 3 should point to notebook, choice, and day-state conditions."
    ],
    queryPath: ["Present encounter -> missing letter -> R&J memory -> present consequence"],
    enterButton: true
  },
  {
    id: "museum-interview-state",
    title: "Interview State",
    kind: "state",
    cluster: "museum",
    emphasis: "minor",
    parentId: "museum-exterior",
    summary: "Tracks which museum interviews or dialogue gates are open on the current day.",
    detail: "This is a query node for present-only availability, not a separate scene node.",
    x: 0,
    y: 0,
    confirmed: false,
    dayOpen: { 1: "Open", 2: "Shifted", 3: "Shifted", 4: "Shifted", 5: "Late-game check", 6: "Placeholder", 7: "Ending readout" },
    memoryAccess: "Availability only",
    npcs: ["Marc", "Interview targets placeholder"],
    interactions: ["Check current-day talk state", "Query unlock condition"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", false]
    ],
    unlocks: ["Should point to source nodes responsible for each change in availability."],
    queryPath: ["Interview state -> related NPC or clue node"]
  },
  {
    id: "artifact-exhibit",
    title: "Artifact Exhibit",
    kind: "location",
    cluster: "artifact",
    emphasis: "major",
    summary: "Object-heavy exhibit branch for notebook and collectable routing.",
    detail:
      "This location should hold inspectable points, placeholder collectables, and notebook-linked paths.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Conditional", 6: "Placeholder", 7: "Recorded" },
    memoryAccess: "Clue-based",
    npcs: ["Guide placeholder", "Marc placeholder"],
    interactions: ["Inspect object", "Read label or document", "Route notebook entry"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Collectables should point toward notebook and gating nodes rather than resolve automatically."],
    queryPath: ["Artifact Exhibit -> inspect object -> notebook", "Artifact Exhibit -> document clue -> related route"]
  },
  {
    id: "artifact-documents",
    title: "Artifact Documents",
    kind: "trigger",
    cluster: "artifact",
    emphasis: "minor",
    parentId: "artifact-exhibit",
    summary: "Document-reading branch for present notebook progress.",
    detail: "Use this node to show document-style collectables such as labels, newspapers, or exhibit texts.",
    x: 0,
    y: 0,
    confirmed: false,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Conditional", 6: "Placeholder", 7: "Recorded" },
    memoryAccess: "Indirect",
    npcs: ["None"],
    interactions: ["Read document", "Record notebook flag", "Show linked nodes"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Document collectables should lead toward linked notebook and route-condition nodes."],
    queryPath: ["Document read -> notebook update -> linked path"]
  },
  {
    id: "artifact-collectable",
    title: "Scene Collectable",
    kind: "trigger",
    cluster: "artifact",
    emphasis: "minor",
    parentId: "artifact-exhibit",
    summary: "Placeholder for a highlightable pick-up in the present map.",
    detail: "This represents a scene collectable rather than a document or minigame outcome.",
    x: 0,
    y: 0,
    confirmed: false,
    dayOpen: { 1: "Placeholder", 2: "Placeholder", 3: "Placeholder", 4: "Placeholder", 5: "Placeholder", 6: "Placeholder", 7: "Recorded" },
    memoryAccess: "Indirect",
    npcs: ["None"],
    interactions: ["Highlight pick-up", "Record collect or ignore state"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Clicking should point to affected notebook and environment nodes."],
    queryPath: ["Collect or ignore -> local state -> notebook or environment effect"]
  },
  {
    id: "war-exhibit",
    title: "War Exhibit / Map Area",
    kind: "location",
    cluster: "war",
    emphasis: "major",
    summary: "War-history branch with map and signage emphasis.",
    detail:
      "This location should be one of the clearest information anchors in present, with geography and perspective consequences tied back into memory gating.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Conditional", 6: "Placeholder", 7: "Recorded" },
    memoryAccess: "Clue-based",
    npcs: ["Guide placeholder", "Visitor placeholder"],
    interactions: ["Inspect map", "Read war-history context", "Trace perspective consequence"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["War-history reading should point into linked notebook and consequence nodes."],
    queryPath: ["War Exhibit -> inspect map -> notebook", "War Exhibit -> interpretation -> stat or environment effect"]
  },
  {
    id: "day-state",
    title: "Day State / Day 7 Ending",
    kind: "location",
    cluster: "state",
    emphasis: "major",
    summary: "Query hub for seven-day present changes and the final ending-state readout.",
    detail:
      "This location-scale node tracks how choices, collectables, notebook progress, NPC unlocks, and memory completion feed the ending. Day 7 should resolve through this branch rather than through new memory entry.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Tracking", 2: "Tracking", 3: "Tracking", 4: "Tracking", 5: "Tracking", 6: "Tracking", 7: "Ending Day State" },
    memoryAccess: "Consequence readout",
    npcs: ["All day-dependent NPCs placeholder"],
    interactions: ["Check daily open state", "Check NPC appearance", "Check ending consequence path"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["This should remain query-only and route the player to the source nodes behind each consequence."],
    queryPath: ["Choice / collect / memory completion -> stat / notebook / environment update -> Day 7 ending"]
  },
  {
    id: "npc-schedule",
    title: "NPC Day Schedule",
    kind: "state",
    cluster: "state",
    emphasis: "minor",
    parentId: "day-state",
    summary: "Placeholder tracker for which NPCs appear on each day and where they appear.",
    detail: "This is a skeleton node until the source documents provide a full per-day NPC appearance table.",
    x: 0,
    y: 0,
    confirmed: false,
    dayOpen: { 1: "Partial", 2: "Partial", 3: "Partial", 4: "Partial", 5: "Partial", 6: "Placeholder", 7: "Ending readout" },
    memoryAccess: "Query only",
    npcs: ["All NPC placeholders"],
    interactions: ["Check day", "Check location", "Jump to relevant node"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", false]
    ],
    unlocks: ["Should route to source nodes rather than fabricate unlock state."],
    queryPath: ["Choose day -> see NPC -> jump to related location or memory route"]
  },
  {
    id: "consequence-panel",
    title: "Consequence Path",
    kind: "state",
    cluster: "state",
    emphasis: "minor",
    parentId: "day-state",
    summary: "Tracks how choice, collect, and dialogue flags affect stats, notebook progress, and environment.",
    detail:
      "This is the path-query node for the player's recorded state. It should make the local simulation legible without unlocking anything directly.",
    x: 0,
    y: 0,
    confirmed: true,
    dayOpen: { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Open", 6: "Open", 7: "Ending readout" },
    memoryAccess: "Query only",
    npcs: ["None"],
    interactions: ["Inspect path state", "See affected nodes", "Check ending contribution"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Should route users to the nodes that produced each change."],
    queryPath: ["Choice true/false -> stat / notebook / environment effect -> ending impact"]
  }
];

export const presentEdges: GraphEdge[] = [
  { id: "pe-001", from: "memory-tree", to: "memory-entry-hub" },
  { id: "pe-002", from: "memory-tree", to: "florist-route" },
  { id: "pe-003", from: "memory-tree", to: "choice-routes" },
  { id: "pe-004", from: "memory-tree", to: "boris-route" },
  { id: "pe-005", from: "memory-tree", to: "town-square" },
  { id: "pe-006", from: "memory-tree", to: "museum-exterior" },
  { id: "pe-007", from: "memory-tree", to: "day-state" },
  { id: "pe-008", from: "town-square", to: "mira-present" },
  { id: "pe-009", from: "town-square", to: "town-clue-chain" },
  { id: "pe-010", from: "museum-exterior", to: "rj-present" },
  { id: "pe-011", from: "museum-exterior", to: "museum-interview-state" },
  { id: "pe-012", from: "museum-exterior", to: "artifact-exhibit" },
  { id: "pe-013", from: "museum-exterior", to: "war-exhibit" },
  { id: "pe-014", from: "artifact-exhibit", to: "artifact-documents" },
  { id: "pe-015", from: "artifact-exhibit", to: "artifact-collectable" },
  { id: "pe-016", from: "day-state", to: "npc-schedule" },
  { id: "pe-017", from: "day-state", to: "consequence-panel" },
  { id: "pe-018", from: "mira-present", to: "consequence-panel" },
  { id: "pe-019", from: "rj-present", to: "consequence-panel" },
  { id: "pe-020", from: "florist-route", to: "mira-present" },
  { id: "pe-021", from: "choice-routes", to: "rj-present" }
];
