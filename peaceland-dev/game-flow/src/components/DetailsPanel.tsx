import { useEffect, useState } from "react";
import type { GraphNode } from "../types/graph";

type ConnectedNode = {
  id: string;
  title: string;
};

interface DetailsPanelProps {
  activeDay: number;
  connectedNodes?: ConnectedNode[];
  dayNote: string;
  onClose?: () => void;
  onEnterMemory?: () => void;
  onNodeSave?: (nodeId: string, patch: Partial<GraphNode>) => void;
  onSelectConnectedNode?: (nodeId: string) => void;
  selectedNode: GraphNode | null;
  variant?: "sidebar" | "selected-panel";
}

function serializeList(values: string[]) {
  return values.join("\n");
}

function parseListValue(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeBoolList(values: Array<[string, boolean]>) {
  return values.map(([label, boolValue]) => `${label}: ${boolValue ? "true" : "false"}`).join("\n");
}

function parseBoolListValue(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.lastIndexOf(":");
      if (separatorIndex === -1) {
        return [line, false] as [string, boolean];
      }

      const label = line.slice(0, separatorIndex).trim() || "Flag";
      const boolValue = line.slice(separatorIndex + 1).trim().toLowerCase();
      return [label, ["true", "1", "yes"].includes(boolValue)] as [string, boolean];
    });
}

function cloneDraftNode(node: GraphNode): GraphNode {
  return {
    ...node,
    dayOpen: { ...node.dayOpen },
    npcs: [...node.npcs],
    interactions: [...node.interactions],
    bools: node.bools.map(([label, value]) => [label, value] as [string, boolean]),
    unlocks: [...node.unlocks],
    queryPath: [...node.queryPath]
  };
}

