import { useEffect, useMemo, useState } from "react";
import { DetailsPanel } from "../../components/DetailsPanel";
import { FlowGraphBoard } from "../../components/FlowGraphBoard";
import { dayNotes, initialOverallState, presentEdges, presentNodes } from "../../data/presentMapData";
import type { GraphDocument, GraphEdge, GraphNode, SiteGraphDocument } from "../../types/graph";
import { updateNodeInDocument } from "../../utils/siteGraphDocument";

type FocusMode = "all" | "confirmed" | "skeleton";

function buildAdjacency(edges: GraphEdge[]) {
  const adjacency = new Map<string, Set<string>>();

  for (const edge of edges) {
    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, new Set());
    }

    if (!adjacency.has(edge.to)) {
      adjacency.set(edge.to, new Set());
    }

    adjacency.get(edge.from)?.add(edge.to);
    adjacency.get(edge.to)?.add(edge.from);
  }

  return adjacency;
}

function filterNodeByMode(node: GraphNode, focusMode: FocusMode) {
  if (focusMode === "confirmed") {
    return node.confirmed;
  }

  if (focusMode === "skeleton") {
    return !node.confirmed;
  }

  return true;
}

interface PresentMapViewProps {
  document: GraphDocument;
  hasSiteDraftChanges: boolean;
  onDocumentChange: (nextDocument: GraphDocument) => void;
  onSiteDocumentChange: (nextDocument: SiteGraphDocument) => void;
  seedDocument: GraphDocument;
  siteDocument: SiteGraphDocument;
}

