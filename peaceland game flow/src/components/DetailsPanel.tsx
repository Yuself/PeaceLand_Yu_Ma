import type { GraphNode } from "../types/graph";

interface DetailsPanelProps {
  activeDay: number;
  selectedNode: GraphNode | null;
  dayNote: string;
  onEnterMemory?: () => void;
}

export function DetailsPanel({ activeDay, selectedNode, dayNote, onEnterMemory }: DetailsPanelProps) {
  if (!selectedNode) {
    return (
      <aside className="panel sidebar hidden">
        <section className="panel-section">
          <h3>Selected Node</h3>
          <p className="empty">Click a node to open its detail panel.</p>
        </section>
      </aside>
    );
  }

  return (
    <aside className="panel sidebar">
      <section className="panel-section">
        <h3>Selected Node</h3>
        <h2>{selectedNode.title}</h2>
        <p>{selectedNode.detail}</p>
        <div className="facts">
          <div className="fact"><strong>Node Type</strong><span>{selectedNode.kind}</span></div>
          <div className="fact"><strong>Source Status</strong><span>{selectedNode.confirmed ? "Confirmed from current docs" : "Skeleton / placeholder structure"}</span></div>
          <div className="fact"><strong>Day Open</strong><span>{selectedNode.dayOpen[activeDay] ?? "Placeholder"}</span></div>
          <div className="fact"><strong>Memory Access</strong><span>{selectedNode.memoryAccess}</span></div>
        </div>
        {selectedNode.enterButton ? (
          <button type="button" className="memory-action visible" onClick={onEnterMemory}>
            Enter Memory (Day {activeDay})
          </button>
        ) : null}
      </section>

      <section className="panel-section">
        <h3>Day Snapshot</h3>
        <p>{dayNote}</p>
      </section>

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
        <h3>Choice Record</h3>
        <p className="empty">Dialogue and collectable tracking are modeled as true/false path states.</p>
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
        <h3>Query Path Panel</h3>
        <ul>
          {selectedNode.queryPath.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
