import { useEffect, useMemo, useState } from "react";
import type { CollectableIndexEntry } from "../../utils/collectables";
import type { GraphBoardId, GraphNode, SiteGraphDocument } from "../../types/graph";
import {
  MEMORY_FILTER_OPTIONS,
  buildCollectableIndex,
  createCollectableInSiteDocument,
  filterCollectablesByMemory,
  getBoardLabel,
  getCollectableImageAlt,
  getCollectableImageSrc,
  groupCollectablesByBoard,
  type MemoryFilterValue
} from "../../utils/collectables";
import { getBoardDocument } from "../../utils/siteGraphDocument";

interface CollectablesViewProps {
  onOpenBoard: (boardId: GraphBoardId) => void;
  onSiteDocumentChange: (nextDocument: SiteGraphDocument) => void;
  siteDocument: SiteGraphDocument;
}

function buildDefaultTitle(boardId: GraphBoardId, attachTarget: GraphNode | null) {
  const base = attachTarget ? `${attachTarget.title} Collectable` : `${getBoardLabel(boardId)} Collectable`;
  return base;
}

function CollectableCard({
  entry,
  onOpenBoard
}: {
  entry: CollectableIndexEntry;
  onOpenBoard: (boardId: GraphBoardId) => void;
}) {
  return (
    <article className="collectable-card">
      <div className="collectable-image-section">
        <img src={getCollectableImageSrc(entry.node)} alt={getCollectableImageAlt(entry.node)} loading="lazy" />
      </div>
      <div className="collectable-card-top">
        <div>
          <h3>{entry.node.title}</h3>
          <p>{entry.node.summary}</p>
        </div>
        <button type="button" className="detail-action ghost" onClick={() => onOpenBoard(entry.boardId)}>
          Open Graph
        </button>
      </div>
      <div className="facts">
        <div className="fact">
          <strong>Board</strong>
          <span>{entry.boardLabel}</span>
        </div>
        <div className="fact">
          <strong>Attached To</strong>
          <span>{entry.attachedToTitle ?? "Unattached"}</span>
        </div>
        <div className="fact">
          <strong>Memory Access</strong>
          <span>{entry.node.memoryAccess}</span>
        </div>
        <div className="fact">
          <strong>Node ID</strong>
          <span>{entry.node.id}</span>
        </div>
      </div>
      <p className="collectable-detail-copy">{entry.node.detail}</p>
    </article>
  );
}

