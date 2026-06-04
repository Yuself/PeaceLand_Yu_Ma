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

## Notes

- `D:\Peaceland` is now a git repository root for docs, charts, local art, and planning files.
- `D:\Peaceland\peaceland_Yu_Edit` remains a separate nested git repository for the Unity project.
- Current chart prototype files under `aidoc/charts/` are tracked by the outer `D:\Peaceland` repository.
