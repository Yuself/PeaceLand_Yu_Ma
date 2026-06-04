import type { GraphEdge, GraphNode } from "../types/graph";

const allDays = {
  1: "Memory node",
  2: "Memory node",
  3: "Memory node",
  4: "Memory node",
  5: "Memory node",
  6: "Memory node",
  7: "Memory node"
} as const;

export const floristNodes: GraphNode[] = [
  {
    id: "fln-001",
    title: "Vandalized Flower Shop Morning",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Mira discovers vandalism at the shop before the customer loop begins.",
    detail:
      "Matches FLN-001 in the verified florist draft. This is the grief, memorial, and anti-Thebrean framing node before any live order slot opens.",
    x: 320,
    y: 60,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira"],
    interactions: ["Opening monologue", "Shop-damage inspection setup"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Leads into the interaction-only entry scene before the main florist loop."],
    queryPath: ["Present -> Florist entry -> vandalized shop intro"]
  },
  {
    id: "fli-002",
    title: "Exterior and Entry Interactions",
    kind: "trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Serialized interaction path through shop_front, door_front, and shop_inside.",
    detail:
      "Matches FLI-002. The current branch uses a smaller interaction-only scene before the full florist runtime scene loads.",
    x: 320,
    y: 180,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira"],
    interactions: ["shop_front -> door_front -> shop_inside"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Completing entry interactions transitions into FlowerMemoryScene."],
    queryPath: ["Florist intro -> entry interactions -> main florist scene"]
  },
  {
    id: "fls-004",
    title: "Florist Order Loop Starts",
    kind: "state",
    role: "scene-change",
    level: 1,
    summary: "FlowerShopManager begins stepping through the live serialized minigame list.",
    detail:
      "Matches FLS-004. currentOrder and currentMinigame begin at -1, then the first NextOrder resolves to Andrej.",
    x: 320,
    y: 300,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira"],
    interactions: ["Runtime state change only"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["This state begins the verified playable florist loop."],
    queryPath: ["Entry complete -> florist loop starts -> first live order"]
  },
  {
    id: "flt-005-flm-007",
    title: "Andrej Arc",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Andrej arrives, opens the first full florist arc, and completes bouquet work.",
    detail:
      "Combines FLT-005, FLN-006, FLM-007, and FLN-008. Verified sequence: NextOrder transition -> Andrej dialogue -> Dethorn -> Trimming -> Arrange -> OrderComplete.",
    x: 320,
    y: 430,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira", "Andrej"],
    interactions: ["Customer dialogue", "Dethorn", "Trimming", "Arrange", "Completion dialogue"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Full bouquet-processing arc with 2 flowers in Order1."],
    queryPath: ["Florist loop -> Andrej arrives -> bouquet work -> Andrej completion"]
  },
  {
    id: "flt-009-flm-011",
    title: "Danika Arc",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Danika's memorial order is the second full verified bouquet arc.",
    detail:
      "Combines FLT-009, FLN-010, FLM-011, and FLN-012. Verified sequence: Danika arrives -> TeacherStart dialogue -> Dethorn -> Trimming -> Arrange -> TeacherEnding.",
    x: 320,
    y: 560,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira", "Danika"],
    interactions: ["Teacher memorial dialogue", "Dethorn", "Trimming", "Arrange", "Completion dialogue"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Full bouquet-processing arc with 3 flowers in Order2."],
    queryPath: ["Andrej complete -> Danika arrives -> bouquet work -> Danika completion"]
  },
  {
    id: "fln-014",
    title: "Boris Confrontation",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Boris is a dialogue-only confrontation slot, not a bouquet-processing arc.",
    detail:
      "Matches FLT-013 and FLN-014. Order3 Boris and Danika advances into a confrontation dialogue minigame with startNode BorisStart.",
    x: 320,
    y: 690,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira", "Boris", "Danika"],
    interactions: ["Confrontation dialogue only"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Shifts florist from labor loop to open hostility."],
    queryPath: ["Danika complete -> Boris slot -> confrontation dialogue"]
  },
  {
    id: "fln-016",
    title: "Jeta Support Conversation",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Jeta is a dialogue-only support scene without a bouquet block.",
    detail:
      "Matches FLT-015 and FLN-016. Order4 Jeta advances into CloseFriendStart and functions as a support beat rather than flower labor.",
    x: 320,
    y: 820,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira", "Jeta"],
    interactions: ["Support dialogue only"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Moves route from conflict into grief support."],
    queryPath: ["Boris complete -> Jeta slot -> support conversation"]
  },
  {
    id: "flt-017-flm-019",
    title: "Lukas Arc",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Lukas is the last full customer arc before the florist breakdown section.",
    detail:
      "Combines FLT-017, FLN-018, FLM-019, and FLN-020. Verified sequence: Lukas arrives -> ChildStart -> Dethorn -> Trimming -> Arrange -> ChildOrderComplete.",
    x: 320,
    y: 950,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira", "Lukas"],
    interactions: ["Child dialogue", "Dethorn", "Trimming", "Arrange", "Completion dialogue"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Last normal customer structure before EndOrder1 begins."],
    queryPath: ["Jeta complete -> Lukas arrives -> bouquet work -> Lukas completion"]
  },
  {
    id: "fln-022-flm-023",
    title: "Endgame Opening + Thorn Sequence",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "The florist route breaks from customer-service rhythm into repeated thorn-removal escalation.",
    detail:
      "Combines FLT-021, FLN-022, and FLM-023. Verified sequence: EndOrder1 opens -> EndStart monologue -> Dethorn/Thorn1/2/3 loop.",
    x: 320,
    y: 1080,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Mira"],
    interactions: ["EndStart monologue", "Repeated thorn removal under stress"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["The normal order loop is now broken and grief escalation has begun."],
    queryPath: ["Lukas complete -> EndOrder1 -> thorn sequence"]
  },
  {
    id: "fln-024-flt-026",
    title: "Stem Escalation -> Final Breakdown Endpoint",
    kind: "trigger",
    role: "scene-interaction",
    level: 3,
    summary: "The route advances through Stem1-4, final arrangement, and ends in FlowerEnd collapse.",
    detail:
      "Combines FLN-024, FLM-025, and FLT-026. Verified sequence: Stem1-4 with Yarn-driven nextOrder advancement -> final Arrange on EndOrderFinal -> FlowerEnd collapse endpoint.",
    x: 320,
    y: 1210,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Return to present",
    npcs: ["Mira"],
    interactions: ["Stem dialogue escalation", "Repeated trimming", "Final arrangement", "Collapse endpoint"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Routes back into the present as a collapse-oriented memory outcome."],
    queryPath: ["Thorn sequence -> Stem1-4 -> Final Arrange -> FlowerEnd -> present consequence"]
  }
];

export const floristEdges: GraphEdge[] = [
  { id: "fe-1", from: "fln-001", to: "fli-002" },
  { id: "fe-2", from: "fli-002", to: "fls-004" },
  { id: "fe-3", from: "fls-004", to: "flt-005-flm-007" },
  { id: "fe-4", from: "flt-005-flm-007", to: "flt-009-flm-011" },
  { id: "fe-5", from: "flt-009-flm-011", to: "fln-014" },
  { id: "fe-6", from: "fln-014", to: "fln-016" },
  { id: "fe-7", from: "fln-016", to: "flt-017-flm-019" },
  { id: "fe-8", from: "flt-017-flm-019", to: "fln-022-flm-023" },
  { id: "fe-9", from: "fln-022-flm-023", to: "fln-024-flt-026" }
];