function CollectableSectionDropdown({
  boardLabel,
  entries,
  onOpenBoard
}: {
  boardLabel: string;
  entries: CollectableIndexEntry[];
  onOpenBoard: (boardId: GraphBoardId) => void;
}) {
  return (
    <details className="collectable-memory-section">
      <summary>
        <span className="collectable-memory-section-title">{boardLabel}</span>
        <span className="collectable-memory-section-count">{entries.length} collectable{entries.length === 1 ? "" : "s"}</span>
      </summary>
      <div className="collectable-memory-section-body">
        {entries.length === 0 ? (
          <p className="empty">No collectables in this section yet.</p>
        ) : (
          <div className="collectables-grid">
            {entries.map((entry) => (
              <CollectableCard key={entry.node.id} entry={entry} onOpenBoard={onOpenBoard} />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

export function CollectablesView({ onOpenBoard, onSiteDocumentChange, siteDocument }: CollectablesViewProps) {
  const [boardId, setBoardId] = useState<GraphBoardId>("present");
  const [attachToId, setAttachToId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("Draft collectable added from the overall collectables panel.");
  const [detail, setDetail] = useState("Fill in the authored collectable details here.");
  const [status, setStatus] = useState("");
  const [memoryFilter, setMemoryFilter] = useState<MemoryFilterValue>("all");

  const collectables = useMemo(() => buildCollectableIndex(siteDocument), [siteDocument]);
  const filteredCollectables = useMemo(
    () => filterCollectablesByMemory(collectables, memoryFilter),
    [collectables, memoryFilter]
  );
  const groupedSections = useMemo(() => groupCollectablesByBoard(filteredCollectables), [filteredCollectables]);
  const attachCandidates = useMemo(
    () => getBoardDocument(siteDocument, boardId).nodes.filter((node) => node.kind !== "collectable"),
    [boardId, siteDocument]
  );

  useEffect(() => {
    const firstTarget = attachCandidates[0]?.id ?? "";
    setAttachToId((current) => (current && attachCandidates.some((node) => node.id === current) ? current : firstTarget));
  }, [attachCandidates]);

  useEffect(() => {
    const targetNode = attachCandidates.find((node) => node.id === attachToId) ?? null;
    if (!title.trim()) {
      setTitle(buildDefaultTitle(boardId, targetNode));
    }
  }, [attachToId, attachCandidates, boardId, title]);

  const handleCreate = () => {
    if (!attachToId || !title.trim()) {
      setStatus("Choose a target node and enter a title before creating a collectable.");
      return;
    }

    try {
      const nextDocument = createCollectableInSiteDocument(siteDocument, {
        attachToId,
        boardId,
        detail: detail.trim(),
        summary: summary.trim(),
        title: title.trim()
      });
      onSiteDocumentChange(nextDocument);
      setStatus(`Created "${title.trim()}" in ${getBoardLabel(boardId)}.`);
      setTitle("");
      setSummary("Draft collectable added from the overall collectables panel.");
      setDetail("Fill in the authored collectable details here.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Collectable creation failed.";
      setStatus(message);
    }
  };

  return (
    <section className="collectables-shell">
      <div className="collectables-layout">
        <aside className="panel collectables-sidebar">
          <section className="panel-section">
            <h3>Collectables Registry</h3>
            <h2>Overall Panel</h2>
            <p>
              This view pulls every <code>collectable</code> node from the unified site JSON, regardless of which graph it lives in.
              Reading items, minigame assets, and click targets all appear here without type-based filtering.
            </p>
          </section>
          <section className="panel-section">
            <h3>Create Collectable</h3>
            <div className="collectable-form">
              <label>
                Board
                <select value={boardId} onChange={(event) => setBoardId(event.target.value as GraphBoardId)}>
                  <option value="present">Present Map</option>
                  <option value="florist-memory">Florist Memory</option>
                  <option value="rj-memory">R&amp;J Memory</option>
                </select>
              </label>
              <label>
                Attach To
                <select value={attachToId} onChange={(event) => setAttachToId(event.target.value)}>
                  {attachCandidates.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Title
                <input value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label>
                Summary
                <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
              </label>
              <label>
                Detail
                <textarea value={detail} onChange={(event) => setDetail(event.target.value)} />
              </label>
              <button type="button" className="collectable-create-button" onClick={handleCreate}>
                Create Collectable
              </button>
              {status ? <div className="graph-import-status">{status}</div> : null}
            </div>
          </section>
          <section className="panel-section">
            <h3>Stats</h3>
            <div className="overall-grid">
              <div className="overall-item">
                <strong>Total Collectables</strong>
                <span>{collectables.length}</span>
              </div>
              <div className="overall-item">
                <strong>Present</strong>
                <span>{collectables.filter((entry) => entry.boardId === "present").length}</span>
              </div>
              <div className="overall-item">
                <strong>Florist</strong>
                <span>{collectables.filter((entry) => entry.boardId === "florist-memory").length}</span>
              </div>
              <div className="overall-item">
                <strong>R&amp;J</strong>
                <span>{collectables.filter((entry) => entry.boardId === "rj-memory").length}</span>
              </div>
            </div>
          </section>
        </aside>

        <div className="panel collectables-main">
          <section className="panel-section collectables-filter-bar">
            <div className="collectables-filter-copy">
              <h3>Cell View</h3>
              <p className="empty">
                Use the memory filter to narrow by section, then open a section dropdown to browse collectables and their image previews.
              </p>
            </div>
            <label className="collectable-memory-filter">
              Memory Filter
              <select value={memoryFilter} onChange={(event) => setMemoryFilter(event.target.value as MemoryFilterValue)}>
                {MEMORY_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {memoryFilter === "all" ? (
            <section className="collectable-memory-sections">
              {groupedSections.map((section) => (
                <CollectableSectionDropdown
                  key={section.boardId}
                  boardLabel={section.boardLabel}
                  entries={section.entries}
                  onOpenBoard={onOpenBoard}
                />
              ))}
            </section>
          ) : (
            <section className="collectables-grid">
              {filteredCollectables.length === 0 ? (
                <p className="empty">No collectables in this section yet.</p>
              ) : (
                filteredCollectables.map((entry) => (
                  <CollectableCard key={entry.node.id} entry={entry} onOpenBoard={onOpenBoard} />
                ))
              )}
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
