import { useState } from "react";
import { DetailsPanel } from "../../components/DetailsPanel";
import { GraphBoard } from "../../components/GraphBoard";
import { rjEdges, rjNodes } from "../../data/rjMemoryData";

export function RJMemoryView() {
  const [selectedId, setSelectedId] = useState<string | null>(rjNodes[0]?.id ?? null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const selectedNode = rjNodes.find((node) => node.id === selectedId) ?? null;

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
          <h2>R&amp;J Memory</h2>
          <p>
            This view is aligned to <code>RJ_GAMEPLAY_GRAPH_DRAFT.md</code>. It preserves the present museum intro,
            Jovan letter sequence, letter puzzle, Ruzica house section, sneaking sequence, and return-to-museum
            aftermath.
          </p>
        </section>
      </div>
      <GraphBoard
        edges={rjEdges}
        nodes={rjNodes}
        selectedId={selectedId}
        expandedIds={expandedIds}
        onSelect={setSelectedId}
        onToggleExpand={toggleExpand}
        fadedMode="all"
      />
      <DetailsPanel activeDay={2} selectedNode={selectedNode} dayNote="R&J is one of the Days 2-4 memory routes." />
    </div>
  );
}
