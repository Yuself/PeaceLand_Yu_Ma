import { useMemo, useState } from "react";
import { dayNotes, initialOverallState, presentEdges, presentNodes } from "../../data/presentMapData";
import type { GraphEdge, PresentCluster, PresentNode } from "../../types/graph";

type FocusMode = "all" | "confirmed" | "skeleton";

type PositionedNode = PresentNode & {
  left: number;
  top: number;
  visible: boolean;
  connectedIds: string[];
};

const CLUSTER_LAYOUT: Record<PresentCluster, { x: number; y: number }> = {
  hub: { x: 0.5, y: 0.42 },
  town: { x: 0.24, y: 0.28 },
  museum: { x: 0.78, y: 0.27 },
  artifact: { x: 0.22, y: 0.74 },
  war: { x: 0.78, y: 0.74 },
  state: { x: 0.52, y: 0.86 }
};

const BOARD_WIDTH = 1480;
const BOARD_HEIGHT = 980;

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

function computeLayout(nodes: PresentNode[], edges: GraphEdge[], selectedId: string | null, focusMode: FocusMode) {
  const adjacency = buildAdjacency(edges);
  const selectedNeighbors = selectedId ? Array.from(adjacency.get(selectedId) ?? []) : [];
  const focusIds = new Set(selectedId ? [selectedId, ...selectedNeighbors] : []);

  const visibleNodes = nodes.filter((node) => filterNodeByMode(node, focusMode));
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const majorNodes = visibleNodes.filter((node) => node.emphasis === "major");
  const minorNodes = visibleNodes.filter((node) => node.emphasis === "minor");

  const positions = new Map<string, { left: number; top: number }>();

  if (!selectedId || !visibleIds.has(selectedId)) {
    for (const node of majorNodes) {
      const cluster = CLUSTER_LAYOUT[node.cluster];
      positions.set(node.id, {
        left: cluster.x * BOARD_WIDTH,
        top: cluster.y * BOARD_HEIGHT
      });
    }

    for (const node of minorNodes) {
      const parent = visibleNodes.find((item) => item.id === node.parentId) ?? visibleNodes.find((item) => item.cluster === node.cluster && item.emphasis === "major");
      const siblings = minorNodes.filter((item) => item.parentId === node.parentId && item.cluster === node.cluster);
      const index = siblings.findIndex((item) => item.id === node.id);
      const count = Math.max(1, siblings.length);
      const angle = (-Math.PI / 2) + (index / count) * Math.PI * 1.8;
      const radius = parent?.kind === "location" ? 142 : 118;
      const parentPoint = parent ? positions.get(parent.id) : undefined;
      const fallback = CLUSTER_LAYOUT[node.cluster];
      const originX = parentPoint?.left ?? fallback.x * BOARD_WIDTH;
      const originY = parentPoint?.top ?? fallback.y * BOARD_HEIGHT;

      positions.set(node.id, {
        left: originX + Math.cos(angle) * radius,
        top: originY + Math.sin(angle) * radius
      });
    }
  } else {
    const selectedNode = visibleNodes.find((node) => node.id === selectedId) ?? null;
    if (selectedNode) {
      positions.set(selectedNode.id, { left: BOARD_WIDTH / 2, top: BOARD_HEIGHT / 2 });
      const relatedNodes = visibleNodes.filter((node) => focusIds.has(node.id) && node.id !== selectedNode.id);
      const count = Math.max(1, relatedNodes.length);

      relatedNodes.forEach((node, index) => {
        const angle = (-Math.PI / 2) + (index / count) * Math.PI * 2;
        const radius = node.emphasis === "major" ? 280 : 215;
        positions.set(node.id, {
          left: BOARD_WIDTH / 2 + Math.cos(angle) * radius,
          top: BOARD_HEIGHT / 2 + Math.sin(angle) * radius
        });
      });
    }
  }

  const positionedNodes: PositionedNode[] = visibleNodes.map((node) => {
    const point = positions.get(node.id) ?? { left: BOARD_WIDTH / 2, top: BOARD_HEIGHT / 2 };
    const connectedIds = Array.from(adjacency.get(node.id) ?? []).filter((id) => visibleIds.has(id));
    const visible = !selectedId || !visibleIds.has(selectedId) || focusIds.has(node.id);

    return {
      ...node,
      left: point.left,
      top: point.top,
      connectedIds,
      visible
    };
  });

  const visiblePositionIds = new Set(positionedNodes.filter((node) => node.visible).map((node) => node.id));
  const visibleEdges = edges.filter((edge) => visiblePositionIds.has(edge.from) && visiblePositionIds.has(edge.to));

  return { adjacency, positionedNodes, visibleEdges };
}

