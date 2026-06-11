import type { GraphEdge, OverallState, PresentNode } from "../types/graph";

const everyDayOpen = { 1: "Open", 2: "Open", 3: "Open", 4: "Open", 5: "Open", 6: "Open", 7: "Open" };
const placeholderByDay = {
  1: "Placeholder",
  2: "Placeholder",
  3: "Placeholder",
  4: "Placeholder",
  5: "Placeholder",
  6: "Placeholder",
  7: "Placeholder"
};

export const dayNotes: Record<number, string> = {
  1: "Present map rework: Museum is the center location and links to Memory Tree, War Exhibit, and Town Square.",
  2: "Present locations remain available. Collectables and interaction triggers are placeholders until authored.",
  3: "Present locations remain available. Placeholder nodes should not imply final route logic.",
  4: "Present locations remain available. Location ownership is more important than full graph connectivity.",
  5: "Present locations remain available. Memory-specific routing will be layered in after the location map is stable.",
  6: "Present locations remain available. Late-state checks are intentionally out of scope for this first rework pass.",
  7: "Present locations remain available. Ending logic will be added later as a separate state layer."
};

export const initialOverallState: OverallState = {
  currentDay: 1,
  memoriesEntered: 0,
  presentNodesVisited: 4,
  dialogueChoicesRecorded: 0,
  collectablesRecorded: 0,
  notebookEntriesProgressed: 0,
  statAffected: false,
  endingReady: false
};

