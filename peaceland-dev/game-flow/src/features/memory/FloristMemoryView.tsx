import { useEffect, useState } from "react";
import { DetailsPanel } from "../../components/DetailsPanel";
import { FlowGraphBoard } from "../../components/FlowGraphBoard";
import type { GraphDocument, SiteGraphDocument } from "../../types/graph";
import { updateNodeInDocument } from "../../utils/siteGraphDocument";

interface FloristMemoryViewProps {
  document: GraphDocument;
  hasSiteDraftChanges: boolean;
  onDocumentChange: (nextDocument: GraphDocument) => void;
  onSiteDocumentChange: (nextDocument: SiteGraphDocument) => void;
  seedDocument: GraphDocument;
  siteDocument: SiteGraphDocument;
}

export function FloristMemoryView({
  document,
  hasSiteDraftChanges,
  onDocumentChange,
  onSiteDocumentChange,
  seedDocument,
  siteDocument
}: FloristMemoryViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(document.nodes[0]?.id ?? null);
  const selectedNode = document.nodes.find((node) => node.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !document.nodes.some((node) => node.id === selectedId)) {
      setSelectedId(document.nodes[0]?.id ?? null);
    }
  }, [document.nodes, selectedId]);

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
      <FlowGraphBoard
        activeDay={1}
        boardId="florist-memory"
        edges={document.edges}
        graphId="florist-memory"
        hasDraftChanges={hasSiteDraftChanges}
        nodes={document.nodes}
        onGraphChange={onDocumentChange}
        onSiteDocumentChange={onSiteDocumentChange}
        selectedId={selectedId}
        seedEdges={seedDocument.edges}
        seedNodes={seedDocument.nodes}
        siteDocument={siteDocument}
        onSelect={setSelectedId}
      />
      <DetailsPanel
        activeDay={1}
        dayNote="Florist is the Day 1 memory route."
        onNodeSave={(nodeId, patch) =>
          onDocumentChange(
            updateNodeInDocument(document, nodeId, (node) => ({
              ...node,
              ...patch
            }))
          )
        }
        selectedNode={selectedNode}
      />
    </div>
  );
}
