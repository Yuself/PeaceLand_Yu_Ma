import { useEffect, useMemo, useState } from "react";
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
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnConnect
} from "@xyflow/react";
import type { GraphEdge, GraphNode, GraphNodeLevel, GraphNodeRole, NodeKind } from "../types/graph";

type FlowGraphData = {
  node: GraphNode;
  activeDay: number;
  onInspect: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
};

type FlowGraphNode = Node<FlowGraphData, "flowGraphNode">;

type NodeTemplate = {
  kind: NodeKind;
  label: string;
  level: GraphNodeLevel;
  role: GraphNodeRole;
};

interface FlowGraphBoardProps {
  activeDay: number;
  edges: GraphEdge[];
  graphId: string;
  nodes: GraphNode[];
  selectedId: string | null;
  onSelect: (nodeId: string) => void;
}

const NODE_TEMPLATES: NodeTemplate[] = [
  { kind: "scene", label: "Scene", level: 1, role: "scene-change" },
  { kind: "location", label: "Location", level: 1, role: "location" },
  { kind: "dialog", label: "Dialog", level: 2, role: "dialog" },
  { kind: "minigame", label: "Minigame", level: 2, role: "minigame" },
  { kind: "collectable", label: "Collectable", level: 2, role: "collectable" },
  { kind: "interaction-trigger", label: "Interaction", level: 3, role: "interaction-trigger" }
];

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
  const level = getNodeLevel(node);

  if (level === 1) {
    return { width: 286, height: 150 };
  }

  if (level === 2) {
    return { width: 230, height: 128 };
  }

  return { width: 198, height: 112 };
}

function applySelectedClass(nodes: FlowGraphNode[], selectedId: string | null) {
  return nodes.map((node) => ({
    ...node,
    className: node.id === selectedId ? "is-selected" : undefined
  }));
}

function mapEdges(edges: GraphEdge[], nodes: GraphNode[]) {
  const ids = new Set(nodes.map((node) => node.id));

  return edges
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to))
    .map(
      (edge) =>
        ({
          id: edge.id,
          source: edge.from,
          target: edge.to,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18
          }
        }) satisfies Edge
    );
}

function createFlowNode(node: GraphNode, activeDay: number, onInspect: (nodeId: string) => void, onDuplicate: (nodeId: string) => void, onDelete: (nodeId: string) => void): FlowGraphNode {
  return {
    id: node.id,
    type: "flowGraphNode",
    position: { x: node.x, y: node.y },
    data: {
      node,
      activeDay,
      onInspect,
      onDuplicate,
      onDelete
    }
  };
}

function mapNodes(nodes: GraphNode[], activeDay: number, onInspect: (nodeId: string) => void, onDuplicate: (nodeId: string) => void, onDelete: (nodeId: string) => void) {
  return nodes.map((node) => createFlowNode(node, activeDay, onInspect, onDuplicate, onDelete));
}

