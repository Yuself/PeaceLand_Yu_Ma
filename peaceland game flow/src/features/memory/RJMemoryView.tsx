import { useState } from "react";
import { DetailsPanel } from "../../components/DetailsPanel";
import { FlowGraphBoard } from "../../components/FlowGraphBoard";
import { rjEdges, rjNodes } from "../../data/rjMemoryData";

export function RJMemoryView() {
  const [selectedId, setSelectedId] = useState<string | null>(rjNodes[0]?.id ?? null);
  const selectedNode = rjNodes.find((node) => node.id === selectedId) ?? null;

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
      <FlowGraphBoard
        activeDay={2}
        edges={rjEdges}
        graphId="rj-memory"
        nodes={rjNodes}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <DetailsPanel activeDay={2} selectedNode={selectedNode} dayNote="R&J is one of the Days 2-4 memory routes." />
    </div>
  );
}
