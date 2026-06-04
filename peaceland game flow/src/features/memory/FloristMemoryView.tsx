import { useState } from "react";
import { DetailsPanel } from "../../components/DetailsPanel";
import { GraphBoard } from "../../components/GraphBoard";
import { floristEdges, floristNodes } from "../../data/floristMemoryData";

export function FloristMemoryView() {
  const [selectedId, setSelectedId] = useState<string | null>(floristNodes[0]?.id ?? null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const selectedNode = floristNodes.find((node) => node.id === selectedId) ?? null;

  const toggleExpand = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="memory-layout">
      <div className="memory-intro panel">
        <section className="panel-section">
          <h3>Memory View</h3>
          <h2>Florist Memory</h2>
          <p>
            This view is aligned to <code>FLORIST_GAMEPLAY_GRAPH_DRAFT.md</code>. The node order follows the verified
            florist runtime flow: intro, entry, loop start, Andrej, Danika, Boris, Jeta, Lukas, and the breakdown
            endgame.
          </p>
        </section>
      </div>
      <GraphBoard
        edges={floristEdges}
        nodes={floristNodes}
        selectedId={selectedId}
        expandedIds={expandedIds}
        onSelect={setSelectedId}
        onToggleExpand={toggleExpand}
        fadedMode="all"
      />
      <DetailsPanel activeDay={1} selectedNode={selectedNode} dayNote="Florist is the Day 1 memory route." />
    </div>
  );
}
