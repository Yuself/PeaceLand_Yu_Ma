export type NodeKind = "location" | "memory-entry" | "npc-gate" | "state" | "scene" | "trigger";

export interface GraphNode {
  id: string;
  title: string;
  kind: NodeKind;
  summary: string;
  detail: string;
  x: number;
  y: number;
  confirmed: boolean;
  dayOpen: Record<number, string>;
  memoryAccess: string;
  npcs: string[];
  interactions: string[];
  bools: Array<[string, boolean]>;
  unlocks: string[];
  queryPath: string[];
  enterButton?: boolean;
}

export type PresentCluster = "hub" | "town" | "museum" | "artifact" | "war" | "state";
export type PresentEmphasis = "major" | "minor";

export interface PresentNode extends GraphNode {
  cluster: PresentCluster;
  emphasis: PresentEmphasis;
  parentId?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
}

export interface OverallState {
  currentDay: number;
  memoriesEntered: number;
  presentNodesVisited: number;
  dialogueChoicesRecorded: number;
  collectablesRecorded: number;
  notebookEntriesProgressed: number;
  statAffected: boolean;
  endingReady: boolean;
}
