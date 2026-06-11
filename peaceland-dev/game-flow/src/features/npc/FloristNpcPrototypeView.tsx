import { useMemo, useState } from "react";
import {
  FLORIST_INTERACTIONS,
  FLORIST_NOTEBOOK_LABELS,
  INITIAL_FLORIST_NPC_STATE,
  type FloristChoice,
  type FloristInteraction,
  type FloristNpcPrototypeState,
  type FloristUnlockRule
} from "../../data/floristNpcPrototypeData";

function isInteractionUnlocked(interaction: FloristInteraction, state: FloristNpcPrototypeState) {
  const { unlock } = interaction;

  if (unlock.memoryEntered && !state.memoryEntered) {
    return false;
  }

  if ((unlock.notebookStageAtLeast ?? 0) > state.notebookStage) {
    return false;
  }

  if ((unlock.friendshipAtLeast ?? 0) > state.friendshipLevel) {
    return false;
  }

  if (unlock.branch && state.levelTwoBranch !== unlock.branch) {
    return false;
  }

  return true;
}

function buildUnlockCopy(unlock: FloristUnlockRule) {
  const lines: string[] = [];

  if (unlock.memoryEntered) {
    lines.push("Memory entered");
  }

  if (unlock.notebookStageAtLeast) {
    lines.push(`White Flower notebook review ${unlock.notebookStageAtLeast}/2`);
  }

  if (unlock.friendshipAtLeast) {
    lines.push(`Friendship ${unlock.friendshipAtLeast}+`);
  }

  if (unlock.branch) {
    lines.push(`Level-2 branch: ${unlock.branch}`);
  }

  return lines.length > 0 ? lines : ["Always visible"];
}

function applyChoice(state: FloristNpcPrototypeState, interaction: FloristInteraction, choice: FloristChoice) {
  const nextFriendship = Math.max(state.friendshipLevel, choice.effect.friendship ?? state.friendshipLevel);
  const nextBranch =
    interaction.id === "white-flower-second-pass" ? choice.effect.branch ?? state.levelTwoBranch : state.levelTwoBranch;

  return {
    ...state,
    friendshipLevel: nextFriendship as FloristNpcPrototypeState["friendshipLevel"],
    levelTwoBranch: nextBranch ?? null,
    choiceHistory: [
      `${interaction.title}: ${choice.label}${choice.effect.note ? ` -> ${choice.effect.note}` : ""}`,
      ...state.choiceHistory
    ]
  };
}

