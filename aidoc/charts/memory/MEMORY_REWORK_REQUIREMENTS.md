# Memory Rework Requirements

Last updated: `2026-06-04`

## Working Agreement

For Memory graph work, after each user request I should restate the requested model and confirm that the implementation direction matches before making broad code changes.

This document records the reusable Memory node model that should guide Florist, R&J, and future memory views.

## User Request Snapshot

Memory needs a reusable 3-level node pattern.

Confirmed direction from the request:

- Memory graphs should use the same reusable level concept as Present.
- Memory also has 3 node levels.
- Level 1 is the largest node tier.
- In Memory, the largest node is `scene change`.
- Inside each scene, there can be interaction content such as dialog.
- Inside each scene, there can also be minigames.
- Dialog and minigames are level 2.
- Collectables are also part of the Memory graph model.
- Level 3 is in-game interaction, usually short action verbs.
- Level 3 interactions often connect two nodes.

## Node Levels

Level 1: Scene Change

- Largest visual node.
- Represents a major scene state, scene transition, or loaded scene context.
- Should anchor the local cluster of child content.
- Examples: entering a memory scene, moving from exterior to interior, starting a new customer scene, switching to an escape scene.

Level 2: Scene Content

- Medium-size node.
- Belongs inside or near a scene-change node.
- Can represent dialog, minigame, or collectable content.
- Examples: a conversation node, a bouquet minigame, a letter puzzle, a collectable item.

Level 3: In-Game Interaction

- Smallest visual node.
- Usually a short action or verb phrase.
- Often links two larger nodes.
- Examples: inspect, talk, pick up, trim, dethorn, arrange, open door, hand item, choose response.

## Reusable Roles

The code model should support these roles:

- `scene-change`
- `dialog`
- `minigame`
- `collectable`
- `scene-interaction`

Present-specific roles can coexist with this model:

- `location`
- `interaction-trigger`

## Edge Rules

Memory graphs do not need to be a simple single line.

Expected edge patterns:

- Scene-change nodes can connect to other scene-change nodes.
- Scene-change nodes can connect to their level 2 dialog, minigame, or collectable nodes.
- Level 3 in-game interactions can connect two nodes when the action is the meaningful bridge.
- Not every detail node has to connect globally.

## Implementation Direction

Current code state after this note:

- `GraphNode` supports optional `level`.
- `GraphNode` supports optional `role`.
- `NodeKind` supports `dialog`, `minigame`, `collectable`, and `interaction-trigger`.
- `GraphBoard` can render level classes for memory nodes.
- Memory views use a React Flow board.
- Memory nodes can be dragged manually.
- Memory views include a Dagre-based `Auto Layout` action that reflows nodes from left to right.
- Memory nodes can be connected by dragging between handles.
- Memory views support draft node creation from an in-canvas node palette.
- Memory views support selected-node duplicate, delete, and level 1 resize.
- Memory layouts can be saved and restored from browser localStorage.
- Florist and R&J nodes are currently annotated with transitional `level` and `role` values.

Required next implementation pass:

- Split existing Florist combined scene nodes into scene-change nodes plus level 2 dialog/minigame/collectable children.
- Split existing R&J combined scene nodes into scene-change nodes plus level 2 dialog/minigame/collectable children.
- Add level 3 short interaction nodes where the action is the meaningful transition between nodes.
- Keep the old verified story order as source material, but do not force every node into one connected linear chain.

## Layout Direction

Memory should use a left-to-right graph layout by default.

Layout rules:

- The graph can be manually edited by dragging nodes.
- `Auto Layout` resets nodes into a left-to-right arrangement.
- New nodes should be assigned `level` and `role`, then Auto Layout should place them into readable columns.
- The orbit/radial layout is not required for Memory if the left-to-right layout reads better.

## Risks And Ambiguities

- Existing Florist and R&J data currently combine scene changes, dialog, and minigames into single scene nodes.
- Splitting those combined nodes should preserve verified source notes rather than invent new content.
- Level 3 interaction nodes should stay short and action-like; long explanations belong in node details, not node titles.
- A level 3 interaction edge can make the graph more readable, but too many tiny action nodes can make the map noisy.
