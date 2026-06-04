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
