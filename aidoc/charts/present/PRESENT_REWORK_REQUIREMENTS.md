# Present Rework Requirements

Last updated: `2026-06-04`

## Working Agreement

For Present graph work, after each user request I should first restate the request in my own words and confirm that we are working in the same direction before making substantive changes.

The current task is to document the new Present direction before doing large code changes.

## User Request Snapshot

User wants a major rewrite of the Present graph.

Current confirmed requirements:

- Present nodes do not all need to be connected.
- There are currently 4 location-level nodes.
- The 4 location names from the request were written as `mesuem`, `museum tree`, `war exitbit`, and `time squre`.
- Confirmed final names: `Museum`, `Memory Tree`, `War Exhibit`, and `Town Square`.
- `Museum` is the default center node that links to the other 3 location nodes.
- Each collectable placeholder must connect to its owning location.
- Each interaction placeholder must connect to its owning location.
- `Museum` also connects to its own collectable placeholder and interaction placeholder.
- Each location should initially have 1 `collectable` placeholder.
- Each location should initially have 1 `interactable` placeholder.
- These placeholders are for future use and can remain lightly authored for now.
- `location` nodes are the largest node type.
- `collectable` nodes are level 2 size.
- `interaction trigger` nodes are level 3 size.

## Initial Graph Structure

The Present graph should start as a location-first map, not a fully connected story flow.

Initial location layer:

- `Museum`
- `Memory Tree`
- `War Exhibit`
- `Town Square`

Default location relationships:

- `Museum -> Memory Tree`
- `Museum -> War Exhibit`
- `Museum -> Town Square`

Default detail-node relationships:

- `Museum -> Museum Collectable Placeholder`
- `Museum -> Museum Interaction Placeholder`
- `Memory Tree -> Memory Tree Collectable Placeholder`
- `Memory Tree -> Memory Tree Interaction Placeholder`
- `War Exhibit -> War Exhibit Collectable Placeholder`
- `War Exhibit -> War Exhibit Interaction Placeholder`
- `Town Square -> Town Square Collectable Placeholder`
- `Town Square -> Town Square Interaction Placeholder`

Non-requirements:

- Collectables do not need to connect to every other node beyond their owning location.
- Interaction triggers do not need to connect to every other node beyond their owning location.
- A node being present on the graph does not imply it is currently reachable through a directed story route.

## Node Levels

Level 1: Location

- Largest visual node.
- Represents a major present-day place or anchor.
- Should be visually dominant.

Level 2: Collectable

- Medium-size child/nearby node.
- Each location gets one placeholder collectable by default.
- Content can be placeholder until exact collectable data is known.

Level 3: Interaction Trigger

- Smallest node tier.
- Each location gets one placeholder interactable/interaction trigger by default.
- Represents clickable or inspectable present-side interaction points.

## Placeholder Defaults

Each location should get:

- 1 collectable placeholder.
- 1 interactable placeholder.

Suggested placeholder naming:

- `Museum Collectable Placeholder`
- `Museum Interaction Placeholder`
- `Memory Tree Collectable Placeholder`
- `Memory Tree Interaction Placeholder`
- `War Exhibit Collectable Placeholder`
- `War Exhibit Interaction Placeholder`
- `Town Square Collectable Placeholder`
- `Town Square Interaction Placeholder`

## Likely Implementation Changes

The current React Flow version should be simplified around the new node hierarchy.

Likely data-model changes:

- Add an explicit `level` or `sizeTier` field.
- Add an explicit `nodeRole` field such as `location`, `collectable`, `interaction-trigger`.
- Stop treating all Present nodes as route/story nodes.
- Allow edges to be optional.
- Keep location-center edges separate from optional detail-node edges.

Likely UI changes:

- Default graph view should show the 4 large location nodes first.
- `Museum` should appear as the visual center.
- Collectables and interaction triggers should appear around their owning location.
- Details should be inspectable without assuming route progression.

## Current Layout Behavior

- Present uses the shared React Flow board.
- Present nodes can be manually dragged.
- Present includes a Dagre-based `Auto Layout` action to reflow nodes from left to right.
- Auto Layout should be used after adding new nodes or when cells overlap.
- Manual drag positions can be saved and restored through browser localStorage.
- The left-to-right graph layout is acceptable for Present when it reads better than an orbit/radial map.

## Resolved Confirmations

- The final location names are `Museum`, `Memory Tree`, `War Exhibit`, and `Town Square`.
- Placeholder collectables connect to their owning location.
- Placeholder interaction triggers connect to their owning location.
- `Museum` connects to the other 3 locations and also to its own 2 placeholder nodes.

## Remaining Risks And Ambiguities

- The phrase after `future` in the request was unclear; current interpretation is that placeholders are for future use.
- If placeholder nodes are connected directly to locations, the graph will look more structured but may imply stronger gameplay relationships than intended.
- The graph currently uses placeholders only; exact future content still needs authored source data.
