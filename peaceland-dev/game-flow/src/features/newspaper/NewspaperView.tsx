import type { UseStatSimulationResult } from "../../types/statSimulation";
import { composeNewspaperProfile, getBoardLabel } from "../../utils/statSimulation";

interface NewspaperViewProps extends Pick<UseStatSimulationResult, "simulationState" | "statSummaries"> {}

export function NewspaperView({ simulationState, statSummaries }: NewspaperViewProps) {
  const profile = composeNewspaperProfile(simulationState, statSummaries);
  const activeImpacts = simulationState.impacts.filter((impact) => impact.enabled);

  return (
    <section className="newspaper-shell">
      <div className="newspaper-layout">
        <aside className="panel newspaper-sidebar">
          <section className="panel-section">
            <h3>Ending Prototype</h3>
            <h2>Fake Newspaper</h2>
            <p>
              This page is intentionally block-based. Each article area is a reusable module with a controlled column span and row span,
              so later ending logic can swap content without rewriting the full layout.
            </p>
          </section>
          <section className="panel-section">
            <h3>Lead Summary</h3>
            <p>{profile.leadSummary}</p>
          </section>
          <section className="panel-section">
            <h3>Active Flags</h3>
            <div className="newspaper-flag-list">
              {profile.usedFlags.map((flag) => (
                <div key={flag.id} className="fact">
                  <strong>{flag.label}</strong>
                  <span>{flag.enabled ? "On" : "Off"}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel-section">
            <h3>Source Coverage</h3>
            <div className="newspaper-source-list">
              {activeImpacts.length === 0 ? (
                <p className="empty">No active source nodes yet. Go to the Stats page and enable some dialog nodes.</p>
              ) : (
                activeImpacts.slice(0, 8).map((impact) => (
                  <div key={impact.sourceNodeId} className="newspaper-source-item">
                    <strong>{impact.sourceTitle}</strong>
                    <span>{getBoardLabel(impact.boardId)}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        <div className="newspaper-stage">
          <article className="newspaper-page">
            <header className="newspaper-masthead">
              <div className="newspaper-masthead-line">
                <span>Vol. 1</span>
                <span>{profile.mastheadDate}</span>
                <span>{profile.editionLabel}</span>
              </div>
              <h1>The Peaceland Chronicle</h1>
              <p>{profile.submasthead}</p>
            </header>

            <section className="newspaper-grid">
              {profile.blocks.map((block) => (
                <article
                  key={block.id}
                  className={`newspaper-block ${block.type}`}
                  style={{
                    gridColumn: `span ${block.columnSpan}`,
                    gridRow: `span ${block.rowSpan}`
                  }}
                >
                  {block.kicker ? <div className="newspaper-kicker">{block.kicker}</div> : null}
                  <h2>{block.title}</h2>
                  {block.subtitle ? <p className="newspaper-subtitle">{block.subtitle}</p> : null}
                  {block.byline ? <div className="newspaper-byline">{block.byline}</div> : null}
                  <div className="newspaper-copy">
                    {block.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </article>
        </div>
      </div>
    </section>
  );
}
