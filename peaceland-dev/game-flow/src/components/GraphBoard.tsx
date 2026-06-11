import type { GraphEdge, GraphNode, NodeKind } from "../types/graph";

const colorClassByKind: Record<NodeKind, string> = {
  location: "location",
  collectable: "collectable",
  "interaction-trigger": "interaction-trigger",
  dialog: "dialog",
  minigame: "minigame",
  "memory-entry": "memory-entry",
  "npc-gate": "npc-gate",
  state: "state",
  scene: "scene",
  trigger: "trigger"
};

function getDefaultLevel(node: GraphNode) {
  if (node.level) {
    return node.level;
  }

  if (node.kind === "location" || node.kind === "scene") {
    return 1;
  }

  if (node.kind === "collectable" || node.kind === "dialog" || node.kind === "minigame" || node.kind === "state") {
    return 2;
  }

  return 3;
}

interface GraphBoardProps {
  edges: GraphEdge[];
  nodes: GraphNode[];
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
  fadedMode: "all" | "confirmed" | "skeleton";
}

export function GraphBoard({
  edges,
  nodes,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  fadedMode
}: GraphBoardProps) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div className="board">
      <svg viewBox="0 0 1100 980" preserveAspectRatio="none" aria-hidden="true">
        {edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;

          const startX = from.x + 90;
          const startY = from.y + 55;
          const endX = to.x + 90;
          const endY = to.y + 20;
          const controlY = (startY + endY) / 2;

          return (
            <path
              key={edge.id}
              className="edge"
              d={`M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`}
            />
          );
        })}
      </svg>

      {nodes.map((node) => {
        const isSelected = selectedId === node.id;
        const isExpanded = expandedIds.has(node.id);
        const faded =
          fadedMode === "all" ? false : fadedMode === "confirmed" ? !node.confirmed : node.confirmed;

        return (
          <button
            key={node.id}
            type="button"
            className={[
              "node",
              colorClassByKind[node.kind],
              `level-${getDefaultLevel(node)}`,
              node.role ? `role-${node.role}` : "",
              isSelected ? "active" : "",
              isExpanded ? "expanded" : "",
              faded ? "faded" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ left: node.x, top: node.y }}
            onClick={() => onSelect(node.id)}
            onDoubleClick={() => onToggleExpand(node.id)}
          >
            <div className="node-meta">{node.kind}</div>
            <h3 className="node-title">{node.title}</h3>
            <div className="node-sub">{node.summary}</div>
          </button>
        );
      })}
    </div>
  );
}
