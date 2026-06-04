import { useMemo, useState } from "react";
import { FlowGraphBoard } from "../../components/FlowGraphBoard";
import { dayNotes, initialOverallState, presentEdges, presentNodes } from "../../data/presentMapData";
import type { GraphEdge, PresentNode } from "../../types/graph";

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

function filterNodeByMode(node: PresentNode, focusMode: FocusMode) {
  if (focusMode === "confirmed") {
    return node.confirmed;
  }

  if (focusMode === "skeleton") {
    return !node.confirmed;
  }

  return true;
}

export function PresentMapView() {
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

  const adjacency = useMemo(() => buildAdjacency(presentEdges), []);

  const visibleNodes = useMemo(
    () => presentNodes.filter((node) => filterNodeByMode(node, focusMode)),
    [focusMode]
  );

  const visibleNodeMap = useMemo(
    () => new Map(visibleNodes.map((node) => [node.id, node])),
    [visibleNodes]
  );

  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    return presentEdges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to));
  }, [visibleNodes]);

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

  return (
    <section className="present-shell">
      <div className="controls present-controls">
        <div className="control-group">
          <label htmlFor="day-select">Day</label>
          <select id="day-select" value={activeDay} onChange={(event) => setActiveDay(Number(event.target.value))}>
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
            onChange={(event) => setFocusMode(event.target.value as FocusMode)}
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
          edges={visibleEdges}
          graphId="present"
          nodes={visibleNodes}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <aside className="panel selected-panel">
          {selectedNode ? (
            <article>
              <div className="selected-drawer-top">
                <div>
                  <h3>Selected Node</h3>
                  <h2>{selectedNode.title}</h2>
                </div>
                <button type="button" className="close-drawer" onClick={() => setSelectedId(null)} aria-label="Close selected node">
                  x
                </button>
              </div>
              <p>{selectedNode.detail}</p>
              <div className="facts">
                <div className="fact"><strong>Node Type</strong><span>{selectedNode.kind}</span></div>
                <div className="fact"><strong>Source Status</strong><span>{selectedNode.confirmed ? "Confirmed" : "Skeleton / Placeholder"}</span></div>
                <div className="fact"><strong>Day Open</strong><span>{selectedNode.dayOpen[activeDay] ?? "Placeholder"}</span></div>
                <div className="fact"><strong>Memory Access</strong><span>{selectedNode.memoryAccess}</span></div>
              </div>

              {selectedNode.enterButton ? (
                <button
                  type="button"
                  className="memory-action visible"
                  onClick={() => window.alert(`Prototype: enter memory flow for Day ${activeDay} from "${selectedNode.title}".`)}
                >
                  Enter Memory (Day {activeDay})
                </button>
              ) : null}

              <section className="panel-section">
                <h3>NPCs / Availability</h3>
                <div className="chips">
                  {selectedNode.npcs.map((npc) => (
                    <span key={npc} className="chip">
                      {npc}
                    </span>
                  ))}
                </div>
              </section>

              <section className="panel-section">
                <h3>Interactions</h3>
                <ul>
                  {selectedNode.interactions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="panel-section">
                <h3>Choice / Collect State</h3>
                <div className="bool-grid">
                  {selectedNode.bools.map(([label, value]) => (
                    <div key={label} className="bool-item">
                      <strong>{label}</strong>
                      <span className={value ? "status-true" : "status-false"}>{value ? "True" : "False"}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel-section">
                <h3>NPC Layer Unlocks</h3>
                <ul>
                  {selectedNode.unlocks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="panel-section">
                <h3>Query Path</h3>
                <ul>
                  {selectedNode.queryPath.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="panel-section">
                <h3>Connected Nodes</h3>
                <div className="chips">
                  {Array.from(adjacency.get(selectedNode.id) ?? []).map((id) => {
                    const target = visibleNodeMap.get(id);
                    if (!target) {
                      return null;
                    }

                    return (
                      <button key={id} type="button" className="chip chip-button" onClick={() => setSelectedId(id)}>
                        {target.title}
                      </button>
                    );
                  })}
                </div>
              </section>
            </article>
          ) : (
            <div className="selected-placeholder">
              <h3>Selected Node</h3>
              <p>Select a node to inspect details, connected nodes, and day-specific state.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
