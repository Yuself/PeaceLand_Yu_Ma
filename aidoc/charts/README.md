# Peaceland Charts

Last updated: `2026-06-04`

## Purpose

This folder stores local chart planning notes and interactive prototypes for Peaceland flow visualizations.

## Current Direction

- Source of truth for team-maintained content should be a shared Google Sheet on Drive.
- The website graph should read exported structured data, likely JSON generated from that sheet.
- The first prototype is local-only and focuses on shape, layout, and interaction patterns.

## Graph Model

- Every chart item is an individual node.
- `scene` nodes render as rectangles.
- `trigger` nodes render as ellipses.
- `dialogue` and `minigame` nodes are scene-like nodes with extra badges/details.
- Nodes are connected by directed edges.

## Reusable Node Levels

- Level 1 nodes are the largest structural anchors.
- In Present, level 1 nodes are locations.
- In Memory, level 1 nodes are scene changes.
- Level 2 nodes are medium content nodes such as collectables, dialog, and minigames.
- Level 3 nodes are short interaction/action nodes, often used as bridges between two nodes.

## Current Rework Notes

- Present requirements: [present/PRESENT_REWORK_REQUIREMENTS.md](/D:/Peaceland/aidoc/charts/present/PRESENT_REWORK_REQUIREMENTS.md)
- Memory requirements: [memory/MEMORY_REWORK_REQUIREMENTS.md](/D:/Peaceland/aidoc/charts/memory/MEMORY_REWORK_REQUIREMENTS.md)

## Current xyflow Editor Features

- Shared React Flow editor board for Present and Memory.
- Manual node dragging.
- Connect nodes by dragging from source handles to target handles.
- Add draft nodes from the in-canvas node palette.
- Duplicate and delete selected nodes.
- Resize level 1 nodes.
- Box/multi-select support through React Flow selection behavior.
- Dagre-based left-to-right auto layout.
- Save and restore layout from browser localStorage per graph.

## Node Interaction States

1. Collapsed: title only
2. Preview: short summary shown on hover/focus
3. Expanded: full details shown on click

## Expanded Node Fields

- title
- short summary
- full summary
- interaction details
- stats
- notebook / collectable placeholders
- outcome range, when applicable

## Current Florist Prototype Goals

- mimic an Obsidian-like skill tree feel
- support pan/zoom later, but not required for v1
- show a dark board with color-coded individual nodes
- use a downward linear florist graph
- keep each node self-contained
- include special detail sections for interactable nodes

## Four Stats

- `S/A`: Selfish <-> Altruistic
- `I/N`: Insight <-> Naivety
- `N/RA`: Nationalism <-> Rebellion / Apathy
- `K/C`: Kindness <-> Cruelty

## Notebook / Collectable Buckets

Three buckets should exist on applicable nodes:

- `Document`
- `Minigame Outcome`
- `Scene Collectable`

Placeholders are allowed where content is not yet authored.
