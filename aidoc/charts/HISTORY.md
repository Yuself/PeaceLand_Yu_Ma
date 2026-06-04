# Chart History

This file records local chart-related changes in `D:\Peaceland\aidoc\charts`.

## 2026-06-04

### Initial chart workspace setup

- Created [README.md](/D:/Peaceland/aidoc/charts/README.md) to capture the current chart direction.
- Established the local chart folder structure under `aidoc/charts/`.

### Florist HTML prototype v1

- Created [florist_chart_prototype.html](/D:/Peaceland/aidoc/charts/memory/florist_chart_prototype.html).
- Implemented an Obsidian-like dark board prototype.
- Used individual nodes instead of a single combined block.
- Rendered `scene` nodes as rounded rectangles.
- Rendered `trigger` nodes as ellipses.
- Added hover summary cards.
- Added per-node `Expand` interaction for detailed content.
- Added interactable-node detail sections including the four-stat structure:
  - `S/A`
  - `I/N`
  - `N/RA`
  - `K/C`
- Added notebook / collectable placeholder sections.

### Florist HTML prototype v2

- Added a top-level global expand/collapse slider.
- Added mixed-state feedback for partial expansion.
- Made stat and notebook summaries visible before full expansion through quick summary boxes.
- Adjusted page and board spacing to use responsive margins tied to viewport size.
- Adjusted node widths to respond better to page width.

### Present chart prototype v1

- Created [present/README.md](/D:/Peaceland/aidoc/charts/present/README.md).
- Created [present_chart_prototype.html](/D:/Peaceland/aidoc/charts/present/present_chart_prototype.html).
- Switched the site-entry concept so the graph starts from a present-day map rather than a memory chart.
- Built the graph around confirmed present anchors from recent docs:
  - Present Map Start
  - Town Square
  - Museum Exterior
  - Memory Tree
  - Artifact Exhibit
  - War Exhibit / Map Area
  - Mira present follow-up
  - Petar at Memory Tree
  - Jovan / Ruzica present encounter
- Added a day selector for `Day 1` through `Day 7`.
- Added `Expand All` and `Collapse All` controls.
- Added a focus filter for confirmed nodes versus skeleton placeholders.
- Added a right-side query panel for:
  - location open state by day
  - NPC presence
  - interactable points
  - true/false choice-record placeholders
  - NPC layer unlock routing notes
  - consequence/query paths
- Modeled dialogue / collectable / stat / notebook effects as queryable true/false tracking placeholders rather than direct click-to-unlock behavior.

### Present chart prototype v2

- Clarified that present is the starting structure for all memories.
- Clarified that Day 7 is the ending-day present state.
- Added a left-side navigation bar.
- Added a simple node-name search field.
- Added an overall progress panel for simulated player-state tracking.
- Added explicit UI readouts for memories-entered, choices recorded, collectables recorded, notebook progress, and ending readiness.

### Present chart prototype v3

- Rebuilt the present graph so the structure radiates from a central present hub instead of reading as a top-down chain.
- Improved the early memory schedule skeleton:
  - Day 1 -> Florist
  - Days 2-4 -> R&J / Villain / Child
  - Day 5 -> Boris
- Hid the selected-node panel until a node is clicked.
- Added a memory-entry action button that appears when a memory-entry node is selected.
- Made the left navigation panel horizontally resizable.
- Improved selection contrast and focus states to avoid low-contrast white-on-white interaction issues.
- Reworked edge layout to better match the new center-origin node positions.

### React flow app restructuring

- Created the root-level React app workspace at [peaceland game flow](</D:/Peaceland/peaceland game flow>) so the chart system no longer depends on single-file HTML prototypes.
- Split the app into present and memory feature views and moved node data into typed `src/data` files.
- Added dedicated `Florist Memory` and `R&J Memory` React views aligned to the corresponding gameplay graph drafts in the Unity repo.
- Fixed dark-theme form controls in the React app to avoid white-on-white text in browser selects and inputs.

### Present map React restructure v1

- Rebuilt the React present view into a present-only network layout instead of the earlier generic three-column graph board.
- Changed present-node placement from absolute hand-authored coordinates to relative cluster layout:
  - major location nodes act as anchors
  - smaller branch nodes orbit around their anchor locations
- Added a collapsible left navigation bar for search, day notes, and the overall progress panel.
- Moved the selected-node detail view into a left-side overlay drawer that opens on top of the graph instead of using a fixed right column.
- Added selected-node focus behavior:
  - choosing a node recenters the graph on that node
  - only the selected node and its immediate connected nodes stay in focus
  - closing the drawer returns to full graph view
- Expanded the present data model with explicit route nodes for:
  - Day 1 Florist
  - Days 2-4 R&J / Villain / Child choice set
  - Day 5 Boris
- Added present-only query nodes for:
  - NPC day schedule skeleton
  - consequence path tracking
  - museum interview state
  - artifact document and collectable placeholders
- Preserved the `Enter Memory` action on route-capable nodes inside the overlay drawer.
- Verified the React app TypeScript build graph with `npx tsc -b`.
- Observed that `npm run build` currently fails on this machine because Vite's esbuild step hits `spawn EPERM`; this is a local build-process issue rather than a TypeScript error in the present view rewrite.

## Notes

- `D:\Peaceland` is now a git repository root for docs, charts, local art, and planning files.
- `D:\Peaceland\peaceland_Yu_Edit` remains a separate nested git repository for the Unity project.
- Current chart prototype files under `aidoc/charts/` are tracked by the outer `D:\Peaceland` repository.
