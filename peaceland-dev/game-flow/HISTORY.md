# Peaceland Game Flow History

This file records structural and feature-level changes for the `peaceland-dev/game-flow` React project.

## Update Rule

For every future modification to this app:

1. If folders, responsibilities, or major entry points changed, update [README.md](/D:/Peaceland/peaceland-dev/game-flow/README.md).
2. If the change affected behavior, UI, data flow, tooling, or architecture, add a dated entry to this file.
3. If the change is a shipped site update, also update `src/data/devlog.ts`, `package.json`, and the version metadata in `index.html`.

Do not treat directory docs and history as optional cleanup.
They are part of the change.

## 2026-06-11

### Canonical merge and florist NPC pass

- Merged the actively used `peaceland game flow` app back into the documented canonical route `D:\Peaceland\peaceland-dev\game-flow` so future work has one source of truth again.
- Added a dedicated `Florist NPC` feature view for present-day interaction prototyping instead of forcing this work into the existing Present Map or memory boards.
- Added florist-specific local prototype state covering memory-entry gating, White Flower notebook review stages, friendship tiers, and a level-2 choice that unlocks different level-3 dialogue interactions.

## 2026-06-11

### Collectables authoring and asset gallery pass

- Added an `Asset Gallery` tab to the selected-node editor so authors can browse files from `src/assets/gallery`, assign them to nodes, and clear node images without manually typing asset URLs.
- Expanded the `Collectables` view from a read-only index into an authoring surface with cross-board registry stats, memory-filtered browsing, per-board dropdown sections, and direct collectable creation attached to an existing node.
- Synced the release-facing version metadata for this pass so the footer devlog, `package.json`, and `index.html` all report the current shipped build.

## 2026-06-10

### Dev advice panel pass

- Added a dedicated `Dev Advice` footer panel for implementation notes, warnings, and handoff guidance that should remain visible in the app.
- Split release-facing changelog data and technical-advice data into separate sources: `src/data/devlog.ts` and `src/data/devAdvice.ts`.
- Synced the site version metadata so `src/data/devlog.ts`, `package.json`, and `index.html` all report the same current release.

### Structure and maintenance pass

- Added this app-level `HISTORY.md` so the React project has its own local change log instead of relying only on the footer devlog.
- Formalized the rule that future app changes must update:
  - `README.md` when structure or directory responsibilities change
  - `HISTORY.md` when behavior, UI, data flow, or architecture changes
  - `src/data/devlog.ts` when the site release itself changes

### Stats and newspaper prototype pass

- Added a `Stats` feature view for simulated hidden-stat editing and source-node toggling.
- Added a `Newspaper` feature view for block-based fake ending layout experiments.
- Added dedicated stat-simulation types, hooks, and utilities so ending experiments can move independently of the live graph schema.
