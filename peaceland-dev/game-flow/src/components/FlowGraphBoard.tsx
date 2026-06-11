import { useEffect, useMemo, useRef, useState } from "react";
import Dagre from "@dagrejs/dagre";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeResizer,
  NodeToolbar,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  reconnectEdge,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type NodeTypes,
  type OnConnect,
  type OnNodeDrag,
  type OnReconnect
} from "@xyflow/react";
import type { GraphBoardId, GraphDocument, GraphEdge, GraphNode, GraphNodeLevel, GraphNodeRole, NodeKind, SiteGraphDocument } from "../types/graph";
import {
  downloadTextFile,
  exportGraphWorkbookXml,
  makeExportStamp,
  parseGraphWorkbookXml
} from "../utils/graphWorkbook";
import { parseSiteGraphDocument } from "../utils/siteGraphDocument";

type FlowGraphData = {
  node: GraphNode;
  activeDay: number;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
};

type FlowGraphNode = Node<FlowGraphData, "flowGraphNode">;
type FlowGraphEdge = Edge<{ note?: string }>;
type EdgeTypeOption = "default" | "smoothstep" | "step" | "straight";
type GraphSnapshot = {
  nodes: Array<{ id: string; position: { x: number; y: number }; measured?: FlowGraphNode["measured"]; node: GraphNode }>;
  edges: FlowGraphEdge[];
  sourceNodeIds?: string[];
};
type CollisionOptions = {
  maxIterations: number;
  overlapThreshold: number;
  margin: number;
  lockedNodeId?: string | null;
};
type FlowContextMenu = {
  x: number;
  y: number;
  flowX: number;
  flowY: number;
  target: "pane" | "node" | "edge";
  nodeId?: string;
  edgeId?: string;
};
type GraphClipboard = {
  nodes: GraphNode[];
  edges: FlowGraphEdge[];
};
type HandleAnchor = {
  id?: string;
  x: number;
  y: number;
};
type NodeBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

type NodeTemplate = {
  kind: NodeKind;
  label: string;
  level: GraphNodeLevel;
  role: GraphNodeRole;
};

interface FlowGraphBoardProps {
  activeDay: number;
  boardId: GraphBoardId;
  edges: GraphEdge[];
  graphId: string;
  hasDraftChanges?: boolean;
  nodes: GraphNode[];
  onGraphChange: (document: GraphDocument) => void;
  onSiteDocumentChange: (document: SiteGraphDocument) => void;
  selectedId: string | null;
  seedEdges: GraphEdge[];
  seedNodes: GraphNode[];
  siteDocument: SiteGraphDocument;
  onSelect: (nodeId: string) => void;
}

type AssetGalleryEntry = {
  id: string;
  label: string;
  path: string;
  url: string;
};

function getGraphLabel(graphId: string) {
  return graphId
    .split("-")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function serializeList(values: string[]) {
  return values.join("\n");
}

function parseListValue(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeBoolList(values: Array<[string, boolean]>) {
  return values.map(([label, boolValue]) => `${label}: ${boolValue ? "true" : "false"}`).join("\n");
}

function parseBoolListValue(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.lastIndexOf(":");
      if (separatorIndex === -1) {
        return [line, false] as [string, boolean];
      }

      const label = line.slice(0, separatorIndex).trim() || "Flag";
      const boolValue = line.slice(separatorIndex + 1).trim().toLowerCase();
      return [label, ["true", "1", "yes"].includes(boolValue)] as [string, boolean];
    });
}

const NODE_TEMPLATES: NodeTemplate[] = [
  { kind: "scene", label: "Scene", level: 1, role: "scene-change" },
  { kind: "location", label: "Location", level: 1, role: "location" },
  { kind: "dialog", label: "Dialog", level: 2, role: "dialog" },
  { kind: "minigame", label: "Minigame", level: 2, role: "minigame" },
  { kind: "collectable", label: "Collectable", level: 2, role: "collectable" },
  { kind: "interaction-trigger", label: "Interaction", level: 3, role: "interaction-trigger" }
];

const KIND_OPTIONS: NodeKind[] = [
  "location",
  "scene",
  "dialog",
  "minigame",
  "collectable",
  "interaction-trigger",
  "memory-entry",
  "npc-gate",
  "state",
  "trigger"
];

const ROLE_OPTIONS: GraphNodeRole[] = [
  "location",
  "scene-change",
  "dialog",
  "minigame",
  "collectable",
  "interaction-trigger",
  "scene-interaction"
];

const LEVEL_OPTIONS: GraphNodeLevel[] = [1, 2, 3];
const EDGE_TYPE_OPTIONS: EdgeTypeOption[] = ["smoothstep", "default", "step", "straight"];
const COLLISION_OPTIONS: CollisionOptions = {
  maxIterations: Infinity,
  overlapThreshold: 0,
  margin: 36
};
const HANDLE_OPTIONS = [
  "",
  "top-source",
  "top-target",
  "bottom-source",
  "bottom-target",
  "left-source",
  "left-target",
  "right-source",
  "right-target",
  "left-upper-source",
  "left-lower-target",
  "right-upper-target",
  "right-lower-source"
];

const assetGalleryModules = import.meta.glob("../assets/gallery/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  import: "default"
}) as Record<string, string>;

const ASSET_GALLERY: AssetGalleryEntry[] = Object.entries(assetGalleryModules)
  .map(([path, url]) => {
    const fileName = path.split("/").pop() ?? path;

    return {
      id: fileName,
      label: fileName.replace(/\.[^.]+$/, ""),
      path,
      url
    };
  })
  .sort((first, second) => first.label.localeCompare(second.label));

function getNodeLevel(node: GraphNode) {
  if (node.level) {
    return node.level;
  }

  if (node.kind === "location" || node.kind === "scene" || node.role === "scene-change") {
    return 1;
  }

  if (node.kind === "dialog" || node.kind === "minigame" || node.kind === "collectable") {
    return 2;
  }

  return 3;
}

function getNodeSize(node: GraphNode) {
  let defaults: { width: number; height: number };
  if (node.kind === "location") {
    defaults = { width: 340, height: 340 };
  } else {
    const level = getNodeLevel(node);

    if (level === 1) {
      defaults = { width: 286, height: 150 };
    } else if (level === 2) {
      defaults = { width: 230, height: 128 };
    } else {
      defaults = { width: 198, height: 112 };
    }
  }

  return {
    width: node.width ?? defaults.width,
    height: node.height ?? defaults.height
  };
}

function applySelectedClass(nodes: FlowGraphNode[], selectedId: string | null) {
  return nodes.map((node) => ({
    ...node,
    className: node.id === selectedId ? "is-selected" : undefined
  }));
}

function getGraphNodeRect(node: GraphNode) {
  const size = getNodeSize(node);
  return {
    x: node.x,
    y: node.y,
    width: size.width,
    height: size.height,
    right: node.x + size.width,
    bottom: node.y + size.height,
    centerX: node.x + size.width / 2,
    centerY: node.y + size.height / 2
  };
}

function getGraphNodeHandleAnchors(node: GraphNode, handleType: "source" | "target"): HandleAnchor[] {
  const rect = getGraphNodeRect(node);
  const isLocation = node.kind === "location";

  if (isLocation) {
    if (handleType === "source") {
      return [
        { id: "top-source", x: rect.centerX, y: rect.y },
        { id: "bottom-source", x: rect.centerX, y: rect.bottom },
        { id: "left-upper-source", x: rect.x, y: rect.y + rect.height * 0.28 },
        { id: "right-lower-source", x: rect.right, y: rect.y + rect.height * 0.72 },
        { id: undefined, x: rect.right, y: rect.centerY }
      ];
    }

    return [
      { id: "top-target", x: rect.centerX, y: rect.y },
      { id: "bottom-target", x: rect.centerX, y: rect.bottom },
      { id: "left-lower-target", x: rect.x, y: rect.y + rect.height * 0.72 },
      { id: "right-upper-target", x: rect.right, y: rect.y + rect.height * 0.28 },
      { id: undefined, x: rect.x, y: rect.centerY }
    ];
  }

  if (handleType === "source") {
    return [
      { id: "top-source", x: rect.centerX, y: rect.y },
      { id: "bottom-source", x: rect.centerX, y: rect.bottom },
      { id: "left-source", x: rect.x, y: rect.centerY },
      { id: "right-source", x: rect.right, y: rect.centerY },
      { id: undefined, x: rect.right, y: rect.centerY }
    ];
  }

  return [
    { id: "top-target", x: rect.centerX, y: rect.y },
    { id: "bottom-target", x: rect.centerX, y: rect.bottom },
    { id: "left-target", x: rect.x, y: rect.centerY },
    { id: "right-target", x: rect.right, y: rect.centerY },
    { id: undefined, x: rect.x, y: rect.centerY }
  ];
}