function layoutWithDagre(nodes: FlowGraphNode[], edges: Edge[]) {
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
  const { node, activeDay, onInspect, onDuplicate, onDelete } = data;
  const level = getNodeLevel(node);

  return (
    <div className={`rf-node-card ${node.kind} level-${level} ${selected ? "selected" : ""}`}>
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="node-toolbar">
          <button type="button" onClick={() => onInspect(node.id)}>Inspect</button>
          <button type="button" onClick={() => onDuplicate(node.id)}>Duplicate</button>
          <button type="button" onClick={() => onDelete(node.id)}>Delete</button>
        </div>
      </NodeToolbar>
      {level === 1 ? <NodeResizer color="rgba(125,179,255,0.72)" isVisible={selected} minWidth={220} minHeight={110} /> : null}
      <Handle type="target" position={Position.Left} />
      <div className="rf-node-top">
        <span className="rf-node-status">{node.role ?? node.kind}</span>
        <span className="rf-node-day">{node.dayOpen[activeDay] ?? "Draft"}</span>
      </div>
      <h3>{node.title}</h3>
      <p>{node.summary}</p>
      <div className="rf-node-footer">
        <span>level {level}</span>
        <button type="button" onClick={() => onInspect(node.id)}>
          Inspect
        </button>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  flowGraphNode: FlowGraphNodeView
};

export function FlowGraphBoard({ activeDay, edges, graphId, nodes, selectedId, onSelect }: FlowGraphBoardProps) {
  const storageKey = `peaceland-flow-layout:${graphId}`;
  const [draftIndex, setDraftIndex] = useState(1);

  const removeNode = (nodeId: string) => {
    setFlowNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));
    setFlowEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };

  const duplicateNode = (nodeId: string) => {
    setFlowNodes((currentNodes) => {
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

      const copy = createFlowNode(copiedGraphNode, activeDay, onSelect, duplicateNode, removeNode);
      return applySelectedClass([...currentNodes, copy], selectedId);
    });
  };

  const initialNodes = useMemo(
    () => applySelectedClass(mapNodes(nodes, activeDay, onSelect, duplicateNode, removeNode), selectedId),
    [activeDay, nodes, onSelect]
  );
  const initialEdges = useMemo(() => mapEdges(edges, nodes), [edges, nodes]);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<FlowGraphNode>(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  useEffect(() => {
    setFlowNodes(initialNodes);
  }, [initialNodes, setFlowNodes]);

  useEffect(() => {
    setFlowNodes((currentNodes) => applySelectedClass(currentNodes, selectedId));
  }, [selectedId, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(initialEdges);
  }, [initialEdges, setFlowEdges]);

  const onConnect: OnConnect = (connection: Connection) => {
    setFlowEdges((currentEdges) =>
      addEdge(
        {
          ...connection,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 }
        },
        currentEdges
      )
    );
  };

  const autoLayout = () => {
    setFlowNodes((currentNodes) => applySelectedClass(layoutWithDagre(currentNodes, flowEdges), selectedId));
  };

  const addNode = (template: NodeTemplate) => {
    const graphNode = makeNodeFromTemplate(template, draftIndex);
    setDraftIndex((value) => value + 1);
    setFlowNodes((currentNodes) =>
      applySelectedClass([...currentNodes, createFlowNode(graphNode, activeDay, onSelect, duplicateNode, removeNode)], selectedId)
    );
  };

  const deleteSelected = () => {
    if (selectedId) {
      removeNode(selectedId);
    }
  };

  const duplicateSelected = () => {
    if (selectedId) {
      duplicateNode(selectedId);
    }
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

    window.localStorage.setItem(storageKey, JSON.stringify({ nodes: persistedNodes, edges: flowEdges }));
  };

  const restoreLayout = () => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved) as {
      nodes?: Array<{ id: string; position: { x: number; y: number }; measured?: FlowGraphNode["measured"]; node: GraphNode }>;
      edges?: Edge[];
    };

    if (parsed.nodes) {
      const restoredNodes = parsed.nodes.map((item) => ({
        ...createFlowNode({ ...item.node, x: item.position.x, y: item.position.y }, activeDay, onSelect, duplicateNode, removeNode),
        measured: item.measured,
        position: item.position
      }));

      setFlowNodes(applySelectedClass(restoredNodes, selectedId));
    }

    if (parsed.edges) {
      setFlowEdges(parsed.edges);
    }
  };

  const preventMiddleMouseAutoscroll = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1) {
      event.preventDefault();
    }
  };

  return (
    <div className="panel flow-board" onAuxClick={preventMiddleMouseAutoscroll} onMouseDownCapture={preventMiddleMouseAutoscroll}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onSelect(node.id)}
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
          <button type="button" onClick={autoLayout}>Auto Layout</button>
          <button type="button" onClick={saveLayout}>Save Layout</button>
          <button type="button" onClick={restoreLayout}>Restore</button>
          <button type="button" onClick={duplicateSelected} disabled={!selectedId}>Duplicate</button>
          <button type="button" onClick={deleteSelected} disabled={!selectedId}>Delete</button>
        </Panel>
        <Panel className="node-palette" position="top-right">
          {NODE_TEMPLATES.map((template) => (
            <button key={template.label} type="button" onClick={() => addNode(template)}>
              {template.label}
            </button>
          ))}
        </Panel>
        <Background gap={28} size={1.1} color="rgba(255,255,255,0.07)" />
        <MiniMap pannable zoomable nodeStrokeColor="rgba(255,255,255,0.18)" />
        <Controls showInteractive />
      </ReactFlow>
    </div>
  );
}
