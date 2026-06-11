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
    id: "fln-001",
    title: "Vandalized Flower Shop Morning",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Mira discovers vandalism at the shop before the customer loop begins.",
    npcs: ["Mira"],
    interactions: ["Opening monologue", "Shop-damage inspection setup"]
  },
  {
    id: "fli-002",
    title: "Exterior and Entry Interactions",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Serialized interaction path through shop_front, door_front, and shop_inside.",
    npcs: ["Mira"],
    interactions: ["shop_front", "door_front", "shop_inside"]
  },
  {
    id: "fls-004",
    title: "Florist Order Loop Starts",
    kind: "state",
    role: "scene-change",
    level: 1,
    summary: "FlowerShopManager begins stepping through the live serialized minigame list.",
    npcs: ["Mira"],
    interactions: ["Runtime state change only"]
  },
  {
    id: "flt-005",
    title: "Andrej NextOrder Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The first live NextOrder resolves to Andrej.",
    npcs: ["Mira", "Andrej"],
    interactions: ["NextOrder", "Customer enters"]
  },
  {
    id: "fln-006",
    title: "Andrej Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Andrej opens the first full florist customer dialogue.",
    npcs: ["Mira", "Andrej"],
    interactions: ["Customer dialogue"]
  },
  {
    id: "flm-007",
    title: "Andrej Bouquet Minigame",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "Andrej order uses Dethorn, Trimming, and Arrange for a two-flower bouquet.",
    npcs: ["Mira", "Andrej"],
    interactions: ["Dethorn", "Trimming", "Arrange"]
  },
  {
    id: "fln-008",
    title: "Andrej Completion Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Andrej's order completes and returns control to the customer loop.",
    npcs: ["Mira", "Andrej"],
    interactions: ["OrderComplete dialogue"]
  },
  {
    id: "flt-009",
    title: "Danika NextOrder Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The second customer slot advances to Danika.",
    npcs: ["Mira", "Danika"],
    interactions: ["NextOrder", "Customer enters"]
  },
  {
    id: "fln-010",
    title: "Danika Memorial Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Danika opens the teacher memorial order with TeacherStart dialogue.",
    npcs: ["Mira", "Danika"],
    interactions: ["TeacherStart dialogue"]
  },
  {
    id: "flm-011",
    title: "Danika Bouquet Minigame",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "Danika order uses Dethorn, Trimming, and Arrange for a three-flower bouquet.",
    npcs: ["Mira", "Danika"],
    interactions: ["Dethorn", "Trimming", "Arrange"]
  },
  {
    id: "fln-012",
    title: "Danika Completion Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "TeacherEnding closes Danika's memorial order.",
    npcs: ["Mira", "Danika"],
    interactions: ["TeacherEnding dialogue"]
  },
  {
    id: "flt-013",
    title: "Boris Slot Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Order3 advances into the Boris and Danika confrontation slot.",
    npcs: ["Mira", "Boris", "Danika"],
    interactions: ["NextOrder", "Confrontation setup"]
  },
  {
    id: "fln-014",
    title: "Boris Confrontation",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "BorisStart confrontation dialogue escalates the florist route.",
    npcs: ["Mira", "Boris", "Danika"],
    interactions: ["Confrontation dialogue"]
  },
  {
    id: "flt-015",
    title: "Jeta Slot Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Order4 advances into Jeta's support conversation slot.",
    npcs: ["Mira", "Jeta"],
    interactions: ["NextOrder", "Support setup"]
  },
  {
    id: "fln-016",
    title: "Jeta Support Conversation",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "CloseFriendStart functions as a support beat rather than flower labor.",
    npcs: ["Mira", "Jeta"],
    interactions: ["Support dialogue"]
  },
  {
    id: "flt-017",
    title: "Lukas Slot Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The last normal customer slot advances to Lukas.",
    npcs: ["Mira", "Lukas"],
    interactions: ["NextOrder", "Customer enters"]
  },
  {
    id: "fln-018",
    title: "Lukas Child Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "ChildStart opens Lukas's customer scene.",
    npcs: ["Mira", "Lukas"],
    interactions: ["ChildStart dialogue"]
  },
  {
    id: "flm-019",
    title: "Lukas Bouquet Minigame",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "Lukas order uses the final normal bouquet-processing minigame block.",
    npcs: ["Mira", "Lukas"],
    interactions: ["Dethorn", "Trimming", "Arrange"]
  },
  {
    id: "fln-020",
    title: "Lukas Completion Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "ChildOrderComplete closes the last normal customer structure.",
    npcs: ["Mira", "Lukas"],
    interactions: ["ChildOrderComplete dialogue"]
  },
  {
    id: "flt-021",
    title: "EndOrder1 Transition",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The florist route breaks from customer-service rhythm into EndOrder1.",
    npcs: ["Mira"],
    interactions: ["EndOrder1 transition"]
  },
  {
    id: "fln-022",
    title: "Endgame Opening Monologue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "EndStart monologue begins the grief escalation.",
    npcs: ["Mira"],
    interactions: ["EndStart monologue"]
  },
  {
    id: "flm-023",
    title: "Thorn Removal Sequence",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "Dethorn / Thorn1 / Thorn2 / Thorn3 repeat under stress.",
    npcs: ["Mira"],
    interactions: ["Dethorn", "Thorn1", "Thorn2", "Thorn3"]
  },
  {
    id: "fln-024",
    title: "Stem Escalation Dialogue",
    kind: "dialog",
    role: "dialog",
    level: 2,
    summary: "Stem1-4 dialogue escalation drives the final breakdown sequence.",
    npcs: ["Mira"],
    interactions: ["Stem1", "Stem2", "Stem3", "Stem4"]
  },
  {
    id: "flm-025",
    title: "Final Arrangement Minigame",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "EndOrderFinal resolves through a final Arrange block.",
    npcs: ["Mira"],
    interactions: ["Final Arrange"]
  },
  {
    id: "flt-026",
    title: "FlowerEnd Collapse Endpoint",
    kind: "interaction-trigger",
    role: "scene-interaction",
    level: 3,
    summary: "FlowerEnd collapses the memory back toward present consequence.",
    npcs: ["Mira"],
    interactions: ["Collapse endpoint"],
    memoryAccess: "Return to present"
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
    detail: `${spec.id} is represented as its own memory event node. This replaces the earlier combined-node view so each Florist event can be edited, connected, and inspected independently.`,
    x: 120 + column * 300,
    y: 80 + row * 190,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: spec.memoryAccess ?? "Memory internal",
    npcs: spec.npcs,
    interactions: spec.interactions,
    bools: [
      ["Dialogue Recorded", spec.role === "dialog"],
      ["Collectable Recorded", spec.role === "minigame"],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Connects to the next verified Florist event."],
    queryPath: [spec.id]
  };
}

export const floristNodes: GraphNode[] = eventSpecs.map(makeEventNode);

export const floristEdges: GraphEdge[] = eventSpecs.slice(0, -1).map((event, index) => ({
  id: `fe-${index + 1}`,
  from: event.id,
  to: eventSpecs[index + 1].id
}));
