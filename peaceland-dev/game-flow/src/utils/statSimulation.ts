import type { GraphBoardId, GraphNode, SiteGraphDocument } from "../types/graph";
import type {
  ImpactCandidate,
  NewspaperBlock,
  NewspaperProfile,
  SimulatedNodeImpact,
  SimulationFlagDefinition,
  SimulationFlags,
  StatContribution,
  StatDefinition,
  StatDeltaMap,
  StatId,
  StatSimulationState,
  StatSummary
} from "../types/statSimulation";

export const STAT_DEFINITIONS: StatDefinition[] = [
  {
    id: "selfishAltruistic",
    label: "Selfish / Altruistic",
    shortLabel: "S/A",
    negativeLabel: "Selfish",
    positiveLabel: "Altruistic",
    min: -5,
    max: 5
  },
  {
    id: "insightNaivety",
    label: "Insight / Naivety",
    shortLabel: "I/N",
    negativeLabel: "Naivety",
    positiveLabel: "Insight",
    min: -5,
    max: 5
  },
  {
    id: "nationalismRebellion",
    label: "Nationalism / Rebellion-Apathy",
    shortLabel: "N/RA",
    negativeLabel: "Nationalism",
    positiveLabel: "Rebellion / Apathy",
    min: -5,
    max: 5
  },
  {
    id: "kindnessCruelty",
    label: "Kindness / Cruelty",
    shortLabel: "K/C",
    negativeLabel: "Cruelty",
    positiveLabel: "Kindness",
    min: -5,
    max: 5
  }
];

export const SIMULATION_FLAG_DEFINITIONS: SimulationFlagDefinition[] = [
  {
    id: "floristFeatured",
    label: "Florist Front-Page Feature",
    description: "Keep the florist route visible as a major newspaper story block."
  },
  {
    id: "memorialSeen",
    label: "Memorial Clue Seen",
    description: "Unlock remembrance and museum-context coverage."
  },
  {
    id: "borisConfrontationPublic",
    label: "Boris Confrontation Public",
    description: "Escalate political tension into visible front-page coverage."
  },
  {
    id: "museumInterviewPublished",
    label: "Museum Interview Published",
    description: "Treat the museum framing as a published article rather than a private archive."
  }
];

const DEFAULT_FLAGS: SimulationFlags = {
  floristFeatured: true,
  memorialSeen: true,
  borisConfrontationPublic: false,
  museumInterviewPublished: true
};

const PRESET_IMPACTS: Partial<Record<string, { deltas: Partial<StatDeltaMap>; enabled?: boolean }>> = {
  "fln-010": {
    enabled: true,
    deltas: {
      insightNaivety: 1,
      kindnessCruelty: 2
    }
  },
  "fln-014": {
    enabled: true,
    deltas: {
      nationalismRebellion: 2,
      kindnessCruelty: -1
    }
  },
  "fln-016": {
    enabled: true,
    deltas: {
      selfishAltruistic: 1,
      kindnessCruelty: 1
    }
  },
  "rjn-012": {
    enabled: true,
    deltas: {
      selfishAltruistic: 1,
      nationalismRebellion: 2
    }
  },
  "rjn-018": {
    enabled: true,
    deltas: {
      insightNaivety: 2
    }
  },
  "rjn-021": {
    enabled: true,
    deltas: {
      insightNaivety: 1,
      kindnessCruelty: 1
    }
  }
};

const BOARD_LABELS: Record<GraphBoardId, string> = {
  present: "Present Map",
  "florist-memory": "Florist Memory",
  "rj-memory": "R&J Memory"
};

function createEmptyDeltaMap(): StatDeltaMap {
  return {
    selfishAltruistic: 0,
    insightNaivety: 0,
    nationalismRebellion: 0,
    kindnessCruelty: 0
  };
}

function isImpactCandidate(node: GraphNode) {
  return node.kind === "dialog" || node.kind === "interaction-trigger" || node.kind === "state" || node.kind === "minigame";
}

function buildImpactFromCandidate(candidate: ImpactCandidate, previous?: SimulatedNodeImpact): SimulatedNodeImpact {
  const preset = PRESET_IMPACTS[candidate.node.id];

  if (previous) {
    return {
      ...previous,
      boardId: candidate.boardId,
      sourceKind: candidate.node.kind,
      sourceSummary: candidate.node.summary,
      sourceTitle: candidate.node.title
    };
  }

  const deltas = createEmptyDeltaMap();
  if (preset?.deltas) {
    for (const [statId, value] of Object.entries(preset.deltas) as Array<[StatId, number]>) {
      deltas[statId] = value;
    }
  }

  return {
    boardId: candidate.boardId,
    deltas,
    enabled: Boolean(preset?.enabled),
    sourceKind: candidate.node.kind,
    sourceNodeId: candidate.node.id,
    sourceSummary: candidate.node.summary,
    sourceTitle: candidate.node.title
  };
}