function getNearestHandle(fromNode: GraphNode, toNode: GraphNode, handleType: "source" | "target") {
  const toRect = getGraphNodeRect(toNode);
  const targetPoint = { x: toRect.centerX, y: toRect.centerY };

  return getGraphNodeHandleAnchors(fromNode, handleType).reduce((nearest, candidate) => {
    const nearestDistance = (nearest.x - targetPoint.x) ** 2 + (nearest.y - targetPoint.y) ** 2;
    const candidateDistance = (candidate.x - targetPoint.x) ** 2 + (candidate.y - targetPoint.y) ** 2;
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

function applyNearestCurveHandles(edge: FlowGraphEdge, nodeMap: Map<string, GraphNode>) {
  const sourceNode = nodeMap.get(edge.source);
  const targetNode = nodeMap.get(edge.target);

  if (!sourceNode || !targetNode) {
    return edge;
  }

  return {
    ...edge,
    type: "default",
    sourceHandle: getNearestHandle(sourceNode, targetNode, "source").id,
    targetHandle: getNearestHandle(targetNode, sourceNode, "target").id
  };
}

function mapEdges(edges: GraphEdge[], nodes: GraphNode[], useNearestCurveHandles = false) {
  const ids = new Set(nodes.map((node) => node.id));
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to))
    .map((edge) => {
      const flowEdge: FlowGraphEdge = {
          id: edge.id,
          source: edge.from,
          target: edge.to,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type ?? "smoothstep",
          label: edge.label,
          animated: edge.animated,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18
          }
        };

      return useNearestCurveHandles ? applyNearestCurveHandles(flowEdge, nodeMap) : flowEdge;
    });
}

function createFlowNode(node: GraphNode, activeDay: number, onDuplicate: (nodeId: string) => void, onDelete: (nodeId: string) => void): FlowGraphNode {
  const size = getNodeSize(node);

  return {
    id: node.id,
    type: "flowGraphNode",
    position: { x: node.x, y: node.y },
    style: {
      width: size.width,
      height: size.height
    },
    data: {
      node,
      activeDay,
      onDuplicate,
      onDelete
    }
  };
}

function mapNodes(nodes: GraphNode[], activeDay: number, onDuplicate: (nodeId: string) => void, onDelete: (nodeId: string) => void) {
  return nodes.map((node) => createFlowNode(node, activeDay, onDuplicate, onDelete));
}

function syncNodeSizeData(node: FlowGraphNode): FlowGraphNode {
  const fallbackSize = getNodeSize(node.data.node);
  const width = node.measured?.width ?? node.width ?? fallbackSize.width;
  const height = node.measured?.height ?? node.height ?? fallbackSize.height;

  return {
    ...node,
    width,
    height,
    style: {
      ...(node.style ?? {}),
      width,
      height
    },
    data: {
      ...node.data,
      node: {
        ...node.data.node,
        width,
        height
      }
    }
  };
}

function syncNodePositionOnlyData(node: FlowGraphNode): FlowGraphNode {
  return {
    ...node,
    data: {
      ...node.data,
      node: {
        ...node.data.node,
        x: node.position.x,
        y: node.position.y
      }
    }
  };
}

function layoutWithDagre(nodes: FlowGraphNode[], edges: FlowGraphEdge[]) {
  const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", align: "UL", nodesep: 70, ranksep: 130, marginx: 40, marginy: 40 });

  nodes.forEach((node) => {
    const size = getNodeSize(node.data.node);
    graph.setNode(node.id, size);
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(graph);

  return nodes.map((node) => {
    const layoutNode = graph.node(node.id);
    const size = getNodeSize(node.data.node);

    return {
      ...node,
      position: {
        x: layoutNode.x - size.width / 2,
        y: layoutNode.y - size.height / 2
      }
    };
  });
}

function syncNodePositionData(node: FlowGraphNode): FlowGraphNode {
  return syncNodeSizeData(syncNodePositionOnlyData(node));
}

function getFlowNodeRect(node: FlowGraphNode, margin = 0) {
  const fallbackSize = getNodeSize(node.data.node);
  const width = node.measured?.width ?? node.width ?? fallbackSize.width;
  const height = node.measured?.height ?? node.height ?? fallbackSize.height;

  return {
    x: node.position.x - margin,
    y: node.position.y - margin,
    width: width + margin * 2,
    height: height + margin * 2,
    right: node.position.x + width + margin,
    bottom: node.position.y + height + margin
  };
}

function getFlowNodeBounds(nodes: FlowGraphNode[]): NodeBounds | null {
  if (nodes.length === 0) {
    return null;
  }

  const rects = nodes.map((node) => getFlowNodeRect(node));
  const minX = Math.min(...rects.map((rect) => rect.x));
  const minY = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.right));
  const maxY = Math.max(...rects.map((rect) => rect.bottom));
  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2
  };
}

function isRestoredLayoutReasonable(restoredNodes: FlowGraphNode[], referenceNodes: FlowGraphNode[]) {
  const restoredBounds = getFlowNodeBounds(restoredNodes);
  const referenceBounds = getFlowNodeBounds(referenceNodes);

  if (!restoredBounds || !referenceBounds) {
    return true;
  }

  const maxDimension = 12000;
  if (restoredBounds.width > maxDimension || restoredBounds.height > maxDimension) {
    return false;
  }

  const centerDistanceX = Math.abs(restoredBounds.centerX - referenceBounds.centerX);
  const centerDistanceY = Math.abs(restoredBounds.centerY - referenceBounds.centerY);
  const allowedCenterShiftX = Math.max(referenceBounds.width * 4, 2400);
  const allowedCenterShiftY = Math.max(referenceBounds.height * 4, 1800);

  if (centerDistanceX > allowedCenterShiftX || centerDistanceY > allowedCenterShiftY) {
    return false;
  }

  const allowedMin = -6000;
  const allowedMax = 18000;
  if (
    restoredBounds.minX < allowedMin ||
    restoredBounds.minY < allowedMin ||
    restoredBounds.maxX > allowedMax ||
    restoredBounds.maxY > allowedMax
  ) {
    return false;
  }

  return true;
}

function getCollision(firstNode: FlowGraphNode, secondNode: FlowGraphNode, margin: number) {
  const first = getFlowNodeRect(firstNode, margin);
  const second = getFlowNodeRect(secondNode, margin);
  const overlapX = Math.min(first.right, second.right) - Math.max(first.x, second.x);
  const overlapY = Math.min(first.bottom, second.bottom) - Math.max(first.y, second.y);

  if (overlapX <= 0 || overlapY <= 0) {
    return null;
  }

  const overlapArea = overlapX * overlapY;
  const smallerArea = Math.min(first.width * first.height, second.width * second.height);
  const overlapRatio = smallerArea > 0 ? overlapArea / smallerArea : 0;

  return { overlapX, overlapY, overlapRatio };
}

function moveNodeBy(node: FlowGraphNode, deltaX: number, deltaY: number) {
  return syncNodePositionData({
    ...node,
    position: {
      x: node.position.x + deltaX,
      y: node.position.y + deltaY
    }
  });
}

