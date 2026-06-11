import { useEffect, useMemo, useState } from "react";
import type { SiteGraphDocument } from "../types/graph";
import type { SimulatedNodeImpact, SimulationFlagId, StatSimulationState } from "../types/statSimulation";
import { buildSimulationState, computeStatSummaries, getImpactCandidates } from "../utils/statSimulation";

const STORAGE_KEY = "peaceland-stat-simulation";

function readSavedSimulationState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StatSimulationState;
  } catch {
    return null;
  }
}

export function useStatSimulation(siteDocument: SiteGraphDocument) {
  const impactCandidates = useMemo(() => getImpactCandidates(siteDocument), [siteDocument]);
  const [simulationState, setSimulationState] = useState<StatSimulationState>(() => {
    const saved = readSavedSimulationState();
    return buildSimulationState(siteDocument, saved ?? undefined);
  });

  useEffect(() => {
    setSimulationState((current) => buildSimulationState(siteDocument, current));
  }, [siteDocument]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(simulationState));
  }, [simulationState]);

  const statSummaries = useMemo(() => computeStatSummaries(simulationState.impacts), [simulationState.impacts]);

  const updateImpact = (sourceNodeId: string, updater: (impact: SimulatedNodeImpact) => SimulatedNodeImpact) => {
    setSimulationState((current) => ({
      ...current,
      impacts: current.impacts.map((impact) => (impact.sourceNodeId === sourceNodeId ? updater(impact) : impact))
    }));
  };

  const updateFlag = (flagId: SimulationFlagId, enabled: boolean) => {
    setSimulationState((current) => ({
      ...current,
      flags: {
        ...current.flags,
        [flagId]: enabled
      }
    }));
  };

  const resetSimulation = () => {
    const nextState = buildSimulationState(siteDocument);
    setSimulationState(nextState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  };

  return {
    impactCandidates,
    resetSimulation,
    simulationState,
    siteDocument,
    statSummaries,
    updateFlag,
    updateImpact
  };
}
