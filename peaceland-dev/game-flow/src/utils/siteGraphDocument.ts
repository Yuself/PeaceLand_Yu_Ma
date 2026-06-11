import type { GraphBoardId, GraphDocument, GraphEdge, GraphNode, SiteGraphDocument } from "../types/graph";

export function cloneNodes<TNode extends GraphNode>(nodes: TNode[]) {
  return nodes.map((node) => ({
    ...node,
    dayOpen: { ...node.dayOpen },
    npcs: [...node.npcs],
    interactions: [...node.interactions],
    bools: node.bools.map(([label, value]) => [label, value] as [string, boolean]),
    unlocks: [...node.unlocks],
    queryPath: [...node.queryPath]
  }));
}

export function cloneEdges(edges: GraphEdge[]) {
  return edges.map((edge) => ({ ...edge }));
}

export function cloneGraphDocument<TNode extends GraphNode>(document: GraphDocument<TNode>): GraphDocument<TNode> {
  return {
    nodes: cloneNodes(document.nodes),
    edges: cloneEdges(document.edges)
  };
}

export function cloneSiteGraphDocument(document: SiteGraphDocument): SiteGraphDocument {
  return {
    present: cloneGraphDocument(document.present),
    floristMemory: cloneGraphDocument(document.floristMemory),
    rjMemory: cloneGraphDocument(document.rjMemory)
  };
}

export function boardIdToSiteKey(boardId: GraphBoardId) {
  switch (boardId) {
    case "present":
      return "present";
    case "florist-memory":
      return "floristMemory";
    case "rj-memory":
      return "rjMemory";
  }
}

export function getBoardDocument(document: SiteGraphDocument, boardId: GraphBoardId): GraphDocument {
  return document[boardIdToSiteKey(boardId)];
}

export function setBoardDocument(document: SiteGraphDocument, boardId: GraphBoardId, nextBoardDocument: GraphDocument): SiteGraphDocument {
  return {
    ...document,
    [boardIdToSiteKey(boardId)]: cloneGraphDocument(nextBoardDocument)
  };
}

export function normalizeSiteGraphDocument(document: SiteGraphDocument) {
  return JSON.stringify(document);
}

export function parseSiteGraphDocument(jsonText: string): SiteGraphDocument {
  const parsed = JSON.parse(jsonText) as Partial<SiteGraphDocument>;
  if (!parsed.present || !parsed.floristMemory || !parsed.rjMemory) {
    throw new Error("Site JSON must include present, floristMemory, and rjMemory.");
  }

  const allBoards = [parsed.present, parsed.floristMemory, parsed.rjMemory];
  if (allBoards.some((board) => !Array.isArray(board.nodes) || !Array.isArray(board.edges))) {
    throw new Error("Each site JSON board must include nodes and edges arrays.");
  }

  return cloneSiteGraphDocument(parsed as SiteGraphDocument);
}

export function updateNodeInDocument<TNode extends GraphNode>(
  document: GraphDocument<TNode>,
  nodeId: string,
  updater: (node: TNode) => TNode
): GraphDocument<TNode> {
  return {
    ...document,
    nodes: document.nodes.map((node) => (node.id === nodeId ? updater(node) : node))
  };
}
