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

export const rjNodes: GraphNode[] = [
  {
    id: "rjn-001",
    title: "Present Museum Intro",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Marc opens the museum day and is approached by Jovan and Ruzica to share their memory.",
    detail:
      "Matches RJN-001. This is the present-day interview framing node before the memory proper begins.",
    x: 320,
    y: 60,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Present framing",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Interview opening dialogue"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Leads into the museum presentation transition layer."],
    queryPath: ["Present R&J intro -> museum framing -> interview accepted"]
  },
  {
    id: "rjt-002-rjs-003",
    title: "Museum Presentation -> Interview Accepted",
    kind: "state",
    role: "scene-change",
    level: 1,
    summary: "The presentation layer resolves and the R&J interview is formally accepted.",
    detail:
      "Combines RJT-002 and RJS-003. Present-day museum visuals advance, then Jovan and Ruzica consent to having their story collected for the Memory Tree.",
    x: 320,
    y: 180,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Present framing",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["Continue input", "Interview acceptance"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Allows entry into the Jovan memory timeline."],
    queryPath: ["Museum presentation -> interview accepted -> enter memory"]
  },
  {
    id: "rjn-005-rjb-006",
    title: "Jovan Searches for the Letter",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Jovan searches for the hidden letter while Damir questions him.",
    detail:
      "Combines RJT-004, RJN-005, and RJB-006. The memory shifts into Jovan's POV, and Damir's suspicion creates response variants that still converge.",
    x: 320,
    y: 320,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Jovan", "Damir"],
    interactions: ["Dialogue pressure", "Deflect Damir's questions"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", false]
    ],
    unlocks: ["Converges into letter reveal and puzzle setup."],
    queryPath: ["Enter Jovan memory -> Damir questions -> letter reveal"]
  },
  {
    id: "rji-007-rjm-008",
    title: "Letter Pieces Revealed -> Letter Puzzle",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "The hidden letter is revealed and reconstructed through the first explicit R&J minigame.",
    detail:
      "Combines RJI-007 and RJM-008. Letter pieces become the playable object and the letter puzzle reconstructs the meeting instructions.",
    x: 320,
    y: 470,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Jovan"],
    interactions: ["Reveal shredded letter pieces", "Drag-and-drop letter puzzle"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Puzzle completion advances into the route agreement beat."],
    queryPath: ["Letter reveal -> letter puzzle -> route information recovered"]
  },
  {
    id: "rjn-009-rjs-010",
    title: "Damir Returns -> Route to Ruzica Established",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Damir returns, understands the situation, and reluctantly helps Jovan establish a route to Ruzica.",
    detail:
      "Combines RJN-009 and RJS-010. The post-puzzle confrontation turns into reluctant support and travel-route unlock.",
    x: 320,
    y: 620,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Jovan", "Damir"],
    interactions: ["Post-puzzle confrontation", "Reluctant agreement dialogue"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Enables fade transition into Ruzica's side of the city."],
    queryPath: ["Letter puzzle complete -> Damir returns -> route established"]
  },
  {
    id: "rjn-012-rjb-013",
    title: "Ruzica House Escape Decision",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "Jovan enters Ruzica's room and the lovers decide to leave together.",
    detail:
      "Combines RJT-011, RJN-012, and RJB-013. Ruzica's mother remains off-screen pressure while response variants still converge on escape.",
    x: 320,
    y: 770,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Jovan", "Ruzica", "Ruzica's mother (voice)"],
    interactions: ["Escape planning dialogue", "Reassure / deflect / commit variants"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", false]
    ],
    unlocks: ["Converges into leaving through the window."],
    queryPath: ["Fade to Ruzica house -> escape decision -> leave through window"]
  },
  {
    id: "rjm-015",
    title: "Sneaking Sequence",
    kind: "minigame",
    role: "minigame",
    level: 2,
    summary: "The lovers' escape becomes an active sneaking gameplay segment.",
    detail:
      "Matches RJT-014 and RJM-015. Supported by SneakManager, SneakPlayer, SneakSentry, HidingPlace, and R&J_Sneak prefabs/scripts.",
    x: 320,
    y: 920,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Memory internal",
    npcs: ["Jovan / pair", "Sentries"],
    interactions: ["Window exit transition", "Stealth / navigation / hiding"],
    bools: [
      ["Dialogue Recorded", false],
      ["Collectable Recorded", false],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Sneaking success advances memory toward completion."],
    queryPath: ["Leave window -> sneaking sequence -> memory completed"]
  },
  {
    id: "rjn-018-rjb-019",
    title: "Return to Museum -> After-Memory Reflection",
    kind: "scene",
    role: "scene-change",
    level: 1,
    summary: "The game returns to the museum present and continues the interview with Damir's fate and later-life reflection.",
    detail:
      "Combines RJS-016, RJT-017, RJN-018, and RJB-019. seenRJMemory is set, the game returns to present, and Marc's follow-up questions shape the order of reflection before converging.",
    x: 320,
    y: 1070,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Return to present",
    npcs: ["Marc", "Jovan", "Ruzica"],
    interactions: ["After-memory interview", "Ask About Damir / Ask Where They Went / Wait"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Converges into the couple leaving the museum."],
    queryPath: ["Sneaking complete -> return to museum -> after-memory reflection"]
  },
  {
    id: "rjn-021",
    title: "Marc Prepares the Memory Tree Entry",
    kind: "trigger",
    role: "scene-interaction",
    level: 3,
    summary: "Marc is left alone and prepares the memory-tree entry as the current demo endpoint.",
    detail:
      "Combines RJT-020 and RJN-021. Jovan and Ruzica leave, and Marc closes the R&J flow by planning to assemble the memory and go home.",
    x: 320,
    y: 1220,
    confirmed: true,
    dayOpen: allDays,
    memoryAccess: "Present aftermath",
    npcs: ["Marc"],
    interactions: ["Final reflection", "Current demo endpoint"],
    bools: [
      ["Dialogue Recorded", true],
      ["Collectable Recorded", true],
      ["Stat Impact Possible", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Routes back into present progression after the R&J memory line."],
    queryPath: ["After-memory reflection -> couple leaves -> Marc prepares entry"]
  }
];

export const rjEdges: GraphEdge[] = [
  { id: "rje-1", from: "rjn-001", to: "rjt-002-rjs-003" },
  { id: "rje-2", from: "rjt-002-rjs-003", to: "rjn-005-rjb-006" },
  { id: "rje-3", from: "rjn-005-rjb-006", to: "rji-007-rjm-008" },
  { id: "rje-4", from: "rji-007-rjm-008", to: "rjn-009-rjs-010" },
  { id: "rje-5", from: "rjn-009-rjs-010", to: "rjn-012-rjb-013" },
  { id: "rje-6", from: "rjn-012-rjb-013", to: "rjm-015" },
  { id: "rje-7", from: "rjm-015", to: "rjn-018-rjb-019" },
  { id: "rje-8", from: "rjn-018-rjb-019", to: "rjn-021" }
];
