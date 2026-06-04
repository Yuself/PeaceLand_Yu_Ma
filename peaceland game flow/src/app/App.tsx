import { useState } from "react";
import { FloristMemoryView } from "../features/memory/FloristMemoryView";
import { RJMemoryView } from "../features/memory/RJMemoryView";
import { PresentMapView } from "../features/present/PresentMapView";

type ViewMode = "present" | "florist" | "rj";

export function App() {
  const [view, setView] = useState<ViewMode>("present");

  return (
    <div className="app-shell">
      <header className="app-header panel">
        <div>
          <h1>Peaceland Game Flow</h1>
          <p>
            React-based restructuring of the local flow prototypes. Present is the entry point for all memories; memory views remain distinct and can return consequences to present-day progression.
          </p>
        </div>
        <div className="view-switcher">
          <button type="button" className={view === "present" ? "active" : ""} onClick={() => setView("present")}>
            Present Map
          </button>
          <button type="button" className={view === "florist" ? "active" : ""} onClick={() => setView("florist")}>
            Florist Memory
          </button>
          <button type="button" className={view === "rj" ? "active" : ""} onClick={() => setView("rj")}>
            R&amp;J Memory
          </button>
        </div>
      </header>

      <section className="app-body">{view === "present" ? <PresentMapView /> : view === "florist" ? <FloristMemoryView /> : <RJMemoryView />}</section>
    </div>
  );
}
