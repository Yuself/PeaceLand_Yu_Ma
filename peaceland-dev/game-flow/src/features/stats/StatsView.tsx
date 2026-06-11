import { useMemo, useState } from "react";
import type { GraphBoardId } from "../../types/graph";
import type { SimulationFlagId, StatId, UseStatSimulationResult } from "../../types/statSimulation";
import { SIMULATION_FLAG_DEFINITIONS, STAT_DEFINITIONS, clampStatValue, getBoardLabel } from "../../utils/statSimulation";

interface StatsViewProps extends Pick<
  UseStatSimulationResult,
  "impactCandidates" | "resetSimulation" | "simulationState" | "statSummaries" | "updateFlag" | "updateImpact"
> {}

function formatSignedValue(value: number) {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

function StatMeter({ total, statId }: { total: number; statId: StatId }) {
  const definition = STAT_DEFINITIONS.find((item) => item.id === statId)!;
  const clamped = clampStatValue(total, definition);
  const percent = ((clamped - definition.min) / (definition.max - definition.min)) * 100;

  return (
    <div className="stat-meter-shell">
      <div className="stat-meter-labels">
        <span>{definition.negativeLabel}</span>
        <span>{definition.positiveLabel}</span>
      </div>
      <div className="stat-meter-track">
        <span className="stat-meter-center" />
        <span className="stat-meter-marker" style={{ left: `${percent}%` }} />
      </div>
    </div>
  );
}

function StatCard({ total, statId, contributionCount }: { total: number; statId: StatId; contributionCount: number }) {
  const definition = STAT_DEFINITIONS.find((item) => item.id === statId)!;

  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <div>
          <h3>{definition.shortLabel}</h3>
          <h2>{definition.label}</h2>
        </div>
        <strong className={`stat-total ${total === 0 ? "neutral" : total > 0 ? "positive" : "negative"}`}>{formatSignedValue(total)}</strong>
      </div>
      <StatMeter statId={statId} total={total} />
      <p>{contributionCount} active source node{contributionCount === 1 ? "" : "s"} contribute to this stat.</p>
    </article>
  );
}

function FlagToggle({
  checked,
  description,
  flagId,
  label,
  onChange
}: {
  checked: boolean;
  description: string;
  flagId: SimulationFlagId;
  label: string;
  onChange: (flagId: SimulationFlagId, enabled: boolean) => void;
}) {
  return (
    <label className="simulation-flag">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(flagId, event.target.checked)} />
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
    </label>
  );
}