function resolveCollisionPair(firstNode: FlowGraphNode, secondNode: FlowGraphNode, options: CollisionOptions) {
  const collision = getCollision(firstNode, secondNode, options.margin);

  if (!collision || collision.overlapRatio <= options.overlapThreshold) {
    return { firstNode, secondNode, changed: false };
  }

  const firstRect = getFlowNodeRect(firstNode);
  const secondRect = getFlowNodeRect(secondNode);
  const firstCenter = {
    x: firstRect.x + firstRect.width / 2,
    y: firstRect.y + firstRect.height / 2
  };
  const secondCenter = {
    x: secondRect.x + secondRect.width / 2,
    y: secondRect.y + secondRect.height / 2
  };
  const pushX = collision.overlapX / 2 + options.margin / 2;
  const pushY = collision.overlapY / 2 + options.margin / 2;
  const moveOnX = collision.overlapX <= collision.overlapY;
  const firstIsLocked = options.lockedNodeId === firstNode.id;
  const secondIsLocked = options.lockedNodeId === secondNode.id;
  const directionX = firstCenter.x <= secondCenter.x ? -1 : 1;
  const directionY = firstCenter.y <= secondCenter.y ? -1 : 1;

  if (moveOnX) {
    if (firstIsLocked) {
      return { firstNode, secondNode: moveNodeBy(secondNode, -directionX * pushX * 2, 0), changed: true };
    }

    if (secondIsLocked) {
      return { firstNode: moveNodeBy(firstNode, directionX * pushX * 2, 0), secondNode, changed: true };
    }

    return {
      firstNode: moveNodeBy(firstNode, directionX * pushX, 0),
      secondNode: moveNodeBy(secondNode, -directionX * pushX, 0),
      changed: true
    };
  }

  if (firstIsLocked) {
    return { firstNode, secondNode: moveNodeBy(secondNode, 0, -directionY * pushY * 2), changed: true };
  }

  if (secondIsLocked) {
    return { firstNode: moveNodeBy(firstNode, 0, directionY * pushY * 2), secondNode, changed: true };
  }

  return {
    firstNode: moveNodeBy(firstNode, 0, directionY * pushY),
    secondNode: moveNodeBy(secondNode, 0, -directionY * pushY),
    changed: true
  };
}

function resolveCollisions(nodes: FlowGraphNode[], options: CollisionOptions = COLLISION_OPTIONS) {
  let resolvedNodes = nodes.map(syncNodePositionData);
  const maxIterations = Number.isFinite(options.maxIterations)
    ? Math.max(1, options.maxIterations)
    : Math.max(4, resolvedNodes.length * resolvedNodes.length * 2);

  for (let pass = 0; pass < maxIterations; pass += 1) {
    let changed = false;

    for (let index = 0; index < resolvedNodes.length; index += 1) {
      for (let compareIndex = index + 1; compareIndex < resolvedNodes.length; compareIndex += 1) {
        const result = resolveCollisionPair(resolvedNodes[index], resolvedNodes[compareIndex], options);
        resolvedNodes[index] = result.firstNode;
        resolvedNodes[compareIndex] = result.secondNode;

        if (result.changed) {
          changed = true;
        }
      }
    }

    if (!changed) {
      break;
    }
  }

  return resolvedNodes;
}

function makeNodeFromTemplate(template: NodeTemplate, index: number): GraphNode {
  const title = `${template.label} ${index}`;

  return {
    id: `${template.kind}-${Date.now()}-${index}`,
    title,
    kind: template.kind,
    role: template.role,
    level: template.level,
    summary: `New ${template.label.toLowerCase()} node.`,
    detail: `Placeholder ${template.label.toLowerCase()} created in the graph editor.`,
    x: 80 + index * 24,
    y: 80 + index * 24,
    confirmed: false,
    dayOpen: { 1: "Draft", 2: "Draft", 3: "Draft", 4: "Draft", 5: "Draft", 6: "Draft", 7: "Draft" },
    memoryAccess: "Draft",
    npcs: ["Placeholder"],
    interactions: ["Draft interaction"],
    bools: [
      ["Dialogue Recorded", template.kind === "dialog"],
      ["Collectable Recorded", template.kind === "collectable"],
      ["Stat Impact Possible", false],
      ["Notebook Progress Possible", true]
    ],
    unlocks: ["Wire this node to the correct source and target."],
    queryPath: ["Draft node -> connect in graph editor"]
  };
}