export function FloristNpcPrototypeView() {
  const [prototypeState, setPrototypeState] = useState(INITIAL_FLORIST_NPC_STATE);
  const [selectedId, setSelectedId] = useState("florist-root");

  const interactionsByTier = useMemo(() => {
    const grouped = new Map<number, FloristInteraction[]>();

    for (const interaction of FLORIST_INTERACTIONS) {
      const tier = interaction.tier;
      const current = grouped.get(tier) ?? [];
      current.push(interaction);
      grouped.set(tier, current);
    }

    return grouped;
  }, []);

  const selectedInteraction =
    FLORIST_INTERACTIONS.find((interaction) => interaction.id === selectedId) ?? FLORIST_INTERACTIONS[0];
  const selectedUnlocked = isInteractionUnlocked(selectedInteraction, prototypeState);

  const canInspectNotebook = prototypeState.memoryEntered && prototypeState.notebookStage < 2;
  const canPromoteToTierTwoNotebook = prototypeState.memoryEntered && prototypeState.friendshipLevel >= 1;

  return (
    <section className="npc-prototype-shell">
      <div className="npc-prototype-layout">
        <aside className="panel npc-prototype-sidebar">
          <section className="panel-section">
            <h3>Florist NPC</h3>
            <h2>Mira Present Prototype</h2>
            <p className="empty">
              This prototype keeps the main graph focused on interaction nodes, while notebook checks and friendship
              state act as unlock gates.
            </p>
          </section>

          <section className="panel-section">
            <h3>State Controls</h3>
            <div className="npc-status-grid">
              <div className="overall-item">
                <strong>Memory</strong>
                <span>{prototypeState.memoryEntered ? "Entered" : "Locked"}</span>
              </div>
              <div className="overall-item">
                <strong>Notebook</strong>
                <span>{FLORIST_NOTEBOOK_LABELS[prototypeState.notebookStage]}</span>
              </div>
              <div className="overall-item">
                <strong>Friendship</strong>
                <span>Level {prototypeState.friendshipLevel}</span>
              </div>
              <div className="overall-item">
                <strong>Tier 2 Branch</strong>
                <span>{prototypeState.levelTwoBranch ?? "None chosen"}</span>
              </div>
            </div>

            <div className="npc-control-stack">
              <button
                type="button"
                className="npc-action-button"
                onClick={() =>
                  setPrototypeState((current) => ({
                    ...current,
                    memoryEntered: true,
                    choiceHistory: ["Entered florist memory", ...current.choiceHistory]
                  }))
                }
              >
                Enter Florist Memory
              </button>
              <button
                type="button"
                className="npc-action-button"
                disabled={!canInspectNotebook}
                onClick={() =>
                  setPrototypeState((current) => ({
                    ...current,
                    notebookStage: Math.min(2, current.notebookStage + 1) as FloristNpcPrototypeState["notebookStage"],
                    choiceHistory: [
                      current.notebookStage === 0
                        ? "Reviewed White Flower in notebook: 0 -> 1"
                        : "Reviewed White Flower in notebook: 1 -> 2",
                      ...current.choiceHistory
                    ]
                  }))
                }
              >
                Review White Flower Notebook Entry
              </button>
              <button
                type="button"
                className="npc-action-button ghost"
                disabled={!prototypeState.memoryEntered || !canPromoteToTierTwoNotebook}
                onClick={() =>
                  setPrototypeState((current) => ({
                    ...current,
                    notebookStage: 2,
                    choiceHistory: ["Forced White Flower notebook to second review for tier-2 testing", ...current.choiceHistory]
                  }))
                }
              >
                Force Second Notebook Read
              </button>
              <button
                type="button"
                className="npc-action-button ghost"
                onClick={() => {
                  setPrototypeState(INITIAL_FLORIST_NPC_STATE);
                  setSelectedId("florist-root");
                }}
              >
                Reset Prototype
              </button>
            </div>

            {!canPromoteToTierTwoNotebook && prototypeState.memoryEntered && prototypeState.notebookStage === 1 ? (
              <p className="npc-inline-note">
                The second notebook pass is intentionally blocked until the tier-1 dialogue actually raises trust.
              </p>
            ) : null}
          </section>

          <section className="panel-section">
            <h3>Choice History</h3>
            {prototypeState.choiceHistory.length === 0 ? (
              <p className="empty">No actions recorded yet.</p>
            ) : (
              <ol className="npc-history-list">
                {prototypeState.choiceHistory.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ol>
            )}
          </section>
        </aside>

        <div className="npc-prototype-main">
          <section className="panel npc-flow-intro">
            <div className="panel-section">
              <h3>Interaction Flow</h3>
              <p>
                Tier 1 unlocks after memory plus the first White Flower notebook review. Tier 2 requires the second
                notebook pass and friendship level 1. The chosen tier-2 answer determines which tier-3 interaction
                becomes visible.
              </p>
            </div>
          </section>

          <div className="npc-tier-grid">
            {[0, 1, 2, 3].map((tier) => {
              const tierNodes = interactionsByTier.get(tier) ?? [];

              return (
                <section key={tier} className="panel npc-tier-column">
                  <div className="panel-section">
                    <div className="npc-tier-heading">
                      <h3>Tier {tier}</h3>
                      <span>{tier === 0 ? "Root" : tier === 3 ? "Branch Result" : "Interaction Gate"}</span>
                    </div>
                    <div className="npc-node-stack">
                      {tierNodes.map((interaction) => {
                        const unlocked = isInteractionUnlocked(interaction, prototypeState);

                        return (
                          <button
                            key={interaction.id}
                            type="button"
                            className={`npc-node-card ${selectedId === interaction.id ? "is-selected" : ""} ${
                              unlocked ? "is-unlocked" : "is-locked"
                            }`}
                            onClick={() => setSelectedId(interaction.id)}
                          >
                            <div className="npc-node-topline">
                              <strong>{interaction.title}</strong>
                              <span>{unlocked ? "Unlocked" : "Locked"}</span>
                            </div>
                            <p>{interaction.summary}</p>
                            <div className="chips">
                              {buildUnlockCopy(interaction.unlock).map((line) => (
                                <span key={line} className="chip">
                                  {line}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside className="panel npc-prototype-detail">
          <section className="panel-section">
            <div className="details-top">
              <div>
                <h3>Selected Interaction</h3>
                <h2>{selectedInteraction.title}</h2>
              </div>
            </div>

            <div className="facts">
              <div className="fact">
                <strong>Tier</strong>
                <span>{selectedInteraction.tier}</span>
              </div>
              <div className="fact">
                <strong>Status</strong>
                <span>{selectedUnlocked ? "Unlocked" : "Locked"}</span>
              </div>
              <div className="fact">
                <strong>Branch</strong>
                <span>{prototypeState.levelTwoBranch ?? "None"}</span>
              </div>
            </div>

            <p>{selectedInteraction.summary}</p>
            <div className="chips">
              {buildUnlockCopy(selectedInteraction.unlock).map((line) => (
                <span key={line} className="chip">
                  {line}
                </span>
              ))}
            </div>
          </section>

          <section className="panel-section">
            <h3>Dialogue Beat</h3>
            <ul>
              {selectedInteraction.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="panel-section">
            <h3>Choice Output</h3>
            {selectedInteraction.choices?.length ? (
              <div className="npc-choice-stack">
                {selectedInteraction.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className="npc-choice-card"
                    disabled={!selectedUnlocked}
                    onClick={() => setPrototypeState((current) => applyChoice(current, selectedInteraction, choice))}
                  >
                    <strong>{choice.label}</strong>
                    <span>{choice.detail}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty">
                {selectedInteraction.tier === 3
                  ? "This node is the branch result unlocked by the level-2 choice."
                  : "This interaction currently has no branching choice in the prototype."}
              </p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