export function StatsView({
  impactCandidates,
  resetSimulation,
  simulationState,
  statSummaries,
  updateFlag,
  updateImpact
}: StatsViewProps) {
  const [search, setSearch] = useState("");
  const [boardFilter, setBoardFilter] = useState<GraphBoardId | "all">("all");
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);

  const filteredImpacts = useMemo(() => {
    return simulationState.impacts.filter((impact) => {
      if (boardFilter !== "all" && impact.boardId !== boardFilter) {
        return false;
      }

      if (showEnabledOnly && !impact.enabled) {
        return false;
      }

      const query = search.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return (
        impact.sourceTitle.toLowerCase().includes(query) ||
        impact.sourceNodeId.toLowerCase().includes(query) ||
        impact.sourceSummary.toLowerCase().includes(query)
      );
    });
  }, [boardFilter, search, showEnabledOnly, simulationState.impacts]);

  const activeImpactCount = simulationState.impacts.filter((impact) => impact.enabled).length;

  return (
    <section className="stats-shell">
      <div className="stats-layout">
        <aside className="panel stats-sidebar">
          <section className="panel-section">
            <h3>Stat Prototype</h3>
            <h2>Simulation Controls</h2>
            <p>
              This page does not need live gameplay integration yet. Toggle any source node on or off, or edit its stat deltas directly.
              The newspaper preview will update from these totals.
            </p>
          </section>

          <section className="panel-section">
            <h3>Quick Filters</h3>
            <label className="stat-filter-field">
              Search Nodes
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Danika, Boris, rjn-018..." />
            </label>
            <label className="stat-filter-field">
              Board
              <select value={boardFilter} onChange={(event) => setBoardFilter(event.target.value as GraphBoardId | "all")}>
                <option value="all">All Boards</option>
                <option value="present">Present Map</option>
                <option value="florist-memory">Florist Memory</option>
                <option value="rj-memory">R&amp;J Memory</option>
              </select>
            </label>
            <label className="simulation-flag compact">
              <input type="checkbox" checked={showEnabledOnly} onChange={(event) => setShowEnabledOnly(event.target.checked)} />
              <div>
                <strong>Enabled Only</strong>
                <p>Hide source nodes that currently have no simulated effect.</p>
              </div>
            </label>
            <button type="button" className="collectable-create-button" onClick={resetSimulation}>
              Reset Simulation
            </button>
          </section>

          <section className="panel-section">
            <h3>Newspaper Flags</h3>
            <div className="simulation-flag-list">
              {SIMULATION_FLAG_DEFINITIONS.map((flag) => (
                <FlagToggle
                  key={flag.id}
                  checked={simulationState.flags[flag.id]}
                  description={flag.description}
                  flagId={flag.id}
                  label={flag.label}
                  onChange={updateFlag}
                />
              ))}
            </div>
          </section>

          <section className="panel-section">
            <h3>Counts</h3>
            <div className="overall-grid">
              <div className="overall-item">
                <strong>Impact Candidates</strong>
                <span>{impactCandidates.length}</span>
              </div>
              <div className="overall-item">
                <strong>Active Nodes</strong>
                <span>{activeImpactCount}</span>
              </div>
              <div className="overall-item">
                <strong>Filtered Nodes</strong>
                <span>{filteredImpacts.length}</span>
              </div>
            </div>
          </section>
        </aside>

        <div className="stats-main">
          <div className="stats-grid">
            {statSummaries.map((summary) => (
              <StatCard
                key={summary.definition.id}
                contributionCount={summary.contributions.length}
                statId={summary.definition.id}
                total={summary.total}
              />
            ))}
          </div>

          <div className="panel stats-source-panel">
            <section className="panel-section">
              <h3>Source Nodes</h3>
              <h2>Editable Stat Inputs</h2>
              <p className="empty">
                Each card below is a dialog / interaction / state / minigame node from the current site document.
                Toggle it on, or edit the numeric fields to push the final stats in a different direction.
              </p>
            </section>
            <section className="panel-section stat-impact-grid">
              {filteredImpacts.map((impact) => (
                <article key={impact.sourceNodeId} className={`stat-impact-card ${impact.enabled ? "is-enabled" : ""}`}>
                  <div className="stat-impact-top">
                    <div>
                      <h3>{impact.sourceTitle}</h3>
                      <p>{impact.sourceSummary}</p>
                    </div>
                    <label className="stat-impact-toggle">
                      <input
                        type="checkbox"
                        checked={impact.enabled}
                        onChange={(event) =>
                          updateImpact(impact.sourceNodeId, (current) => ({
                            ...current,
                            enabled: event.target.checked
                          }))
                        }
                      />
                      Enabled
                    </label>
                  </div>
                  <div className="facts">
                    <div className="fact">
                      <strong>Board</strong>
                      <span>{getBoardLabel(impact.boardId)}</span>
                    </div>
                    <div className="fact">
                      <strong>Kind</strong>
                      <span>{impact.sourceKind}</span>
                    </div>
                    <div className="fact">
                      <strong>Node ID</strong>
                      <span>{impact.sourceNodeId}</span>
                    </div>
                  </div>
                  <div className="stat-delta-grid">
                    {STAT_DEFINITIONS.map((definition) => (
                      <label key={definition.id}>
                        {definition.shortLabel}
                        <input
                          type="number"
                          step="1"
                          value={impact.deltas[definition.id]}
                          onChange={(event) =>
                            updateImpact(impact.sourceNodeId, (current) => ({
                              ...current,
                              deltas: {
                                ...current.deltas,
                                [definition.id]: Number(event.target.value) || 0
                              }
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