export function PresentMapView() {
  const [activeDay, setActiveDay] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [focusMode, setFocusMode] = useState<FocusMode>("all");
  const [navCollapsed, setNavCollapsed] = useState(false);

  const overallState = useMemo(() => {
    const state = { ...initialOverallState, currentDay: activeDay };
    state.memoriesEntered = activeDay === 1 ? 1 : activeDay <= 4 ? 2 : activeDay === 5 ? 3 : activeDay >= 7 ? 4 : 3;
    state.endingReady = activeDay === 7;
    state.presentNodesVisited = activeDay <= 2 ? 5 : activeDay <= 4 ? 8 : activeDay <= 6 ? 11 : 13;
    state.dialogueChoicesRecorded = activeDay <= 1 ? 3 : activeDay <= 4 ? 6 : activeDay <= 6 ? 8 : 10;
    state.collectablesRecorded = activeDay <= 1 ? 2 : activeDay <= 4 ? 5 : activeDay <= 6 ? 7 : 9;
    state.notebookEntriesProgressed = activeDay <= 1 ? 2 : activeDay <= 4 ? 4 : activeDay <= 6 ? 6 : 8;
    return state;
  }, [activeDay]);

  const filteredTitles = useMemo(() => {
    const lower = filterText.trim().toLowerCase();
    return presentNodes
      .filter((node) => filterNodeByMode(node, focusMode))
      .filter((node) => !lower || node.title.toLowerCase().includes(lower))
      .map((node) => ({ id: node.id, title: node.title, active: node.id === selectedId }));
  }, [filterText, focusMode, selectedId]);

  const { adjacency, positionedNodes, visibleEdges } = useMemo(
    () => computeLayout(presentNodes, presentEdges, selectedId, focusMode),
    [focusMode, selectedId]
  );

  const selectedNode = positionedNodes.find((node) => node.id === selectedId) ?? null;

  const visibleNodeMap = useMemo(() => {
    return new Map(positionedNodes.map((node) => [node.id, node]));
  }, [positionedNodes]);

  const focusLabel = selectedNode ? `Focused on ${selectedNode.title}` : "Overview";

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

        <div className="panel present-board">
          <svg viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
            {visibleEdges.map((edge) => {
              const from = visibleNodeMap.get(edge.from);
              const to = visibleNodeMap.get(edge.to);

              if (!from || !to || !from.visible || !to.visible) {
                return null;
              }

              return (
                <line
                  key={edge.id}
                  className={`present-edge ${selectedId ? "focused" : ""}`}
                  x1={from.left}
                  y1={from.top}
                  x2={to.left}
                  y2={to.top}
                />
              );
            })}
          </svg>

          <div className={`selected-overlay ${selectedNode ? "open" : ""}`}>
            {selectedNode ? (
              <article className="panel selected-drawer">
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
            ) : null}
          </div>

          {positionedNodes
            .filter((node) => node.visible)
            .map((node) => (
              <button
                key={node.id}
                type="button"
                className={`present-node ${node.kind} ${node.emphasis} ${node.id === selectedId ? "active" : ""}`}
                style={{ left: `${node.left}px`, top: `${node.top}px` }}
                onClick={() => setSelectedId(node.id)}
              >
                <span className="node-meta">{node.confirmed ? "confirmed" : "skeleton"}</span>
                <h3 className="node-title">{node.title}</h3>
                <p className="node-sub present-node-sub">{node.summary}</p>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