export function getBoardLabel(boardId: GraphBoardId) {
  return BOARD_LABELS[boardId];
}

export function getImpactCandidates(document: SiteGraphDocument): ImpactCandidate[] {
  const boards: GraphBoardId[] = ["present", "florist-memory", "rj-memory"];
  return boards.flatMap((boardId) => {
    const board =
      boardId === "present" ? document.present : boardId === "florist-memory" ? document.floristMemory : document.rjMemory;
    return board.nodes.filter(isImpactCandidate).map((node) => ({ boardId, node }));
  });
}

export function buildSimulationState(document: SiteGraphDocument, previous?: StatSimulationState): StatSimulationState {
  const previousImpactMap = new Map(previous?.impacts.map((impact) => [impact.sourceNodeId, impact]) ?? []);
  const impacts = getImpactCandidates(document).map((candidate) => buildImpactFromCandidate(candidate, previousImpactMap.get(candidate.node.id)));

  return {
    flags: {
      ...DEFAULT_FLAGS,
      ...previous?.flags
    },
    impacts
  };
}

export function computeStatSummaries(impacts: SimulatedNodeImpact[]): StatSummary[] {
  return STAT_DEFINITIONS.map((definition) => {
    const contributions = impacts.reduce<StatContribution[]>((items, impact) => {
      if (!impact.enabled) {
        return items;
      }

      const delta = impact.deltas[definition.id];
      if (!delta) {
        return items;
      }

      items.push({
        boardId: impact.boardId,
        delta,
        sourceNodeId: impact.sourceNodeId,
        sourceTitle: impact.sourceTitle
      });
      return items;
    }, []);

    return {
      contributions,
      definition,
      total: contributions.reduce((sum, item) => sum + item.delta, 0)
    };
  });
}

export function clampStatValue(value: number, definition: StatDefinition) {
  return Math.min(definition.max, Math.max(definition.min, value));
}

function formatLeadSummary(statSummaries: StatSummary[]) {
  const strongest = [...statSummaries].sort((first, second) => Math.abs(second.total) - Math.abs(first.total))[0];
  if (!strongest || strongest.total === 0) {
    return "Balanced prototype run with no dominant hidden-stat lean selected yet.";
  }

  return `Lead tone is currently pushed by ${strongest.definition.label} with a total of ${strongest.total > 0 ? "+" : ""}${strongest.total}.`;
}

function buildLeadStory(statSummaries: StatSummary[], floristCount: number): NewspaperBlock {
  const strongest = [...statSummaries].sort((first, second) => Math.abs(second.total) - Math.abs(first.total))[0];
  const title =
    strongest && strongest.total !== 0
      ? `${strongest.definition.positiveLabel} Shapes the Week's Public Memory`
      : "Town Narrative Holds in Delicate Balance";

  return {
    id: "lead-story",
    type: "lead",
    title,
    subtitle:
      floristCount > 0
        ? "Florist remains the cleanest first test for a major ending article."
        : "No single route is dominating the edition yet; the layout remains a controlled prototype.",
    byline: "By The Peaceland Chronicle Desk",
    body: [
      strongest && strongest.total !== 0
        ? `The prototype currently leans toward ${strongest.definition.positiveLabel.toLowerCase()} over ${strongest.definition.negativeLabel.toLowerCase()}, based on the enabled source nodes and their manually edited stat deltas.`
        : "This front page is still using a neutral run. Enable or edit more source nodes in the Stats page to push the paper toward a more opinionated edition.",
      floristCount > 0
        ? "Because the florist route is public-facing, it naturally reads well as a newspaper feature. That makes it a practical anchor while the broader ending system is still being prototyped."
        : "Without a strong florist contribution, the page reads more like a town ledger than a human-interest front page."
    ],
    columnSpan: 8,
    rowSpan: 7,
    kicker: "Front Page Analysis"
  };
}

function buildFloristBlock(floristCount: number, kindnessTotal: number, floristFeatured: boolean): NewspaperBlock {
  const visible = floristFeatured || floristCount > 0;
  return {
    id: "florist-feature",
    type: "article",
    title: visible ? "Flower Shop Reopens Under Uneasy but Hopeful Light" : "Flower Shop Holds Quiet in the Background",
    subtitle: visible ? "A local workplace remains one of the most legible windows into the town's emotional state." : undefined,
    byline: "Mira Street Correspondent",
    body: visible
      ? [
          kindnessTotal >= 0
            ? "The current prototype weights make this coverage read gentler, emphasizing care, endurance, and the awkward ways people keep showing up for one another."
            : "The current prototype weights make this coverage harsher. Labor stays visible, but comfort gives way to strain and the article reads colder.",
          "This block is intended to become a reusable ending module rather than a one-off mock article."
        ]
      : [
          "The florist route is currently too quiet to claim a major front-page block, but the placeholder remains so the page can preserve a believable editorial structure."
        ],
    columnSpan: 4,
    rowSpan: 7,
    kicker: "Local Feature"
  };
}