export function DetailsPanel({
  activeDay,
  connectedNodes = [],
  dayNote,
  onClose,
  onEnterMemory,
  onNodeSave,
  onSelectConnectedNode,
  selectedNode,
  variant = "sidebar"
}: DetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftNode, setDraftNode] = useState<GraphNode | null>(selectedNode ? cloneDraftNode(selectedNode) : null);

  useEffect(() => {
    setDraftNode(selectedNode ? cloneDraftNode(selectedNode) : null);
    setIsEditing(false);
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <aside className={`panel ${variant} hidden`}>
        <section className="panel-section">
          <h3>Selected Node</h3>
          <p className="empty">Click a node to open its detail panel.</p>
        </section>
      </aside>
    );
  }

  const currentNode = isEditing && draftNode ? draftNode : selectedNode;

  const updateDraft = (patch: Partial<GraphNode>) => {
    setDraftNode((current) => (current ? { ...current, ...patch } : current));
  };

  const saveDraft = () => {
    if (!draftNode || !onNodeSave) {
      return;
    }

    onNodeSave(draftNode.id, draftNode);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraftNode(cloneDraftNode(selectedNode));
    setIsEditing(false);
  };

  return (
    <aside className={`panel ${variant}`}>
      <section className="panel-section">
        <div className="details-top">
          <div>
            <h3>Selected Node</h3>
            <h2>{currentNode.title}</h2>
          </div>
          <div className="details-top-actions">
            {onNodeSave ? (
              isEditing ? (
                <>
                  <button type="button" className="detail-action" onClick={saveDraft}>Save</button>
                  <button type="button" className="detail-action ghost" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <button type="button" className="detail-action" onClick={() => setIsEditing(true)}>Edit</button>
              )
            ) : null}
            {onClose ? (
              <button type="button" className="detail-action ghost" onClick={onClose}>Close</button>
            ) : null}
          </div>
        </div>

        {isEditing && draftNode ? (
          <div className="details-edit-grid">
            <label>
              Title
              <input value={draftNode.title} onChange={(event) => updateDraft({ title: event.target.value })} />
            </label>
            <label>
              Summary
              <textarea value={draftNode.summary} onChange={(event) => updateDraft({ summary: event.target.value })} />
            </label>
            <label>
              Detail
              <textarea value={draftNode.detail} onChange={(event) => updateDraft({ detail: event.target.value })} />
            </label>
            <label>
              Memory Access
              <input value={draftNode.memoryAccess} onChange={(event) => updateDraft({ memoryAccess: event.target.value })} />
            </label>
            <label className="details-checkbox">
              <input
                type="checkbox"
                checked={draftNode.confirmed}
                onChange={(event) => updateDraft({ confirmed: event.target.checked })}
              />
              Confirmed Source
            </label>
            <label className="details-checkbox">
              <input
                type="checkbox"
                checked={Boolean(draftNode.enterButton)}
                onChange={(event) => updateDraft({ enterButton: event.target.checked })}
              />
              Show Enter Button
            </label>
            <label>
              NPCs
              <textarea value={serializeList(draftNode.npcs)} onChange={(event) => updateDraft({ npcs: parseListValue(event.target.value) })} />
            </label>
            <label>
              Interactions
              <textarea
                value={serializeList(draftNode.interactions)}
                onChange={(event) => updateDraft({ interactions: parseListValue(event.target.value) })}
              />
            </label>
            <label>
              Bools
              <textarea value={serializeBoolList(draftNode.bools)} onChange={(event) => updateDraft({ bools: parseBoolListValue(event.target.value) })} />
            </label>
            <label>
              Unlocks
              <textarea value={serializeList(draftNode.unlocks)} onChange={(event) => updateDraft({ unlocks: parseListValue(event.target.value) })} />
            </label>
            <label>
              Query Path
              <textarea
                value={serializeList(draftNode.queryPath)}
                onChange={(event) => updateDraft({ queryPath: parseListValue(event.target.value) })}
              />
            </label>
          </div>
        ) : (
          <>
            <p>{currentNode.detail}</p>
            <div className="facts">
              <div className="fact"><strong>Node Type</strong><span>{currentNode.kind}</span></div>
              <div className="fact"><strong>Source Status</strong><span>{currentNode.confirmed ? "Confirmed from current docs" : "Skeleton / placeholder structure"}</span></div>
              <div className="fact"><strong>Day Open</strong><span>{currentNode.dayOpen[activeDay] ?? "Placeholder"}</span></div>
              <div className="fact"><strong>Memory Access</strong><span>{currentNode.memoryAccess}</span></div>
            </div>
          </>
        )}

        {isEditing && draftNode ? (
          <div className="details-day-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <label key={day}>
                Day {day}
                <input
                  value={draftNode.dayOpen[day] ?? ""}
                  onChange={(event) =>
                    updateDraft({
                      dayOpen: {
                        ...draftNode.dayOpen,
                        [day]: event.target.value
                      }
                    })
                  }
                />
              </label>
            ))}
          </div>
        ) : null}

        {currentNode.enterButton ? (
          <button type="button" className="memory-action visible" onClick={onEnterMemory}>
            Enter Memory (Day {activeDay})
          </button>
        ) : null}
      </section>

      <section className="panel-section">
        <h3>Day Snapshot</h3>
        <p>{dayNote}</p>
      </section>

      {connectedNodes.length > 0 ? (
        <section className="panel-section">
          <h3>Connected Nodes</h3>
          <div className="chips">
            {connectedNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className="chip chip-button"
                onClick={() => onSelectConnectedNode?.(node.id)}
              >
                {node.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel-section">
        <h3>NPCs / Availability</h3>
        <div className="chips">
          {currentNode.npcs.map((npc) => (
            <span key={npc} className="chip">
              {npc}
            </span>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Interactions</h3>
        <ul>
          {currentNode.interactions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel-section">
        <h3>Choice Record</h3>
        <p className="empty">Dialogue and collectable tracking are modeled as true/false path states.</p>
        <div className="bool-grid">
          {currentNode.bools.map(([label, value]) => (
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
          {currentNode.unlocks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel-section">
        <h3>Query Path Panel</h3>
        <ul>
          {currentNode.queryPath.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