export function PresentMapView({
  document,
  hasSiteDraftChanges,
  onDocumentChange,
  onSiteDocumentChange,
  seedDocument,
  siteDocument
}: PresentMapViewProps) {
  const [activeDay, setActiveDay] = useState(initialOverallState.currentDay);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<FocusMode>("all");
  const [filterText, setFilterText] = useState("");
  const [navCollapsed, setNavCollapsed] = useState(false);

  const overallState = useMemo(
    () => ({
      ...initialOverallState,
      currentDay: activeDay
    }),
    [activeDay]
  );

  const adjacency = useMemo(() => buildAdjacency(document.edges), [document.edges]);

  const visibleNodes = useMemo(
    () => document.nodes.filter((node) => filterNodeByMode(node, focusMode)),
    [document.nodes, focusMode]
  );

  const visibleNodeMap = useMemo(
    () => new Map(visibleNodes.map((node) => [node.id, node])),
    [visibleNodes]
  );

  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    return document.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to));
  }, [document.edges, visibleNodes]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const stillVisible = visibleNodes.some((node) => node.id === selectedId);
    if (!stillVisible) {
      setSelectedId(null);
    }
  }, [selectedId, visibleNodes]);

  const selectedNode = selectedId ? visibleNodeMap.get(selectedId) ?? null : null;

  const filteredTitles = useMemo(() => {
    const normalized = filterText.trim().toLowerCase();

    return visibleNodes
      .filter((node) => (normalized ? node.title.toLowerCase().includes(normalized) : true))
      .map((node) => ({
        id: node.id,
        title: node.title,
        active: node.id === selectedId
      }));
  }, [filterText, selectedId, visibleNodes]);

  const focusLabel = useMemo(() => {
    switch (focusMode) {
      case "confirmed":
        return "Showing confirmed nodes only";
      case "skeleton":
        return "Showing placeholder and unconfirmed nodes";
      default:
        return "Showing all present graph nodes";
    }
  }, [focusMode]);

  const maybeWarnAboutContextReset = (label: string) => {
    if (!hasSiteDraftChanges) {
      return true;
    }

    return window.confirm(
      `Current ${label} changes will keep your draft, but the visible context may shift. Continue?`
    );
  };

  const handleDayChange = (nextDay: number) => {
    if (nextDay === activeDay) {
      return;
    }

    if (!maybeWarnAboutContextReset("day")) {
      return;
    }

    setActiveDay(nextDay);
  };

  const handleFocusChange = (nextFocus: FocusMode) => {
    if (nextFocus === focusMode) {
      return;
    }

    if (!maybeWarnAboutContextReset("focus")) {
      return;
    }

    setFocusMode(nextFocus);
  };

  return (
    <section className="present-shell">
      <div className="controls present-controls">
        <div className="control-group">
          <label htmlFor="day-select">Day</label>
          <select id="day-select" value={activeDay} onChange={(event) => handleDayChange(Number(event.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <button type="button" onClick={() => setSelectedId(null)}>
            Graph View
          </button>
        </div>
        <div className="control-group">
          <label htmlFor="focus-select">Focus</label>
          <select
            id="focus-select"
            value={focusMode}
            onChange={(event) => handleFocusChange(event.target.value as FocusMode)}
          >
            <option value="all">All Nodes</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="skeleton">Skeleton / Placeholder</option>
          </select>
        </div>
        <div className="control-group present-mode-note">
          <span>{focusLabel}</span>
        </div>
      </div>

      <div className={`present-layout ${navCollapsed ? "nav-collapsed" : ""}`}>
        <aside className={`panel present-nav ${navCollapsed ? "collapsed" : ""}`}>
          <div className="present-nav-top">
            <button
              type="button"
              className="collapse-toggle"
              onClick={() => setNavCollapsed((value) => !value)}
              aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {navCollapsed ? ">>" : "<<"}
            </button>
            {!navCollapsed ? <h3>Navigation</h3> : null}
          </div>

          {!navCollapsed ? (
            <>
              <section className="panel-section">
                <input
                  className="search"
                  type="text"
                  value={filterText}
                  onChange={(event) => setFilterText(event.target.value)}
                  placeholder="Search node name..."
                />
                <div className="nav-list">
                  {filteredTitles.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className={`nav-button ${node.active ? "active" : ""}`}
                      onClick={() => setSelectedId(node.id)}
                    >
                      {node.title}
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel-section">
                <h3>Overall Panel</h3>
                <p className="empty">Present-side simulated progress across day routing, memories, notebook, and ending state.</p>
                <div className="overall-grid">
                  <div className="overall-item"><strong>Current Day</strong><span>{overallState.currentDay}</span></div>
                  <div className="overall-item"><strong>Memories Entered</strong><span>{overallState.memoriesEntered}</span></div>
                  <div className="overall-item"><strong>Present Nodes Visited</strong><span>{overallState.presentNodesVisited}</span></div>
                  <div className="overall-item"><strong>Choices Recorded</strong><span>{overallState.dialogueChoicesRecorded}</span></div>
                  <div className="overall-item"><strong>Collectables Recorded</strong><span>{overallState.collectablesRecorded}</span></div>
                  <div className="overall-item"><strong>Notebook Progress</strong><span>{overallState.notebookEntriesProgressed}</span></div>
                  <div className="overall-item"><strong>Stat Affected</strong><span>{overallState.statAffected ? "True" : "False"}</span></div>
                  <div className="overall-item"><strong>Ending Ready</strong><span>{overallState.endingReady ? "True" : "False"}</span></div>
                </div>
              </section>

              <section className="panel-section">
                <h3>Current Day</h3>
                <p>{dayNotes[activeDay]}</p>
              </section>
            </>
          ) : null}
        </aside>

        <FlowGraphBoard
          activeDay={activeDay}
          boardId="present"
          edges={visibleEdges}
          graphId="present"
          hasDraftChanges={hasSiteDraftChanges}
          nodes={visibleNodes}
          onGraphChange={onDocumentChange}
          onSiteDocumentChange={onSiteDocumentChange}
          selectedId={selectedId}
          seedEdges={seedDocument.edges}
          seedNodes={seedDocument.nodes}
          siteDocument={siteDocument}
          onSelect={setSelectedId}
        />

        <DetailsPanel
          activeDay={activeDay}
          connectedNodes={Array.from(adjacency.get(selectedNode?.id ?? "") ?? [])
            .map((id) => {
              const target = visibleNodeMap.get(id);
              return target ? { id, title: target.title } : null;
            })
            .filter((item): item is { id: string; title: string } => Boolean(item))}
          dayNote={dayNotes[activeDay]}
          onClose={() => setSelectedId(null)}
          onEnterMemory={
            selectedNode?.enterButton
              ? () => window.alert(`Prototype: enter memory flow for Day ${activeDay} from "${selectedNode.title}".`)
              : undefined
          }
          onNodeSave={(nodeId, patch) =>
            onDocumentChange(
              updateNodeInDocument(document, nodeId, (node) => ({
                ...node,
                ...patch
              }))
            )
          }
          onSelectConnectedNode={setSelectedId}
          selectedNode={selectedNode}
          variant="selected-panel"
        />
      </div>
    </section>
  );
}