function buildMuseumBlock(flags: SimulationFlags, insightTotal: number): NewspaperBlock {
  return {
    id: "museum-column",
    type: "sidebar",
    title: flags.museumInterviewPublished ? "Museum Interview Archived for Public Reading" : "Museum Interview Held for Internal Review",
    byline: "Archive Notes",
    body: [
      flags.memorialSeen
        ? "The memorial clue remains part of the paper's framing, which gives the issue a stronger sense of witness and continuity."
        : "Without the memorial clue toggle, the museum framing loses some of its emotional anchor and reads more like procedure.",
      insightTotal > 0
        ? "Higher insight totals currently push this column toward explanation and reflection."
        : "Lower insight totals keep this column flatter and more report-like."
    ],
    columnSpan: 3,
    rowSpan: 5,
    kicker: "Museum Desk"
  };
}

function buildConflictBlock(flags: SimulationFlags, rebellionTotal: number): NewspaperBlock {
  return {
    id: "conflict-brief",
    type: "brief",
    title: flags.borisConfrontationPublic || rebellionTotal > 0 ? "Street Dispute Echoes Beyond Private Rooms" : "Political Tension Stays Beneath the Printed Surface",
    body: [
      flags.borisConfrontationPublic || rebellionTotal > 0
        ? "Current simulation values suggest that confrontation is no longer containable as a purely private memory beat, so the newspaper escalates it into civic language."
        : "This issue keeps confrontation implied rather than explicit, leaving more room for a softer edition."
    ],
    columnSpan: 3,
    rowSpan: 4,
    kicker: "Public Tension"
  };
}

function buildNoticeBlock(activeImpactCount: number): NewspaperBlock {
  return {
    id: "notice-column",
    type: "notice",
    title: "Edition Notes",
    body: [
      `${activeImpactCount} simulated source nodes are currently enabled in the stat prototype.`,
      "This newspaper page is block-based on purpose: each story footprint is a reusable ending module rather than fixed one-off HTML."
    ],
    columnSpan: 3,
    rowSpan: 4,
    kicker: "Workbench"
  };
}

function buildQuoteBlock(kindnessTotal: number): NewspaperBlock {
  return {
    id: "quote-block",
    type: "quote",
    title: "From the Town Notebook",
    body: [
      kindnessTotal >= 0
        ? "\"People kept showing up for one another, even when the shape of that care was awkward.\""
        : "\"The town remembered the injury before it remembered how to comfort it.\""
    ],
    columnSpan: 6,
    rowSpan: 3,
    kicker: "Selected Line"
  };
}

function buildClosingBlock(statSummaries: StatSummary[]): NewspaperBlock {
  const summaryBits = statSummaries
    .filter((summary) => summary.total !== 0)
    .slice(0, 3)
    .map((summary) => `${summary.definition.shortLabel} ${summary.total > 0 ? "+" : ""}${summary.total}`);

  return {
    id: "closing-brief",
    type: "brief",
    title: "Stat Ledger",
    body: [
      summaryBits.length > 0 ? summaryBits.join(" | ") : "No non-zero stat totals yet.",
      "Use the Stats page to toggle source nodes on or off, or edit any dialog node's numeric impact directly."
    ],
    columnSpan: 6,
    rowSpan: 3,
    kicker: "Debug Readout"
  };
}

export function composeNewspaperProfile(simulationState: StatSimulationState, statSummaries: StatSummary[]): NewspaperProfile {
  const floristCount = simulationState.impacts.filter((impact) => impact.enabled && impact.boardId === "florist-memory").length;
  const activeImpactCount = simulationState.impacts.filter((impact) => impact.enabled).length;
  const kindnessTotal = statSummaries.find((summary) => summary.definition.id === "kindnessCruelty")?.total ?? 0;
  const insightTotal = statSummaries.find((summary) => summary.definition.id === "insightNaivety")?.total ?? 0;
  const rebellionTotal = statSummaries.find((summary) => summary.definition.id === "nationalismRebellion")?.total ?? 0;

  return {
    blocks: [
      buildLeadStory(statSummaries, floristCount),
      buildFloristBlock(floristCount, kindnessTotal, simulationState.flags.floristFeatured),
      buildMuseumBlock(simulationState.flags, insightTotal),
      buildConflictBlock(simulationState.flags, rebellionTotal),
      buildNoticeBlock(activeImpactCount),
      buildQuoteBlock(kindnessTotal),
      buildClosingBlock(statSummaries)
    ],
    editionLabel: activeImpactCount > 0 ? "Prototype Ending Edition" : "Neutral Test Edition",
    leadSummary: formatLeadSummary(statSummaries),
    mastheadDate: "June 10, 2026",
    submasthead: "A fake newspaper front page for ending composition, driven by simulated stat totals.",
    usedFlags: SIMULATION_FLAG_DEFINITIONS.map((definition) => ({
      enabled: simulationState.flags[definition.id],
      id: definition.id,
      label: definition.label
    }))
  };
}
