import { useEffect, useState } from "react";
import { DetailsPanel } from "../../components/DetailsPanel";
import { FlowGraphBoard } from "../../components/FlowGraphBoard";
import type { GraphDocument, SiteGraphDocument } from "../../types/graph";
import { updateNodeInDocument } from "../../utils/siteGraphDocument";

interface RJMemoryViewProps {
  document: GraphDocument;
  hasSiteDraftChanges: boolean;
  onDocumentChange: (nextDocument: GraphDocument) => void;
  onSiteDocumentChange: (nextDocument: SiteGraphDocument) => void;
  seedDocument: GraphDocument;
  siteDocument: SiteGraphDocument;
}

export function RJMemoryView({
  document,
  hasSiteDraftChanges,
  onDocumentChange,
  onSiteDocumentChange,
  seedDocument,
  siteDocument
}: RJMemoryViewProps) {
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
        boardId="rj-memory"
        edges={document.edges}
        graphId="rj-memory"
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
        activeDay={2}
        dayNote="R&J is one of the Days 2-4 memory routes."
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
