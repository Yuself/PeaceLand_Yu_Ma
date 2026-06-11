import collectablePlaceholder from "../assets/collectable-placeholder.svg";
import type { GraphBoardId, GraphDocument, GraphNode, SiteGraphDocument } from "../types/graph";
import { getBoardDocument, setBoardDocument } from "./siteGraphDocument";

export type MemoryFilterValue = "all" | GraphBoardId;

export const MEMORY_FILTER_OPTIONS: Array<{ value: MemoryFilterValue; label: string }> = [
  { value: "all", label: "All Sections" },
  { value: "present", label: "Present Map" },
  { value: "florist-memory", label: "Florist Memory" },
  { value: "rj-memory", label: "R&J Memory" }
];

export const MEMORY_SECTION_BOARD_IDS: GraphBoardId[] = ["present", "florist-memory", "rj-memory"];

export type CollectableIndexEntry = {
  attachedToId: string | null;
  attachedToTitle: string | null;
  boardId: GraphBoardId;
  boardLabel: string;
  node: GraphNode;
};

export type CreateCollectableInput = {
  attachToId: string;
  boardId: GraphBoardId;
  detail: string;
  summary: string;
  title: string;
};

export function getBoardLabel(boardId: GraphBoardId) {
  switch (boardId) {
    case "present":
      return "Present Map";
    case "florist-memory":
      return "Florist Memory";
    case "rj-memory":
      return "R&J Memory";
  }
}

function resolveCollectableAttachment(document: GraphDocument, node: GraphNode) {
  const explicitParentId = "parentId" in node && typeof node.parentId === "string" ? node.parentId : null;
  const incomingParentId = document.edges.find((edge) => edge.to === node.id)?.from ?? null;
  const attachedToId = explicitParentId ?? incomingParentId;
  const attachedToTitle = attachedToId ? document.nodes.find((candidate) => candidate.id === attachedToId)?.title ?? attachedToId : null;

  return {
    attachedToId,
    attachedToTitle
  };
}

export function getCollectableImageSrc(node: GraphNode) {
  const imageSrc = node.imageSrc?.trim();
  return imageSrc ? imageSrc : collectablePlaceholder;
}

export function getCollectableImageAlt(node: GraphNode) {
  return node.imageAlt?.trim() || node.title;
}

export function groupCollectablesByBoard(collectables: CollectableIndexEntry[]) {
  return MEMORY_SECTION_BOARD_IDS.map((boardId) => ({
    boardId,
    boardLabel: getBoardLabel(boardId),
    entries: collectables.filter((entry) => entry.boardId === boardId)
  }));
}

export function filterCollectablesByMemory(collectables: CollectableIndexEntry[], memoryFilter: MemoryFilterValue) {
  if (memoryFilter === "all") {
    return collectables;
  }

  return collectables.filter((entry) => entry.boardId === memoryFilter);
}

export function buildCollectableIndex(siteDocument: SiteGraphDocument): CollectableIndexEntry[] {
  const boardIds: GraphBoardId[] = ["present", "florist-memory", "rj-memory"];

  return boardIds
    .flatMap((boardId) => {
      const document = getBoardDocument(siteDocument, boardId);

      return document.nodes
        .filter((node) => node.kind === "collectable")
        .map((node) => ({
          boardId,
          boardLabel: getBoardLabel(boardId),
          node,
          ...resolveCollectableAttachment(document, node)
        }));
    })
    .sort((first, second) => first.node.title.localeCompare(second.node.title));
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "collectable";
}

export function createCollectableInSiteDocument(
  siteDocument: SiteGraphDocument,
  { attachToId, boardId, detail, summary, title }: CreateCollectableInput
) {
  const document = getBoardDocument(siteDocument, boardId);
  const parentNode = document.nodes.find((node) => node.id === attachToId);

  if (!parentNode) {
    throw new Error("Attach target could not be found.");
  }

  const stamp = Date.now();
  const collectableId = `${slugifyTitle(title)}-${stamp}`;
  const nextNode: GraphNode = {
    id: collectableId,
    title,
    kind: "collectable",
    role: "collectable",
    level: 2,
    summary,
    detail,
    x: parentNode.x + 180,
    y: parentNode.y + 140,
    confirmed: false,
    dayOpen: { 1: "Draft", 2: "Draft", 3: "Draft", 4: "Draft", 5: "Draft", 6: "Draft", 7: "Draft" },
    memoryAccess: boardId === "present" ? "None" : "Memory internal",
    npcs: ["Placeholder"],
    interactions: ["Inspect collectable"],
    bools: [
      ["Collectable Recorded", true],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Replace with authored collectable data later."],
    queryPath: [`${getBoardLabel(boardId)} -> ${parentNode.title} -> ${title}`]
  };

  const nextDocument: GraphDocument = {
    nodes: [...document.nodes, nextNode],
    edges: [
      ...document.edges,
      {
        id: `${attachToId}-collectable-${stamp}`,
        from: attachToId,
        to: collectableId
      }
    ]
  };

  return setBoardDocument(siteDocument, boardId, nextDocument);
}
