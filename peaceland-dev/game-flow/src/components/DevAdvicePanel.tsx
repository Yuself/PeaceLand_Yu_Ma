import { useState } from "react";
import { DEV_ADVICE_ENTRIES, getLatestDevAdviceEntry } from "../data/devAdvice";

function formatAdviceDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function DevAdvicePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const latestEntry = getLatestDevAdviceEntry();

  return (
    <section className="panel notes-panel advice-panel">
      <button
        type="button"
        className={`notes-toggle ${isOpen ? "is-open" : ""}`}
        aria-expanded={isOpen}
        aria-controls="site-dev-advice-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="notes-title">Dev Advice</span>
        <span className={`advice-priority-pill advice-priority-${latestEntry?.priority ?? "medium"}`}>
          {latestEntry?.priority ?? "note"}
        </span>
        <span className="notes-latest-copy">{latestEntry?.summary ?? "Implementation notes and team follow-ups."}</span>
        <span className="notes-toggle-icon" aria-hidden="true">
          {isOpen ? "-" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div className="notes-body" id="site-dev-advice-panel">
          <p className="notes-intro">
            Working advice for the local prototype. Edit <code>src/data/devAdvice.ts</code> when you want to leave technical guidance,
            warnings, or next-step notes for the team.
          </p>
          <ol className="notes-list">
            {DEV_ADVICE_ENTRIES.map((entry) => (
              <li key={entry.id} className="notes-entry advice-entry">
                <div className="notes-entry-header">
                  <div>
                    <strong>{entry.title}</strong>
                    <div className="advice-tag-row">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="advice-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="notes-entry-meta">
                    <span className={`advice-priority-pill advice-priority-${entry.priority}`}>{entry.priority}</span>
                    <time dateTime={entry.date}>{formatAdviceDate(entry.date)}</time>
                  </div>
                </div>
                <p className="advice-summary">{entry.summary}</p>
                <ul>
                  {entry.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
