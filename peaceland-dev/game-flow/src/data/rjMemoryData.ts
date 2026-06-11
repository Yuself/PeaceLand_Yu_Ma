import type { GraphEdge, GraphNode, GraphNodeLevel, GraphNodeRole, NodeKind } from "../types/graph";

const allDays = {
  1: "Memory node",
  2: "Memory node",
  3: "Memory node",
  4: "Memory node",
  5: "Memory node",
  6: "Memory node",
  7: "Memory node"
} as const;

type MemoryEventSpec = {
  id: string;
  title: string;
  kind: NodeKind;
  role: GraphNodeRole;
  level: GraphNodeLevel;
  summary: string;
  npcs: string[];
  interactions: string[];
  memoryAccess?: string;
};

const eventSpecs: MemoryEventSpec[] = [
  {
    id: "rjn-001",
    title: "Present Museum Intro",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Marc opens the museum day and is approached by Jovan and Ruzica.",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Interview opening dialogue"],
    memoryAccess: "Present framing"
  },
  {
    id: "rjt-002",
    title: "Museum Presentation Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Present-day museum visuals advance into the interview acceptance layer.",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Continue input", "Presentation advance"],
    memoryAccess: "Present framing"
  },
  {
    id: "rjs-003",
    title: "Interview Accepted State",
    kind: "state",
    role: "scene-change",
    level: 1,
    summary: "Jovan and Ruzica consent to having their story collected for the Memory Tree.",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Interview acceptance"],
    memoryAccess: "Present framing"
  },
  {
    id: "rjt-004",
    title: "Enter Jovan Memory Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The memory shifts into Jovan's POV.",
    npcs: ["Jovan"],
    interactions: ["Enter memory"]
  },
  {
    id: "rjn-005",
    title: "Jovan Searches for the Letter",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Jovan searches for the hidden letter while Damir questions him.",
    npcs: ["Jovan", "Damir"],
    interactions: ["Dialogue pressure"]
  },
  {
    id: "rjb-006",
    title: "Deflect Damir Branch",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Damir's suspicion creates response variants that still converge.",
    npcs: ["Jovan", "Damir"],
    interactions: ["Deflect", "Reassure", "Converge"]
  },
  {
    id: "rji-007",
    title: "Letter Pieces Revealed",
    kind: "collectable",
    role: "collectable",
    level: 2,
    summary: "The hidden letter pieces become the playable object.",
    npcs: ["Jovan"],
    interactions: ["Reveal shredded letter pieces"]
  },
  {
    id: "rjm-008",
    title: "Letter Puzzle",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "The letter puzzle reconstructs the meeting instructions.",
    npcs: ["Jovan"],
    interactions: ["Drag-and-drop letter puzzle"]
  },
  {
    id: "rjn-009",
    title: "Damir Returns",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Damir returns after the puzzle and understands the situation.",
    npcs: ["Jovan", "Damir"],
    interactions: ["Post-puzzle confrontation"]
  },
  {
    id: "rjs-010",
    title: "Route to Ruzica Established",
    kind: "state",
    role: "scene-change",
    level: 1,
    summary: "Damir reluctantly helps establish a route to Ruzica.",
    npcs: ["Jovan", "Damir"],
    interactions: ["Reluctant agreement dialogue"]
  },
  {
    id: "rjt-011",
    title: "Fade to Ruzica House",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The memory transitions into Ruzica's side of the city.",
    npcs: ["Jovan", "Ruzica"],
    interactions: ["Fade transition"]
  },
  {
    id: "rjn-012",
    title: "Ruzica House Escape Decision",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Jovan enters Ruzica's room and the lovers decide to leave together.",
    npcs: ["Jovan", "Ruzica", "Ruzica's mother (voice)"],
    interactions: ["Escape planning dialogue"]
  },
  {
    id: "rjb-013",
    title: "Escape Response Variants",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Reassure, deflect, and commit variants converge on escape.",
    npcs: ["Jovan", "Ruzica"],
    interactions: ["Reassure", "Deflect", "Commit"]
  },
  {
    id: "rjt-014",
    title: "Window Exit Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Leaving through the window transitions into active sneaking gameplay.",
    npcs: ["Jovan", "Ruzica"],
    interactions: ["Window exit"]
  },
  {
    id: "rjm-015",
    title: "Sneaking Sequence",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "The lovers' escape becomes a stealth and hiding gameplay segment.",
    npcs: ["Jovan / pair", "Sentries"],
    interactions: ["Stealth", "Navigation", "Hiding"]
  },
  {
    id: "rjs-016",
    title: "seenRJMemory State Set",
    kind: "state",
    role: "scene-change",
    level: 1,
    summary: "Sneaking success sets the seenRJMemory state.",
    npcs: ["Jovan", "Ruzica"],
    interactions: ["Memory completion state"]
  },
  {
    id: "rjt-017",
    title: "Return to Museum Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The game transitions back to the museum present.",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Return to present"],
    memoryAccess: "Return to present"
  },
  {
    id: "rjn-018",
    title: "After-Memory Reflection",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Marc's follow-up questions shape the after-memory reflection.",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Ask About Damir", "Ask Where They Went", "Wait"],
    memoryAccess: "Return to present"
  },
  {
    id: "rjb-019",
    title: "Reflection Branch Converges",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "After-memory reflection choices converge before the couple leaves.",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Reflection variants converge"],
    memoryAccess: "Return to present"
  },
  {
    id: "rjt-020",
    title: "Couple Leaves Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Jovan and Ruzica leave the museum.",
    npcs: ["Jovan", "Ruzica"],
    interactions: ["Exit museum"],
    memoryAccess: "Present aftermath"
  },
  {
    id: "rjn-021",
    title: "Marc Prepares the Memory Tree Entry",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Marc prepares the memory-tree entry as the current demo endpoint.",
    npcs: ["Marc"],
    interactions: ["Final reflection", "Current demo endpoint"],
    memoryAccess: "Present aftermath"
  }
];

function makeEventNode(spec: MemoryEventSpec, index: number): GraphNode {
  const row = Math.floor(index / 4);
  const column = index % 4;

  return {
    id: spec.id,
    title: spec.title,
    kind: spec.kind,
    role: spec.role,
    level: spec.level,
    summary: spec.summary,
    detail: `${spec.id} is represented as its own R&J memory event node. This replaces the earlier combined-node view so each event can be edited, connected, and inspected independently.`,
    x: 120 + column * 300,
    y: 80 + row * 190,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: spec.memoryAccess ?? "Memory internal",
    npcs: spec.npcs,
    interactions: spec.interactions,
    bools: [
      ["Dialogue Recorded", spec.role === "dialog"],
      ["Collectable Recorded", spec.kind === "collectable"],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Connects to the next verified R&J event."],
    queryPath: [spec.id]
  };
}

export const rjNodes: GraphNode[] = eventSpecs.map(makeEventNode);

export const rjEdges: GraphEdge[] = eventSpecs.slice(0, -1).map((event, index) => ({
  id: `rje-${index + 1}`,
  from: event.id,
  to: eventSpecs[index + 1].id
}));
