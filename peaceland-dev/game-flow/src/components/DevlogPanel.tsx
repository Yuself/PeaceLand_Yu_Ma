import { useEffect, useState } from "react";
import { DEVLOG_ENTRIES, SITE_VERSION } from "../data/devlog";

function formatDevlogDate(date: string) {
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

export function DevlogPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.title = `Peaceland Game Flow 路 v${SITE_VERSION}`;
  }, []);

  return (
    <section className="panel notes-panel devlog-panel">
      <button
        type="button"
        className={`notes-toggle ${isOpen ? "is-open" : ""}`}
        aria-expanded={isOpen}
        aria-controls="site-devlog-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="notes-title">Devlog</span>
        <span className="devlog-version-pill">v{SITE_VERSION}</span>
        <span className="notes-latest-copy">{DEVLOG_ENTRIES[0]?.changes[0] ?? "Site update notes"}</span>
        <span className="notes-toggle-icon" aria-hidden="true">
          {isOpen ? "-" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div className="notes-body" id="site-devlog-panel">
          <p className="notes-intro">
            Version history for this site build. Add a new entry at the top of <code>src/data/devlog.ts</code> whenever you ship an update.
          </p>
          <ol className="notes-list">
            {DEVLOG_ENTRIES.map((entry) => (
              <li key={entry.version} className="notes-entry devlog-entry">
                <div className="notes-entry-header">
                  <strong>v{entry.version}</strong>
                  <time dateTime={entry.date}>{formatDevlogDate(entry.date)}</time>
                </div>
                <ul>
                  {entry.changes.map((change) => (
                    <li key={change}>{change}</li>
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