function FlowGraphNodeView({ data, selected }: NodeProps<FlowGraphNode>) {
  const { node, activeDay, onDuplicate, onDelete } = data;
  const level = getNodeLevel(node);
  const isLocation = node.kind === "location";
  const size = getNodeSize(node);
  const canResize = !isLocation;
  const imageAlt = node.imageAlt?.trim() || node.title;

  const extraHandles = isLocation ? (
    <>
      <Handle id="top-source" className="nearest-handle circle-handle top" type="source" position={Position.Top} />
      <Handle id="top-target" className="nearest-handle circle-handle top" type="target" position={Position.Top} />
      <Handle id="bottom-source" className="nearest-handle circle-handle bottom" type="source" position={Position.Bottom} />
      <Handle id="bottom-target" className="nearest-handle circle-handle bottom" type="target" position={Position.Bottom} />
      <Handle id="left-upper-source" className="nearest-handle circle-handle left-upper" type="source" position={Position.Left} />
      <Handle id="left-lower-target" className="nearest-handle circle-handle left-lower" type="target" position={Position.Left} />
      <Handle id="right-upper-target" className="nearest-handle circle-handle right-upper" type="target" position={Position.Right} />
      <Handle id="right-lower-source" className="nearest-handle circle-handle right-lower" type="source" position={Position.Right} />
    </>
  ) : (
    <>
      <Handle id="top-source" className="nearest-handle top" type="source" position={Position.Top} />
      <Handle id="top-target" className="nearest-handle top" type="target" position={Position.Top} />
      <Handle id="bottom-source" className="nearest-handle bottom" type="source" position={Position.Bottom} />
      <Handle id="bottom-target" className="nearest-handle bottom" type="target" position={Position.Bottom} />
      <Handle id="left-source" className="nearest-handle left" type="source" position={Position.Left} />
      <Handle id="left-target" className="nearest-handle left" type="target" position={Position.Left} />
      <Handle id="right-source" className="nearest-handle right" type="source" position={Position.Right} />
      <Handle id="right-target" className="nearest-handle right" type="target" position={Position.Right} />
    </>
  );

  return (
    <div
      className={`rf-node-card ${node.kind} level-${level} ${isLocation ? "location-circle" : ""} ${selected ? "selected" : ""} ${node.imageSrc ? "has-image" : ""}`}
      style={{ width: size.width, height: size.height }}
    >
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="node-toolbar">
          <button type="button" onClick={() => onDuplicate(node.id)}>Duplicate</button>
          <button type="button" onClick={() => onDelete(node.id)}>Delete</button>
        </div>
      </NodeToolbar>
      {canResize ? <NodeResizer color="rgba(125,179,255,0.72)" isVisible={selected} minWidth={170} minHeight={112} /> : null}
      {extraHandles}
      <Handle type="target" position={Position.Left} />
      <div className="rf-node-top">
        <span className="rf-node-status">{node.role ?? node.kind}</span>
        <span className="rf-node-day">{node.dayOpen[activeDay] ?? "Draft"}</span>
      </div>
      {node.imageSrc ? (
        <div className="rf-node-image-frame">
          <img className="rf-node-image" src={node.imageSrc} alt={imageAlt} />
        </div>
      ) : null}
      <div className="rf-node-copy">
        <h3>{node.title}</h3>
        <p>{node.summary}</p>
      </div>
      <div className="rf-node-footer">
        <span>level {level}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  flowGraphNode: FlowGraphNodeView
};

export function FlowGraphBoard(props: FlowGraphBoardProps) {
  return (
    <ReactFlowProvider>
      <FlowGraphBoardInner {...props} />
    </ReactFlowProvider>
  );
}

function FlowGraphBoardInner({
  activeDay,
  boardId,
  edges,
  graphId,
  hasDraftChanges = false,
  nodes,
  onGraphChange,
  onSiteDocumentChange,
  selectedId,
  seedEdges,
  seedNodes,
  siteDocument,
  onSelect
}: FlowGraphBoardProps) {
  const storageKey = `peaceland-flow-layout:${graphId}`;
  const editorNameKey = `peaceland-flow-editor:${graphId}`;
  const graphLabel = getGraphLabel(graphId);
  const reactFlow = useReactFlow<FlowGraphNode, FlowGraphEdge>();
  const nodesInitialized = useNodesInitialized();
  const useNearestCurveEdges = graphId === "present" || graphId.includes("memory");
  const [draftIndex, setDraftIndex] = useState(1);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [jsonBuffer, setJsonBuffer] = useState("");
  const [dataExchangeStatus, setDataExchangeStatus] = useState("");
  const [isJsonDropActive, setIsJsonDropActive] = useState(false);
  const [editorName, setEditorName] = useState(() => window.localStorage.getItem(editorNameKey) ?? "");
  const [contextMenu, setContextMenu] = useState<FlowContextMenu | null>(null);
  const [clipboard, setClipboard] = useState<GraphClipboard | null>(null);
  const [selectedEditorTab, setSelectedEditorTab] = useState<"content" | "gallery">("content");
  const undoStackRef = useRef<GraphSnapshot[]>([]);
  const redoStackRef = useRef<GraphSnapshot[]>([]);
  const syncedGraphSignatureRef = useRef("");
  const hasCompletedInitialNodeInitRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const workbookInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    window.localStorage.setItem(editorNameKey, editorName);
  }, [editorName, editorNameKey]);

  useEffect(() => {
    if (nodesInitialized) {
      hasCompletedInitialNodeInitRef.current = true;
    }
  }, [nodesInitialized]);

  const removeNode = (nodeId: string) => {
    commitFlowNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
    setFlowEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const duplicateNode = (nodeId: string) => {
    commitFlowNodes((currentNodes) => {
      const source = currentNodes.find((node) => node.id === nodeId);
      if (!source) {
        return currentNodes;
      }

      const copiedGraphNode: GraphNode = {
        ...source.data.node,
        id: `${source.data.node.id}-copy-${Date.now()}`,
        title: `${source.data.node.title} Copy`,
        confirmed: false,
        x: source.position.x + 40,
        y: source.position.y + 40
      };

      const copy = createFlowNode(copiedGraphNode, activeDay, duplicateNode, removeNode);
      return applySelectedClass(resolveCollisions([...currentNodes, copy]), selectedId);
    });
  };

  const initialNodes = useMemo(
    () => applySelectedClass(mapNodes(nodes, activeDay, duplicateNode, removeNode), selectedId),
    [activeDay, nodes, selectedId]
  );
  const initialEdges = useMemo(() => mapEdges(edges, nodes, useNearestCurveEdges), [edges, nodes, useNearestCurveEdges]);
  const [flowNodes, setFlowNodes] = useNodesState<FlowGraphNode>(initialNodes);
  const [flowEdges, setFlowEdges] = useEdgesState<FlowGraphEdge>(initialEdges);
  const propGraphSignature = useMemo(() => JSON.stringify({ nodes, edges }), [nodes, edges]);

  if (!syncedGraphSignatureRef.current) {
    syncedGraphSignatureRef.current = propGraphSignature;
  }

  const routeEdgesToNearestHandles = (targetEdges: FlowGraphEdge[], targetNodes: FlowGraphNode[]) => {
    if (!useNearestCurveEdges) {
      return targetEdges;
    }

    const nodeMap = new Map(
      targetNodes.map((node) => [
        node.id,
        {
          ...node.data.node,
          x: node.position.x,
          y: node.position.y
        }
      ])
    );

    return targetEdges.map((edge) => applyNearestCurveHandles(edge, nodeMap));
  };

  const commitFlowNodes = (
    getNextNodes: (currentNodes: FlowGraphNode[]) => FlowGraphNode[],
    options: { rerouteEdges?: boolean } = {}
  ) => {
    const { rerouteEdges = true } = options;
    setFlowNodes((currentNodes) => {
      const nextNodes = getNextNodes(currentNodes);
      if (useNearestCurveEdges && rerouteEdges) {
        setFlowEdges((currentEdges) => routeEdgesToNearestHandles(currentEdges, nextNodes));
      }

      return nextNodes;
    });
  };

  const getSelectedGraphSelection = () => {
    const selectedNodes = flowNodes.filter((node) => node.selected || node.id === selectedId);
    const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
    const copiedEdges =
      selectedNodeIds.size > 0
        ? flowEdges.filter((edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target))
        : selectedEdgeId
          ? flowEdges.filter((edge) => edge.id === selectedEdgeId)
          : [];

    return {
      nodes: selectedNodes.map((node) => ({
        ...node.data.node,
        x: node.position.x,
        y: node.position.y
      })),
      edges: copiedEdges
    };
  };

  const copySelection = () => {
    const selection = getSelectedGraphSelection();
    if (selection.nodes.length === 0 && selection.edges.length === 0) {
      return;
    }

    setClipboard(selection);
    setContextMenu(null);
  };

  const pasteClipboard = (position?: { x: number; y: number }) => {
    if (!clipboard || clipboard.nodes.length === 0) {
      return;
    }

    pushHistory();
    const idMap = new Map<string, string>();
    const minX = Math.min(...clipboard.nodes.map((node) => node.x));
    const minY = Math.min(...clipboard.nodes.map((node) => node.y));
    const pasteX = position?.x ?? minX + 48;
    const pasteY = position?.y ?? minY + 48;
    const pastedNodes = clipboard.nodes.map((node, index) => {
      const nextId = `${node.id}-copy-${Date.now()}-${index}`;
      idMap.set(node.id, nextId);

      return {
        ...node,
        id: nextId,
        title: `${node.title} Copy`,
        confirmed: false,
        x: pasteX + (node.x - minX),
        y: pasteY + (node.y - minY)
      };
    });
    const pastedEdges = clipboard.edges
      .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
      .map((edge, index) => ({
        ...edge,
        id: `${edge.id}-copy-${Date.now()}-${index}`,
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target
      }));
    const pastedFlowNodes = pastedNodes.map((node) => createFlowNode(node, activeDay, duplicateNode, removeNode));

    commitFlowNodes((currentNodes) => applySelectedClass(resolveCollisions([...currentNodes, ...pastedFlowNodes]), selectedId));
    setFlowEdges((currentEdges) => routeEdgesToNearestHandles([...currentEdges, ...pastedEdges], [...flowNodes, ...pastedFlowNodes]));
    setContextMenu(null);
  };

  const exportableNodesFromFlow = (sourceNodes = flowNodes) =>
    sourceNodes.map((node) => ({
      ...node.data.node,
      x: node.position.x,
      y: node.position.y
    }));

  const exportableEdgesFromFlow = (sourceEdges = flowEdges): GraphEdge[] =>
    sourceEdges.map((edge) => ({
      id: edge.id,
      from: edge.source,
      to: edge.target,
      label: typeof edge.label === "string" ? edge.label : undefined,
      type: edge.type as GraphEdge["type"] | undefined,
      sourceHandle: edge.sourceHandle ?? undefined,
      targetHandle: edge.targetHandle ?? undefined,
      animated: edge.animated
    }));

  const currentGraphDocument = useMemo<GraphDocument>(
    () => ({
      nodes: exportableNodesFromFlow(flowNodes),
      edges: exportableEdgesFromFlow(flowEdges)
    }),
    [flowNodes, flowEdges]
  );
  const currentGraphSignature = useMemo(() => JSON.stringify(currentGraphDocument), [currentGraphDocument]);

  const makeSnapshot = (snapshotNodes = flowNodes, snapshotEdges = flowEdges): GraphSnapshot => ({
    nodes: snapshotNodes.map((node) => ({
      id: node.id,
      position: node.position,
      measured: node.measured,
      node: {
        ...node.data.node,
        x: node.position.x,
        y: node.position.y
      }
    })),
    edges: snapshotEdges
  });

  const restoreSnapshot = (snapshot: GraphSnapshot) => {
    const restoredNodes = resolveCollisions(snapshot.nodes.map((item) => ({
      ...createFlowNode({ ...item.node, x: item.position.x, y: item.position.y }, activeDay, duplicateNode, removeNode),
      measured: item.measured,
      position: item.position
    })));

    setFlowNodes(applySelectedClass(restoredNodes, selectedId));
    setFlowEdges(routeEdgesToNearestHandles(snapshot.edges, restoredNodes));
  };

  const pushHistory = () => {
    undoStackRef.current = [...undoStackRef.current.slice(-49), makeSnapshot()];
    redoStackRef.current = [];
    setHistoryVersion((value) => value + 1);
  };

  useEffect(() => {
    if (!hasCompletedInitialNodeInitRef.current || isDragging) {
      return;
    }

    if (propGraphSignature === currentGraphSignature) {
      syncedGraphSignatureRef.current = propGraphSignature;
      return;
    }

    // Internal edits (drag, sheet, resize) update flowNodes first; wait for upward sync.
    if (propGraphSignature === syncedGraphSignatureRef.current) {
      return;
    }

    syncedGraphSignatureRef.current = propGraphSignature;
    setFlowNodes(initialNodes);
    setFlowEdges(routeEdgesToNearestHandles(initialEdges, initialNodes));
  }, [currentGraphSignature, initialNodes, initialEdges, isDragging, propGraphSignature, setFlowEdges, setFlowNodes]);

  useEffect(() => {
    if (!hasCompletedInitialNodeInitRef.current) {
      return;
    }

    setFlowNodes((currentNodes) => applySelectedClass(currentNodes, selectedId));
  }, [selectedId, setFlowNodes]);

  useEffect(() => {
    setSelectedEditorTab("content");
  }, [selectedId]);

  useEffect(() => {
    if (isDragging) {
      return;
    }

    if (currentGraphSignature === syncedGraphSignatureRef.current) {
      return;
    }

    syncedGraphSignatureRef.current = currentGraphSignature;
    onGraphChange(currentGraphDocument);
  }, [currentGraphDocument, currentGraphSignature, isDragging, onGraphChange]);

  const onConnect: OnConnect = (connection: Connection) => {
    if (!isValidConnection(connection)) {
      return;
    }

    pushHistory();
    setFlowEdges((currentEdges) =>
      routeEdgesToNearestHandles(
        addEdge(
          {
            ...connection,
            id: `${connection.source}-${connection.target}-${Date.now()}`,
            type: useNearestCurveEdges ? "default" : "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 }
          },
          currentEdges
        ),
        flowNodes
      )
    );
  };

  const isValidConnection = (connection: Connection | FlowGraphEdge, ignoredEdgeId?: string) => {
    if (!connection.source || !connection.target || connection.source === connection.target) {
      return false;
    }

    const sourceHandle = connection.sourceHandle ?? null;
    const targetHandle = connection.targetHandle ?? null;

    return !flowEdges.some(
      (edge) =>
        edge.id !== ignoredEdgeId &&
        edge.source === connection.source &&
        edge.target === connection.target &&
        (edge.sourceHandle ?? null) === sourceHandle &&
        (edge.targetHandle ?? null) === targetHandle
    );
  };

  const onFlowEdgesChange = (changes: EdgeChange<FlowGraphEdge>[]) => {
    if (changes.some((change) => change.type === "remove")) {
      pushHistory();
    }

    setFlowEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
  };

  const onReconnect: OnReconnect<FlowGraphEdge> = (oldEdge, newConnection) => {
    if (!isValidConnection(newConnection, oldEdge.id)) {
      return;
    }

    pushHistory();
    setFlowEdges((currentEdges) => routeEdgesToNearestHandles(reconnectEdge(oldEdge, newConnection, currentEdges), flowNodes));
  };

  const onFlowNodesChange = (changes: NodeChange<FlowGraphNode>[]) => {
    const includesDimensionChange = changes.some((change) => change.type === "dimensions");

    commitFlowNodes(
      (currentNodes) =>
        applySelectedClass(
          applyNodeChanges(changes, currentNodes).map((node) =>
            includesDimensionChange ? syncNodePositionData(node) : syncNodePositionOnlyData(node)
          ),
          selectedId
        ),
      { rerouteEdges: includesDimensionChange }
    );
  };

  const resolveOverlaps = (lockedNodeId?: string | null) => {
    pushHistory();
    commitFlowNodes((currentNodes) =>
      applySelectedClass(resolveCollisions(currentNodes, { ...COLLISION_OPTIONS, lockedNodeId }), selectedId)
    );
  };

  const onNodeDragStart: OnNodeDrag<FlowGraphNode> = () => {
    pushHistory();
    setIsDragging(true);
  };

  const onNodeDragStop: OnNodeDrag<FlowGraphNode> = (_, node) => {
    commitFlowNodes(
      (currentNodes) =>
        applySelectedClass(
          currentNodes.map((currentNode) => (currentNode.id === node.id ? syncNodePositionOnlyData(currentNode) : currentNode)),
          selectedId
        ),
      { rerouteEdges: true }
    );
    setIsDragging(false);
  };

  const autoLayout = () => {
    pushHistory();
    commitFlowNodes((currentNodes) => applySelectedClass(resolveCollisions(layoutWithDagre(currentNodes, flowEdges)), selectedId));
  };

  const addNode = (template: NodeTemplate, position?: { x: number; y: number }) => {
    const graphNode = {
      ...makeNodeFromTemplate(template, draftIndex),
      x: position?.x ?? 80 + draftIndex * 24,
      y: position?.y ?? 80 + draftIndex * 24
    };
    pushHistory();
    setDraftIndex((value) => value + 1);
    commitFlowNodes((currentNodes) =>
      applySelectedClass(resolveCollisions([...currentNodes, createFlowNode(graphNode, activeDay, duplicateNode, removeNode)]), selectedId)
    );
    setContextMenu(null);
  };

  const deleteSelected = () => {
    if (selectedId) {
      pushHistory();
      removeNode(selectedId);
    }
  };

  const duplicateSelected = () => {
    if (selectedId) {
      pushHistory();
      duplicateNode(selectedId);
    }
  };

  const updateNodeData = (nodeId: string, patch: Partial<GraphNode>) => {
    pushHistory();
    commitFlowNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        const nextGraphNode = {
          ...node.data.node,
          ...patch
        };

        return {
          ...node,
          data: {
            ...node.data,
            node: nextGraphNode
          }
        };
      })
    );
  };

  const updateNodeKind = (nodeId: string, kind: NodeKind) => {
    const template = NODE_TEMPLATES.find((item) => item.kind === kind);

    updateNodeData(nodeId, {
      kind,
      level: template?.level,
      role: template?.role
    });
  };

  const updateNodePosition = (nodeId: string, axis: "x" | "y", value: string) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    pushHistory();
    commitFlowNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        const nextPosition = {
          ...node.position,
          [axis]: numericValue
        };

        return {
          ...node,
          position: nextPosition,
          data: {
            ...node.data,
            node: {
              ...node.data.node,
              [axis]: numericValue
            }
          }
        };
      })
    );
  };

  const updateNodeDayValue = (nodeId: string, day: number, value: string) => {
    const targetNode = flowNodes.find((node) => node.id === nodeId)?.data.node;
    if (!targetNode) {
      return;
    }

    updateNodeData(nodeId, {
      dayOpen: {
        ...targetNode.dayOpen,
        [day]: value
      }
    });
  };

  const updateEdge = (edgeId: string, patch: Partial<FlowGraphEdge>) => {
    pushHistory();
    setFlowEdges((currentEdges) =>
      routeEdgesToNearestHandles(
        currentEdges.map((edge) => {
          if (edge.id !== edgeId) {
            return edge;
          }

          return {
            ...edge,
            ...patch
          };
        }),
        flowNodes
      )
    );
  };

  const deleteEdge = (edgeId: string) => {
    pushHistory();
    setFlowEdges((currentEdges) => currentEdges.filter((edge) => edge.id !== edgeId));
  };

  const undo = () => {
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    if (!previous) {
      return;
    }

    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current, makeSnapshot()];
    restoreSnapshot(previous);
    setHistoryVersion((value) => value + 1);
  };

  const redo = () => {
    const next = redoStackRef.current[redoStackRef.current.length - 1];
    if (!next) {
      return;
    }

    redoStackRef.current = redoStackRef.current.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current, makeSnapshot()];
    restoreSnapshot(next);
    setHistoryVersion((value) => value + 1);
  };

  const loadCurrentJson = () => {
    setJsonBuffer(JSON.stringify(siteDocument, null, 2));
  };

  const importJsonText = (jsonText: string, sourceLabel = "JSON") => {
    if (!jsonText.trim()) {
      return;
    }

    const parsed = parseSiteGraphDocument(jsonText);
    onSiteDocumentChange(parsed);
    setJsonBuffer(jsonText);
    setDataExchangeStatus(`Imported ${sourceLabel} into the shared site document. ${getGraphLabel(boardId)} refreshed from the same source of truth.`);
  };

  const importJson = () => {
    importJsonText(jsonBuffer, "JSON");
  };

  const exportJsonFile = () => {
    const stamp = makeExportStamp();
    const payload = JSON.stringify(siteDocument, null, 2);
    downloadTextFile(`peaceland_site_graph_${stamp}.json`, payload, "application/json;charset=utf-8");
    setDataExchangeStatus(`Exported shared site JSON at ${new Date().toLocaleTimeString()}.`);
  };

  const exportWorkbookFile = () => {
    const stamp = makeExportStamp();
    const exportedAt = new Date().toISOString();
    const workbookXml = exportGraphWorkbookXml(graphId, exportableNodesFromFlow(), exportableEdgesFromFlow(), {
      editorName,
      exportedAt,
      graphLabel
    });
    downloadTextFile(`${graphId}_${stamp}.xls`, workbookXml, "application/vnd.ms-excel;charset=utf-8");
    setDataExchangeStatus(`Exported ${graphLabel} workbook for Drive upload at ${new Date(exportedAt).toLocaleTimeString()}.`);
  };

  const downloadSeedWorkbookFile = () => {
    const stamp = makeExportStamp();
    const workbookXml = exportGraphWorkbookXml(graphId, seedNodes, seedEdges, {
      editorName,
      exportedAt: new Date().toISOString(),
      graphLabel: `${graphLabel} Seed`
    });
    downloadTextFile(`${graphId}_seed_${stamp}.xls`, workbookXml, "application/vnd.ms-excel;charset=utf-8");
    setDataExchangeStatus(`Downloaded seed workbook for ${graphLabel}.`);
  };

  const openWorkbookPicker = () => {
    workbookInputRef.current?.click();
  };

  const importWorkbookFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const xmlText = await file.text();
      const parsed = parseGraphWorkbookXml(xmlText);
      const snapshot: GraphSnapshot = {
        nodes: parsed.nodes.map((node) => ({
          id: node.id,
          position: { x: node.x, y: node.y },
          node
        })),
        edges: mapEdges(parsed.edges, parsed.nodes, useNearestCurveEdges)
      };
      pushHistory();
      restoreSnapshot(snapshot);
      setDataExchangeStatus(`Imported workbook "${file.name}" into ${graphLabel}.`);
      setJsonBuffer("");
    } finally {
      event.target.value = "";
    }
  };

  const handleJsonDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsJsonDropActive(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    const isJsonLike = file.name.toLowerCase().endsWith(".json") || file.type === "application/json" || file.type === "text/json";
    if (!isJsonLike) {
      setDataExchangeStatus(`Ignored "${file.name}". Drop a .json file into the JSON area.`);
      return;
    }

    const jsonText = await file.text();
    importJsonText(jsonText, `JSON file "${file.name}"`);
  };

  const handleJsonDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isJsonDropActive) {
      setIsJsonDropActive(true);
    }
  };

  const handleJsonDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof window.Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsJsonDropActive(false);
  };

  const saveLayout = () => {
    const persistedNodes = flowNodes.map((node) => ({
      id: node.id,
      position: node.position,
      measured: node.measured,
      node: {
        ...node.data.node,
        x: node.position.x,
        y: node.position.y
      }
    }));

    window.localStorage.setItem(storageKey, JSON.stringify({ nodes: persistedNodes, edges: flowEdges, sourceNodeIds: nodes.map((node) => node.id) }));
  };

  const restoreLayout = () => {
    if (!nodesInitialized) {
      setDataExchangeStatus(`Wait for ${graphLabel} nodes to finish initializing before restoring layout.`);
      return;
    }

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved) as {
      nodes?: Array<{ id: string; position: { x: number; y: number }; measured?: FlowGraphNode["measured"]; node: GraphNode }>;
      edges?: FlowGraphEdge[];
      sourceNodeIds?: string[];
    };
    const currentSourceIds = nodes.map((node) => node.id);
    const savedIds = parsed.sourceNodeIds ?? parsed.nodes?.map((node) => node.id) ?? [];
    const canRestoreFullGraph =
      savedIds.length === currentSourceIds.length && currentSourceIds.every((id) => savedIds.includes(id));
    const savedNodeMap = new Map((parsed.nodes ?? []).map((node) => [node.id, node]));
    const restoredNodes = parsed.nodes
      ? resolveCollisions(
          canRestoreFullGraph
            ? parsed.nodes.map((item) => ({
                ...createFlowNode({ ...item.node, x: item.position.x, y: item.position.y }, activeDay, duplicateNode, removeNode),
                measured: item.measured,
                position: item.position
              }))
            : initialNodes.map((node) => {
                const savedNode = savedNodeMap.get(node.id);

                if (!savedNode) {
                  return node;
                }

                return syncNodePositionData({
                  ...node,
                  measured: savedNode.measured,
                  position: savedNode.position
                });
              })
        )
      : flowNodes;

    const referenceNodes = initialNodes;
    if (parsed.nodes && !isRestoredLayoutReasonable(restoredNodes, referenceNodes)) {
      window.localStorage.removeItem(storageKey);
      setDataExchangeStatus(`Ignored invalid saved layout for ${graphLabel} and cleared the cached layout.`);
      setFlowNodes(applySelectedClass(referenceNodes, selectedId));
      setFlowEdges(routeEdgesToNearestHandles(initialEdges, referenceNodes));
      requestAnimationFrame(() => {
        reactFlow.fitView({ duration: 0, padding: 0.2 });
      });
      return;
    }

    if (parsed.nodes) {
      setFlowNodes(applySelectedClass(restoredNodes, selectedId));
    }

    if (parsed.edges && canRestoreFullGraph) {
      setFlowEdges(routeEdgesToNearestHandles(parsed.edges, restoredNodes));
    }

    if (parsed.nodes) {
      requestAnimationFrame(() => {
        reactFlow.fitView({ duration: 0, padding: 0.2 });
      });
    }
  };

  useEffect(() => {
    if (window.localStorage.getItem(storageKey)) {
      setDataExchangeStatus(`Saved layout found for ${graphLabel}. Click Restore if you want to apply it.`);
    }
  }, [graphLabel, storageKey]);

  const preventMiddleMouseAutoscroll = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  };

  const openContextMenu = (
    event: MouseEvent | React.MouseEvent,
    target: FlowContextMenu["target"],
    ids: Pick<FlowContextMenu, "nodeId" | "edgeId"> = {}
  ) => {
    event.preventDefault();
    const flowPosition = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      flowX: flowPosition.x,
      flowY: flowPosition.y,
      target,
      ...ids
    });
  };

  const focusSelected = () => {
    if (!nodesInitialized) {
      return;
    }

    const selectedNode = selectedId ? flowNodes.find((node) => node.id === selectedId) : null;
    if (!selectedNode) {
      reactFlow.fitView({ duration: 240, padding: 0.2 });
      return;
    }

    const size = getNodeSize(selectedNode.data.node);
    reactFlow.setCenter(selectedNode.position.x + size.width / 2, selectedNode.position.y + size.height / 2, {
      duration: 240,
      zoom: 0.9
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditingText =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isEditingText) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelection();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteClipboard();
      }

      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clipboard, flowEdges, flowNodes, selectedEdgeId, selectedId]);

  const selectedEdge = selectedEdgeId ? flowEdges.find((edge) => edge.id === selectedEdgeId) : null;
  const selectedFlowNode = selectedId ? flowNodes.find((node) => node.id === selectedId) : null;
  const selectedGraphNode = selectedFlowNode?.data.node ?? null;

  return (
    <div className="panel flow-board" onAuxClick={preventMiddleMouseAutoscroll} onMouseDownCapture={preventMiddleMouseAutoscroll}>
      <div className="flow-canvas">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onFlowNodesChange}
          onEdgesChange={onFlowEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          isValidConnection={isValidConnection}
          onNodeClick={(_, node) => onSelect(node.id)}
          onPaneClick={() => setContextMenu(null)}
          onPaneContextMenu={(event) => openContextMenu(event, "pane")}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onEdgeClick={(_, edge) => setSelectedEdgeId(edge.id)}
          onNodeContextMenu={(event, node) => {
            onSelect(node.id);
            openContextMenu(event, "node", { nodeId: node.id });
          }}
          onEdgeContextMenu={(event, edge) => {
            setSelectedEdgeId(edge.id);
            openContextMenu(event, "edge", { edgeId: edge.id });
          }}
          edgesReconnectable
          fitView
          minZoom={0.25}
          maxZoom={1.5}
          deleteKeyCode={["Backspace", "Delete"]}
          multiSelectionKeyCode={["Shift", "Meta"]}
          selectionOnDrag
          panOnDrag={[1, 2]}
          defaultEdgeOptions={{
            style: {
              stroke: "rgba(160, 190, 255, 0.45)",
              strokeWidth: 2
            }
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Panel className="flow-toolbar" position="top-left">
            <div className="flow-toolbar-row">
              <button type="button" onClick={autoLayout}>Auto Layout</button>
              <button type="button" onClick={() => resolveOverlaps(selectedId)}>Resolve Overlaps</button>
              <button type="button" onClick={focusSelected}>Focus</button>
              <button type="button" onClick={saveLayout}>Save Layout</button>
              <button type="button" onClick={restoreLayout}>Restore</button>
              <button type="button" onClick={undo} disabled={undoStackRef.current.length === 0}>Undo</button>
              <button type="button" onClick={redo} disabled={redoStackRef.current.length === 0}>Redo</button>
              <button type="button" onClick={duplicateSelected} disabled={!selectedId}>Duplicate</button>
              <button type="button" onClick={deleteSelected} disabled={!selectedId}>Delete</button>
            </div>
            <div className="flow-toolbar-row node-palette">
              {NODE_TEMPLATES.map((template) => (
                <button key={template.label} type="button" onClick={() => addNode(template)}>
                  {template.label}
                </button>
              ))}
            </div>
          </Panel>
          <Background gap={28} size={1.1} color="rgba(255,255,255,0.07)" />
          <MiniMap pannable zoomable nodeStrokeColor="rgba(255,255,255,0.18)" />
          <Controls showInteractive />
        </ReactFlow>
      </div>

      {contextMenu ? (
        <div className="flow-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <div className="context-menu-title">
            {contextMenu.target === "node" ? "Node Actions" : contextMenu.target === "edge" ? "Edge Actions" : "Canvas Actions"}
          </div>
          <button type="button" onClick={copySelection} disabled={flowNodes.length === 0 && flowEdges.length === 0}>
            Copy Selection
          </button>
          <button type="button" onClick={() => pasteClipboard({ x: contextMenu.flowX, y: contextMenu.flowY })} disabled={!clipboard}>
            Paste Here
          </button>
          {contextMenu.target === "node" && contextMenu.nodeId ? (
            <>
              <button
                type="button"
                onClick={() => {
                  const nodeId = contextMenu.nodeId;
                  if (!nodeId) {
                    return;
                  }

                  pushHistory();
                  duplicateNode(nodeId);
                  setContextMenu(null);
                }}
              >
                Duplicate Node
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  const nodeId = contextMenu.nodeId;
                  if (!nodeId) {
                    return;
                  }

                  pushHistory();
                  removeNode(nodeId);
                  setContextMenu(null);
                }}
              >
                Delete Node
              </button>
            </>
          ) : null}
          {contextMenu.target === "edge" && contextMenu.edgeId ? (
            <button type="button" className="danger" onClick={() => deleteEdge(contextMenu.edgeId ?? "")}>
              Delete Edge
            </button>
          ) : null}
          <div className="context-menu-title">Add Node Here</div>
          {NODE_TEMPLATES.map((template) => (
            <button key={template.label} type="button" onClick={() => addNode(template, { x: contextMenu.flowX, y: contextMenu.flowY })}>
              {template.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flow-sheet">
        {selectedEdge ? (
          <section className="sheet-section edge-inspector">
            <div className="sheet-header">
              <h3>Selected Edge</h3>
              <span>{selectedEdge.id}</span>
            </div>
            <div className="edge-inspector-grid">
              <label>
                Label
                <input value={String(selectedEdge.label ?? "")} onChange={(event) => updateEdge(selectedEdge.id, { label: event.target.value })} />
              </label>
              <label>
                Type
                <select value={(selectedEdge.type ?? "smoothstep") as EdgeTypeOption} onChange={(event) => updateEdge(selectedEdge.id, { type: event.target.value as EdgeTypeOption })}>
                  {EDGE_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                Source Handle
                <select value={selectedEdge.sourceHandle ?? ""} onChange={(event) => updateEdge(selectedEdge.id, { sourceHandle: event.target.value || undefined })}>
                  {HANDLE_OPTIONS.map((handle) => (
                    <option key={handle || "auto"} value={handle}>{handle || "auto"}</option>
                  ))}
                </select>
              </label>
              <label>
                Target Handle
                <select value={selectedEdge.targetHandle ?? ""} onChange={(event) => updateEdge(selectedEdge.id, { targetHandle: event.target.value || undefined })}>
                  {HANDLE_OPTIONS.map((handle) => (
                    <option key={handle || "auto"} value={handle}>{handle || "auto"}</option>
                  ))}
                </select>
              </label>
              <label className="sheet-checkbox">
                <input type="checkbox" checked={Boolean(selectedEdge.animated)} onChange={(event) => updateEdge(selectedEdge.id, { animated: event.target.checked })} />
                Animated
              </label>
              <button type="button" className="sheet-delete" onClick={() => deleteEdge(selectedEdge.id)}>Delete Edge</button>
            </div>
          </section>
        ) : null}

        {selectedGraphNode ? (
          <section className="sheet-section selected-node-editor">
            <div className="sheet-header">
              <h3>Selected Node Editor</h3>
              <span>{selectedGraphNode.id}</span>
            </div>
            <div className="selected-node-tab-row">
              <button
                type="button"
                className={selectedEditorTab === "content" ? "active" : ""}
                onClick={() => setSelectedEditorTab("content")}
              >
                Content
              </button>
              <button
                type="button"
                className={selectedEditorTab === "gallery" ? "active" : ""}
                onClick={() => setSelectedEditorTab("gallery")}
              >
                Asset Gallery
              </button>
            </div>
            {selectedEditorTab === "content" ? (
              <>
                <div className="selected-node-editor-grid">
                  <label>
                    Title
                    <input value={selectedGraphNode.title} onChange={(event) => updateNodeData(selectedGraphNode.id, { title: event.target.value })} />
                  </label>
                  <label>
                    Summary
                    <textarea value={selectedGraphNode.summary} onChange={(event) => updateNodeData(selectedGraphNode.id, { summary: event.target.value })} />
                  </label>
                  <label>
                    Detail
                    <textarea value={selectedGraphNode.detail} onChange={(event) => updateNodeData(selectedGraphNode.id, { detail: event.target.value })} />
                  </label>
                  <label>
                    Memory Access
                    <input value={selectedGraphNode.memoryAccess} onChange={(event) => updateNodeData(selectedGraphNode.id, { memoryAccess: event.target.value })} />
                  </label>
                  <label>
                    Width
                    <input
                      className="sheet-number"
                      type="number"
                      min="170"
                      value={Math.round(selectedGraphNode.width ?? getNodeSize(selectedGraphNode).width)}
                      onChange={(event) => updateNodeData(selectedGraphNode.id, { width: Number(event.target.value) || undefined })}
                    />
                  </label>
                  <label>
                    Height
                    <input
                      className="sheet-number"
                      type="number"
                      min="112"
                      value={Math.round(selectedGraphNode.height ?? getNodeSize(selectedGraphNode).height)}
                      onChange={(event) => updateNodeData(selectedGraphNode.id, { height: Number(event.target.value) || undefined })}
                    />
                  </label>
                  <label className="sheet-checkbox">
                    <input type="checkbox" checked={selectedGraphNode.confirmed} onChange={(event) => updateNodeData(selectedGraphNode.id, { confirmed: event.target.checked })} />
                    Confirmed Source
                  </label>
                  <label className="sheet-checkbox">
                    <input type="checkbox" checked={Boolean(selectedGraphNode.enterButton)} onChange={(event) => updateNodeData(selectedGraphNode.id, { enterButton: event.target.checked })} />
                    Show Enter Button
                  </label>
                  <label>
                    Image URL
                    <input value={selectedGraphNode.imageSrc ?? ""} onChange={(event) => updateNodeData(selectedGraphNode.id, { imageSrc: event.target.value || undefined })} />
                  </label>
                  <label>
                    Image Alt
                    <input value={selectedGraphNode.imageAlt ?? ""} onChange={(event) => updateNodeData(selectedGraphNode.id, { imageAlt: event.target.value || undefined })} />
                  </label>
                  <label>
                    NPCs
                    <textarea value={serializeList(selectedGraphNode.npcs)} onChange={(event) => updateNodeData(selectedGraphNode.id, { npcs: parseListValue(event.target.value) })} />
                  </label>
                  <label>
                    Interactions
                    <textarea value={serializeList(selectedGraphNode.interactions)} onChange={(event) => updateNodeData(selectedGraphNode.id, { interactions: parseListValue(event.target.value) })} />
                  </label>
                  <label>
                    Bools
                    <textarea value={serializeBoolList(selectedGraphNode.bools)} onChange={(event) => updateNodeData(selectedGraphNode.id, { bools: parseBoolListValue(event.target.value) })} />
                  </label>
                  <label>
                    Unlocks
                    <textarea value={serializeList(selectedGraphNode.unlocks)} onChange={(event) => updateNodeData(selectedGraphNode.id, { unlocks: parseListValue(event.target.value) })} />
                  </label>
                  <label>
                    Query Path
                    <textarea value={serializeList(selectedGraphNode.queryPath)} onChange={(event) => updateNodeData(selectedGraphNode.id, { queryPath: parseListValue(event.target.value) })} />
                  </label>
                </div>
                <div className="selected-node-days">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <label key={day}>
                      Day {day}
                      <input value={selectedGraphNode.dayOpen[day] ?? ""} onChange={(event) => updateNodeDayValue(selectedGraphNode.id, day, event.target.value)} />
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="asset-gallery-panel">
                <p className="graph-json-note">
                  Put reference images into <code>src/assets/gallery</code>. They will appear here after the site reloads or rebuilds.
                </p>
                {selectedGraphNode.imageSrc ? (
                  <div className="asset-gallery-current">
                    <div>
                      <strong>Current node image</strong>
                      <div>{selectedGraphNode.imageSrc}</div>
                    </div>
                    <button type="button" onClick={() => updateNodeData(selectedGraphNode.id, { imageSrc: undefined, imageAlt: undefined })}>
                      Clear Image
                    </button>
                  </div>
                ) : null}
                {ASSET_GALLERY.length === 0 ? (
                  <p className="asset-gallery-empty">No gallery assets found yet.</p>
                ) : (
                  <div className="asset-gallery-grid">
                    {ASSET_GALLERY.map((asset) => {
                      const isActive = selectedGraphNode.imageSrc === asset.url;

                      return (
                        <button
                          key={asset.id}
                          type="button"
                          className={`asset-gallery-card ${isActive ? "active" : ""}`}
                          onClick={() => updateNodeData(selectedGraphNode.id, { imageSrc: asset.url, imageAlt: asset.label })}
                          title={asset.path}
                        >
                          <img src={asset.url} alt={asset.label} />
                          <span>{asset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        ) : null}

        <section className="sheet-section">
          <div className="sheet-header">
            <h3>Node Sheet</h3>
            <span>{flowNodes.length} rows</span>
          </div>
          <div className="sheet-scroller">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Kind</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>X</th>
                  <th>Y</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th>Image</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {flowNodes.map((node) => (
                  <tr key={node.id} className={node.id === selectedId ? "selected-row" : ""}>
                    <td>
                      <button type="button" className="sheet-id-button" onClick={() => onSelect(node.id)}>
                        {node.id}
                      </button>
                    </td>
                    <td>
                      <input value={node.data.node.title} onChange={(event) => updateNodeData(node.id, { title: event.target.value })} />
                    </td>
                    <td>
                      <select value={node.data.node.kind} onChange={(event) => updateNodeKind(node.id, event.target.value as NodeKind)}>
                        {KIND_OPTIONS.map((kind) => (
                          <option key={kind} value={kind}>{kind}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={node.data.node.role ?? ""}
                        onChange={(event) => updateNodeData(node.id, { role: event.target.value as GraphNodeRole })}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={node.data.node.level ?? getNodeLevel(node.data.node)}
                        onChange={(event) => updateNodeData(node.id, { level: Number(event.target.value) as GraphNodeLevel })}
                      >
                        {LEVEL_OPTIONS.map((level) => (
                          <option key={level} value={level}>Level {level}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="sheet-number"
                        type="number"
                        value={Math.round(node.position.x)}
                        onChange={(event) => updateNodePosition(node.id, "x", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="sheet-number"
                        type="number"
                        value={Math.round(node.position.y)}
                        onChange={(event) => updateNodePosition(node.id, "y", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="sheet-number"
                        type="number"
                        value={Math.round(node.data.node.width ?? getNodeSize(node.data.node).width)}
                        onChange={(event) => updateNodeData(node.id, { width: Number(event.target.value) || undefined })}
                      />
                    </td>
                    <td>
                      <input
                        className="sheet-number"
                        type="number"
                        value={Math.round(node.data.node.height ?? getNodeSize(node.data.node).height)}
                        onChange={(event) => updateNodeData(node.id, { height: Number(event.target.value) || undefined })}
                      />
                    </td>
                    <td>
                      <input value={node.data.node.imageSrc ?? ""} onChange={(event) => updateNodeData(node.id, { imageSrc: event.target.value || undefined })} />
                    </td>
                    <td>
                      <input value={node.data.node.summary} onChange={(event) => updateNodeData(node.id, { summary: event.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sheet-section">
          <div className="sheet-header">
            <h3>Edge Sheet</h3>
            <span>{flowEdges.length} rows</span>
          </div>
          <div className="sheet-scroller">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Source Handle</th>
                  <th>Target</th>
                  <th>Target Handle</th>
                  <th>Animated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {flowEdges.map((edge) => (
                  <tr key={edge.id} className={edge.id === selectedEdgeId ? "selected-row" : ""}>
                    <td>
                      <button type="button" className="sheet-id-button" onClick={() => setSelectedEdgeId(edge.id)}>
                        {edge.id}
                      </button>
                    </td>
                    <td>
                      <input value={String(edge.label ?? "")} onChange={(event) => updateEdge(edge.id, { label: event.target.value })} />
                    </td>
                    <td>
                      <select value={(edge.type ?? "smoothstep") as EdgeTypeOption} onChange={(event) => updateEdge(edge.id, { type: event.target.value as EdgeTypeOption })}>
                        {EDGE_TYPE_OPTIONS.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={edge.source} onChange={(event) => updateEdge(edge.id, { source: event.target.value })}>
                        {flowNodes.map((node) => (
                          <option key={node.id} value={node.id}>{node.data.node.title}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={edge.sourceHandle ?? ""} onChange={(event) => updateEdge(edge.id, { sourceHandle: event.target.value || undefined })}>
                        {HANDLE_OPTIONS.map((handle) => (
                          <option key={handle || "auto"} value={handle}>{handle || "auto"}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={edge.target} onChange={(event) => updateEdge(edge.id, { target: event.target.value })}>
                        {flowNodes.map((node) => (
                          <option key={node.id} value={node.id}>{node.data.node.title}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={edge.targetHandle ?? ""} onChange={(event) => updateEdge(edge.id, { targetHandle: event.target.value || undefined })}>
                        {HANDLE_OPTIONS.map((handle) => (
                          <option key={handle || "auto"} value={handle}>{handle || "auto"}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input type="checkbox" checked={Boolean(edge.animated)} onChange={(event) => updateEdge(edge.id, { animated: event.target.checked })} />
                    </td>
                    <td>
                      <button type="button" className="sheet-delete" onClick={() => deleteEdge(edge.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className={`sheet-section graph-json ${isJsonDropActive ? "is-drop-active" : ""}`}
          onDrop={handleJsonDrop}
          onDragOver={handleJsonDragOver}
          onDragEnter={handleJsonDragOver}
          onDragLeave={handleJsonDragLeave}
        >
          <div className="sheet-header">
            <h3>Data Exchange</h3>
            <span>json / workbook</span>
          </div>
          <div className="graph-json-body">
            <div className="draft-status-row">
              <span className={`draft-status-pill ${hasDraftChanges ? "is-dirty" : "is-clean"}`}>
                {hasDraftChanges ? "Draft changed" : "Matches seed"}
              </span>
              <span className="draft-status-copy">
                Workbook sharing is file-based. Teammates should upload the newest export to Drive.
              </span>
            </div>
            <p className="graph-json-note">
              Recommended workflow: edit here, export workbook, then upload the latest file to shared Google Drive.
            </p>
            <label className="editor-name-field">
              Editor Name
              <input value={editorName} onChange={(event) => setEditorName(event.target.value)} placeholder="Optional name for export metadata" />
            </label>
            <div className="graph-json-actions">
              <button type="button" onClick={loadCurrentJson}>Load Current JSON</button>
              <button type="button" onClick={exportJsonFile}>Export JSON</button>
              <button type="button" onClick={importJson}>Import JSON</button>
              <button type="button" onClick={exportWorkbookFile}>Export Excel Workbook</button>
              <button type="button" onClick={downloadSeedWorkbookFile}>Download Seed Workbook</button>
              <button type="button" onClick={openWorkbookPicker}>Import Excel Workbook</button>
            </div>
            <input
              ref={workbookInputRef}
              className="hidden-file-input"
              type="file"
              accept=".xls,.xml"
              onChange={importWorkbookFile}
            />
            {dataExchangeStatus ? <div className="graph-import-status">{dataExchangeStatus}</div> : null}
            <div className="json-drop-hint">
              Drag and drop a `.json` file here to load the full site document and refresh every graph from one source of truth.
            </div>
            <textarea value={jsonBuffer} onChange={(event) => setJsonBuffer(event.target.value)} placeholder="Load current JSON, edit it, then import." />
          </div>
        </section>
      </div>
    </div>
  );
}
