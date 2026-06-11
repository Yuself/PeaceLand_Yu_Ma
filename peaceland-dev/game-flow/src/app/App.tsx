import { useMemo, useState } from "react";
import { CollectablesView } from "../features/collectables/CollectablesView";
import { FloristMemoryView } from "../features/memory/FloristMemoryView";
import { FloristNpcPrototypeView } from "../features/npc/FloristNpcPrototypeView";
import { NewspaperView } from "../features/newspaper/NewspaperView";
import { RJMemoryView } from "../features/memory/RJMemoryView";
import { PresentMapView } from "../features/present/PresentMapView";
import { StatsView } from "../features/stats/StatsView";
import { useSiteGraphDraft } from "../hooks/useSiteGraphDraft";
import { useStatSimulation } from "../hooks/useStatSimulation";
import { floristEdges, floristNodes } from "../data/floristMemoryData";
import { rjEdges, rjNodes } from "../data/rjMemoryData";
import { presentEdges, presentNodes } from "../data/presentMapData";
import type { GraphBoardId, GraphDocument } from "../types/graph";
import { DevAdvicePanel } from "../components/DevAdvicePanel";
import { DevlogPanel } from "../components/DevlogPanel";
import { getBoardDocument, setBoardDocument } from "../utils/siteGraphDocument";

type ViewMode = "present" | "florist" | "florist-npc" | "rj" | "collectables" | "stats" | "newspaper";

export function App() {
  const [view, setView] = useState<ViewMode>("present");
  const seedDocument = useMemo(
    () => ({
      present: { nodes: presentNodes, edges: presentEdges },
      floristMemory: { nodes: floristNodes, edges: floristEdges },
      rjMemory: { nodes: rjNodes, edges: rjEdges }
    }),
    []
  );
  const { draftDocument, hasDraftChanges, setDraftDocument } = useSiteGraphDraft(seedDocument);
  const statSimulation = useStatSimulation(draftDocument);

  const updateBoardDocument = (boardId: GraphBoardId, nextBoardDocument: GraphDocument) => {
    setDraftDocument((current) => setBoardDocument(current, boardId, nextBoardDocument));
  };

  const openBoardFromCollectables = (boardId: GraphBoardId) => {
    switch (boardId) {
      case "present":
        setView("present");
        break;
      case "florist-memory":
        setView("florist");
        break;
      case "rj-memory":
        setView("rj");
        break;
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header panel">
        <div>
          <h1>Peaceland Game Flow</h1>
          <p>
            React-based restructuring of the local flow prototypes. Present is the entry point for all memories; memory views remain distinct and can return consequences to present-day progression.
          </p>
          <p>
            Team-edit workflow: update the graph in-browser, export the Excel workbook, and upload the newest handoff file to shared Drive.
          </p>
        </div>
        <div className="view-switcher">
          <button type="button" className={view === "present" ? "active" : ""} onClick={() => setView("present")}>
            Present Map
          </button>
          <button type="button" className={view === "florist" ? "active" : ""} onClick={() => setView("florist")}>
            Florist Memory
          </button>
          <button type="button" className={view === "florist-npc" ? "active" : ""} onClick={() => setView("florist-npc")}>
            Florist NPC
          </button>
          <button type="button" className={view === "rj" ? "active" : ""} onClick={() => setView("rj")}>
            R&amp;J Memory
          </button>
          <button type="button" className={view === "collectables" ? "active" : ""} onClick={() => setView("collectables")}>
            Collectables
          </button>
          <button type="button" className={view === "stats" ? "active" : ""} onClick={() => setView("stats")}>
            Stats
          </button>
          <button type="button" className={view === "newspaper" ? "active" : ""} onClick={() => setView("newspaper")}>
            Newspaper
          </button>
        </div>
      </header>

      <section className="app-body">
        {view === "present" ? (
          <PresentMapView
            document={getBoardDocument(draftDocument, "present")}
            siteDocument={draftDocument}
            hasSiteDraftChanges={hasDraftChanges}
            onDocumentChange={(nextDocument) => updateBoardDocument("present", nextDocument)}
            onSiteDocumentChange={setDraftDocument}
            seedDocument={getBoardDocument(seedDocument, "present")}
          />
        ) : view === "collectables" ? (
          <CollectablesView
            onOpenBoard={openBoardFromCollectables}
            onSiteDocumentChange={setDraftDocument}
            siteDocument={draftDocument}
          />
        ) : view === "stats" ? (
          <StatsView
            impactCandidates={statSimulation.impactCandidates}
            resetSimulation={statSimulation.resetSimulation}
            simulationState={statSimulation.simulationState}
            statSummaries={statSimulation.statSummaries}
            updateFlag={statSimulation.updateFlag}
            updateImpact={statSimulation.updateImpact}
          />
        ) : view === "newspaper" ? (
          <NewspaperView
            simulationState={statSimulation.simulationState}
            statSummaries={statSimulation.statSummaries}
          />
        ) : view === "florist-npc" ? (
          <FloristNpcPrototypeView />
        ) : view === "florist" ? (
          <FloristMemoryView
            document={getBoardDocument(draftDocument, "florist-memory")}
            siteDocument={draftDocument}
            hasSiteDraftChanges={hasDraftChanges}
            onDocumentChange={(nextDocument) => updateBoardDocument("florist-memory", nextDocument)}
            onSiteDocumentChange={setDraftDocument}
            seedDocument={getBoardDocument(seedDocument, "florist-memory")}
          />
        ) : (
          <RJMemoryView
            document={getBoardDocument(draftDocument, "rj-memory")}
            siteDocument={draftDocument}
            hasSiteDraftChanges={hasDraftChanges}
            onDocumentChange={(nextDocument) => updateBoardDocument("rj-memory", nextDocument)}
            onSiteDocumentChange={setDraftDocument}
            seedDocument={getBoardDocument(seedDocument, "rj-memory")}
          />
        )}
      </section>

      <footer className="site-notes-stack">
        <DevAdvicePanel />
        <DevlogPanel />
      </footer>
    </div>
  );
}
