# Peaceland Game Flow

This folder restructures the chart prototypes into a dedicated React project.

## Intended scope

- present-first map flow
- memory flow views
- NPC interaction unlock prototypes
- shared navigation, search, and detail panels
- data-driven node graphs
- browser-side import / export workflow for team editing

## Current structure

- `src/app/`: app shell and layout
- `src/assets/`: local static assets such as placeholders and gallery items
- `src/components/`: reusable graph and panel components
- `src/data/`: present, memory, and app-level display data such as the devlog and dev advice records
- `src/features/`: top-level user-facing views:
  - `present/`
  - `memory/`
  - `npc/`
  - `collectables/`
  - `stats/`
  - `newspaper/`
- `src/hooks/`: app state and document draft hooks
- `src/styles/`: global CSS and view styling
- `src/types/`: shared TypeScript types for graph and stat-simulation data
- `src/utils/`: browser-side workbook helpers, graph document helpers, collectable helpers, and stat-simulation logic
- `dist/`: build output only; deploy from here, do not hand-edit
- `node_modules/`: local install only

Key local docs:

- [README.md](/D:/Peaceland/peaceland%20game%20flow/README.md): structure, workflow, and deployment notes
- [HISTORY.md](/D:/Peaceland/peaceland%20game%20flow/HISTORY.md): structural and feature change log
- `src/data/devlog.ts`: shipped site-release summary shown in the UI footer
- `src/data/devAdvice.ts`: implementation advice cards shown in the UI footer

## Current prototype note

- `Florist NPC` is a dedicated present-day NPC prototype page.
- It tests a single NPC root node, notebook-gated interaction unlocks, friendship tiers, and a level-2 choice that branches into different level-3 dialogue interactions.
- It is intentionally local-state driven so unlock logic can be tested before being merged into the shared graph schema.

## Documentation Maintenance Rule

Every future change to this app must update documentation in the same task when relevant.

Required rule:

1. Update `README.md` if folders, responsibilities, entry points, or workflows changed.
2. Update `HISTORY.md` if behavior, UI, data flow, tooling, or architecture changed.
3. Update `src/data/devlog.ts`, `package.json`, and `index.html` metadata if the site release version changed.

Do not leave directory docs or history for later.

## Team editing workflow

1. Open the site.
2. Edit nodes and edges directly in the graph editor and sheet sections.
3. Use `Export Excel Workbook` from the `Data Exchange` panel.
4. Upload the exported workbook to the shared Google Drive folder.
5. Another teammate can download that workbook, use `Import Excel Workbook`, continue editing, and export a new version.

Recommended rule:

- treat the latest exported workbook on Drive as the current editable handoff file
- keep timestamped exports instead of overwriting without history

## Teammate workflow

- Download the newest workbook from shared Drive.
- Open the site and use `Import Excel Workbook`.
- Make changes in-browser.
- Use `Export Excel Workbook` and upload the new timestamped file back to Drive.
- Do not assume this is real-time collaboration; always start from the newest shared workbook.

## Site owner workflow

1. Pull the latest source code changes locally.
2. Open the local editor and verify the current workbook flow still works.
3. Rebuild with `npm run build` if any source code changed.
4. Upload the contents of `dist/` to the target `people.rit.edu/ym7603` web directory.
5. Treat `dist/` as the only deployment artifact.

## Deployment

- Production-ready static files are generated into `dist/`.
- For `people.rit.edu/ym7603`, upload the contents of `dist/` to the target web directory.

## Footer Notes

Each site release should update `src/data/devlog.ts`:

1. Bump `SITE_VERSION`.
2. Add a new object at the top of `DEVLOG_ENTRIES` with the date and a short list of changes.
3. Sync `package.json` `version` and `index.html` `<meta name="application-version">` / `<title>`.

The devlog renders in the page footer as an expandable HTML panel.

Implementation guidance that should stay visible in the site UI belongs in `src/data/devAdvice.ts`.
That file renders as a separate expandable `Dev Advice` panel so technical follow-ups do not get mixed into the shipped release log.

## History

Broader project-level structure and feature history should be written to [HISTORY.md](/D:/Peaceland/peaceland%20game%20flow/HISTORY.md).
Use the footer devlog for release-facing summaries and `HISTORY.md` for fuller local maintenance history.

## Status

The app now builds successfully with `npm run build`.