export const presentNodes: PresentNode[] = [
  {
    id: "museum",
    title: "Museum",
    kind: "location",
    role: "location",
    level: 1,
    cluster: "museum",
    emphasis: "major",
    summary: "Central Present location. It links to the other three location anchors.",
    detail:
      "Museum is the default center point for the Present graph. It should read as a place first, not as a memory-route node.",
    x: 560,
    y: 300,
    confirmed: true,
    dayOpen: everyDayOpen,
    memoryAccess: "Location anchor",
    npcs: ["Placeholder"],
    interactions: ["Move to linked locations", "Inspect local collectable", "Inspect local interaction trigger"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Museum links to Memory Tree, War Exhibit, and Town Square."],
    queryPath: ["Museum -> Memory Tree", "Museum -> War Exhibit", "Museum -> Town Square"]
  },
  {
    id: "memory-tree",
    title: "Memory Tree",
    kind: "location",
    role: "location",
    level: 1,
    cluster: "hub",
    emphasis: "major",
    summary: "Present location anchor for memory access.",
    detail:
      "Memory Tree is currently treated as one of the four major Present locations. Memory route details should be added later, after this location layer is stable.",
    x: 560,
    y: 70,
    confirmed: true,
    dayOpen: everyDayOpen,
    memoryAccess: "Future memory access layer",
    npcs: ["Placeholder"],
    interactions: ["Inspect memory access placeholder", "Inspect local collectable"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Future memory-routing nodes can attach here."],
    queryPath: ["Museum -> Memory Tree"]
  },
  {
    id: "war-exhibit",
    title: "War Exhibit",
    kind: "location",
    role: "location",
    level: 1,
    cluster: "war",
    emphasis: "major",
    summary: "Present location anchor for war exhibit content.",
    detail:
      "War Exhibit is one of the four location-level nodes. Its collectable and interaction trigger are placeholders for future authored content.",
    x: 900,
    y: 300,
    confirmed: true,
    dayOpen: everyDayOpen,
    memoryAccess: "Location anchor",
    npcs: ["Placeholder"],
    interactions: ["Inspect exhibit placeholder", "Inspect local collectable"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Future exhibit-specific content can attach here."],
    queryPath: ["Museum -> War Exhibit"]
  },
  {
    id: "town-square",
    title: "Town Square",
    kind: "location",
    role: "location",
    level: 1,
    cluster: "town",
    emphasis: "major",
    summary: "Present location anchor for town-side content.",
    detail:
      "Town Square is one of the four location-level nodes. NPC and street interactions can be layered in later.",
    x: 220,
    y: 300,
    confirmed: true,
    dayOpen: everyDayOpen,
    memoryAccess: "Location anchor",
    npcs: ["Placeholder"],
    interactions: ["Inspect town placeholder", "Inspect local collectable"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Future NPC and town interaction nodes can attach here."],
    queryPath: ["Museum -> Town Square"]
  },
  {
    id: "museum-collectable",
    title: "Museum Collectable Placeholder",
    kind: "collectable",
    role: "collectable",
    level: 2,
    cluster: "museum",
    emphasis: "minor",
    parentId: "museum",
    summary: "Placeholder collectable attached to Museum.",
    detail: "This level 2 node reserves space for one future Museum collectable.",
    x: 560,
    y: 480,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["None"],
    interactions: ["Collect placeholder item"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored collectable data later."],
    queryPath: ["Museum -> Museum Collectable Placeholder"]
  },
  {
    id: "museum-interaction",
    title: "Museum Interaction Placeholder",
    kind: "interaction-trigger",
    role: "interaction-trigger",
    level: 3,
    cluster: "museum",
    emphasis: "minor",
    parentId: "museum",
    summary: "Placeholder interaction trigger attached to Museum.",
    detail: "This level 3 node reserves space for one future Museum interactable.",
    x: 750,
    y: 470,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["Placeholder"],
    interactions: ["Trigger placeholder interaction"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored interaction data later."],
    queryPath: ["Museum -> Museum Interaction Placeholder"]
  },
  {
    id: "memory-tree-collectable",
    title: "Memory Tree Collectable Placeholder",
    kind: "collectable",
    role: "collectable",
    level: 2,
    cluster: "hub",
    emphasis: "minor",
    parentId: "memory-tree",
    summary: "Placeholder collectable attached to Memory Tree.",
    detail: "This level 2 node reserves space for one future Memory Tree collectable.",
    x: 380,
    y: 30,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["None"],
    interactions: ["Collect placeholder item"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored collectable data later."],
    queryPath: ["Memory Tree -> Memory Tree Collectable Placeholder"]
  },
  {
    id: "memory-tree-interaction",
    title: "Memory Tree Interaction Placeholder",
    kind: "interaction-trigger",
    role: "interaction-trigger",
    level: 3,
    cluster: "hub",
    emphasis: "minor",
    parentId: "memory-tree",
    summary: "Placeholder interaction trigger attached to Memory Tree.",
    detail: "This level 3 node reserves space for one future Memory Tree interactable.",
    x: 760,
    y: 30,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "Future memory access layer",
    npcs: ["Placeholder"],
    interactions: ["Trigger placeholder interaction"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored interaction data later."],
    queryPath: ["Memory Tree -> Memory Tree Interaction Placeholder"]
  },
  {
    id: "war-exhibit-collectable",
    title: "War Exhibit Collectable Placeholder",
    kind: "collectable",
    role: "collectable",
    level: 2,
    cluster: "war",
    emphasis: "minor",
    parentId: "war-exhibit",
    summary: "Placeholder collectable attached to War Exhibit.",
    detail: "This level 2 node reserves space for one future War Exhibit collectable.",
    x: 1060,
    y: 220,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["None"],
    interactions: ["Collect placeholder item"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored collectable data later."],
    queryPath: ["War Exhibit -> War Exhibit Collectable Placeholder"]
  },
  {
    id: "war-exhibit-interaction",
    title: "War Exhibit Interaction Placeholder",
    kind: "interaction-trigger",
    role: "interaction-trigger",
    level: 3,
    cluster: "war",
    emphasis: "minor",
    parentId: "war-exhibit",
    summary: "Placeholder interaction trigger attached to War Exhibit.",
    detail: "This level 3 node reserves space for one future War Exhibit interactable.",
    x: 1060,
    y: 390,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["Placeholder"],
    interactions: ["Trigger placeholder interaction"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored interaction data later."],
    queryPath: ["War Exhibit -> War Exhibit Interaction Placeholder"]
  },
  {
    id: "town-square-collectable",
    title: "Town Square Collectable Placeholder",
    kind: "collectable",
    role: "collectable",
    level: 2,
    cluster: "town",
    emphasis: "minor",
    parentId: "town-square",
    summary: "Placeholder collectable attached to Town Square.",
    detail: "This level 2 node reserves space for one future Town Square collectable.",
    x: 40,
    y: 220,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["None"],
    interactions: ["Collect placeholder item"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored collectable data later."],
    queryPath: ["Town Square -> Town Square Collectable Placeholder"]
  },
  {
    id: "town-square-interaction",
    title: "Town Square Interaction Placeholder",
    kind: "interaction-trigger",
    role: "interaction-trigger",
    level: 3,
    cluster: "town",
    emphasis: "minor",
    parentId: "town-square",
    summary: "Placeholder interaction trigger attached to Town Square.",
    detail: "This level 3 node reserves space for one future Town Square interactable.",
    x: 40,
    y: 390,
    confirmed: false,
    dayOpen: placeholderByDay,
    memoryAccess: "None",
    npcs: ["Placeholder"],
    interactions: ["Trigger placeholder interaction"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored interaction data later."],
    queryPath: ["Town Square -> Town Square Interaction Placeholder"]
  }
];

export const presentEdges: GraphEdge[] = [
  { id: "present-location-001", from: "museum", to: "memory-tree" },
  { id: "present-location-002", from: "museum", to: "war-exhibit" },
  { id: "present-location-003", from: "museum", to: "town-square" },
  { id: "museum-detail-001", from: "museum", to: "museum-collectable" },
  { id: "museum-detail-002", from: "museum", to: "museum-interaction" },
  { id: "memory-tree-detail-001", from: "memory-tree", to: "memory-tree-collectable" },
  { id: "memory-tree-detail-002", from: "memory-tree", to: "memory-tree-interaction" },
  { id: "war-exhibit-detail-001", from: "war-exhibit", to: "war-exhibit-collectable" },
  { id: "war-exhibit-detail-002", from: "war-exhibit", to: "war-exhibit-interaction" },
  { id: "town-square-detail-001", from: "town-square", to: "town-square-collectable" },
  { id: "town-square-detail-002", from: "town-square", to: "town-square-interaction" }
];
