import type { OverallState } from "../types/graph";

interface NavigationPanelProps {
  filterText: string;
  focusedMode: "all" | "confirmed" | "skeleton";
  nodeTitles: Array<{ id: string; title: string; active: boolean }>;
  overallState: OverallState;
  onSearchChange: (value: string) => void;
  onNodeSelect: (nodeId: string) => void;
}

export function NavigationPanel({
  filterText,
  focusedMode,
  nodeTitles,
  overallState,
  onSearchChange,
  onNodeSelect
}: NavigationPanelProps) {
  return (
    <aside className="panel navpanel">
      <section className="panel-section">
        <h3>Navigation</h3>
        <input
          className="search"
          type="text"
          value={filterText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search node name..."
        />
        <div className="nav-list">
          {nodeTitles.map((node) => (
            <button
              key={node.id}
              type="button"
              className={`nav-button ${node.active ? "active" : ""}`}
              onClick={() => onNodeSelect(node.id)}
            >
              {node.title}
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Overall Panel</h3>
        <p className="empty">Simulated player-state tracking across present days, memory entry, choices, notebook, and ending readiness.</p>
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
        <h3>Focus</h3>
        <p className="empty">
          Current mode: <strong>{focusedMode}</strong>
        </p>
      </section>
    </aside>
  );
}
