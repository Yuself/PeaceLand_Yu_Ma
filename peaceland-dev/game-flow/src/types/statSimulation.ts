import type { GraphBoardId, GraphNode, NodeKind, SiteGraphDocument } from "./graph";

export type StatId =
  | "selfishAltruistic"
  | "insightNaivety"
  | "nationalismRebellion"
  | "kindnessCruelty";

export interface StatDefinition {
  id: StatId;
  label: string;
  shortLabel: string;
  negativeLabel: string;
  positiveLabel: string;
  min: number;
  max: number;
}

export type StatDeltaMap = Record<StatId, number>;

export interface SimulatedNodeImpact {
  sourceNodeId: string;
  boardId: GraphBoardId;
  sourceKind: NodeKind;
  sourceSummary: string;
  sourceTitle: string;
  enabled: boolean;
  deltas: StatDeltaMap;
}

export type SimulationFlagId =
  | "floristFeatured"
  | "memorialSeen"
  | "borisConfrontationPublic"
  | "museumInterviewPublished";

export interface SimulationFlagDefinition {
  id: SimulationFlagId;
  label: string;
  description: string;
}

export type SimulationFlags = Record<SimulationFlagId, boolean>;

export interface StatContribution {
  boardId: GraphBoardId;
  delta: number;
  sourceNodeId: string;
  sourceTitle: string;
}

export interface StatSummary {
  definition: StatDefinition;
  total: number;
  contributions: StatContribution[];
}

export interface StatSimulationState {
  flags: SimulationFlags;
  impacts: SimulatedNodeImpact[];
}

export interface ImpactCandidate {
  boardId: GraphBoardId;
  node: GraphNode;
}

export interface NewspaperBlock {
  id: string;
  type: "lead" | "article" | "sidebar" | "brief" | "notice" | "quote";
  title: string;
  subtitle?: string;
  byline?: string;
  body: string[];
  columnSpan: number;
  rowSpan: number;
  kicker?: string;
}

export interface NewspaperProfile {
  blocks: NewspaperBlock[];
  editionLabel: string;
  leadSummary: string;
  mastheadDate: string;
  submasthead: string;
  usedFlags: Array<{ id: SimulationFlagId; label: string; enabled: boolean }>;
}

export interface UseStatSimulationResult {
  impactCandidates: ImpactCandidate[];
  resetSimulation: () => void;
  simulationState: StatSimulationState;
  siteDocument: SiteGraphDocument;
  statSummaries: StatSummary[];
  updateFlag: (flagId: SimulationFlagId, enabled: boolean) => void;
  updateImpact: (sourceNodeId: string, updater: (impact: SimulatedNodeImpact) => SimulatedNodeImpact) => void;
}
