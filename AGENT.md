# AGENT.md

## Project

Project name: `Peaceland`

Workspace root: `D:\Peaceland`

Primary role of the user in this workspace: `design dev`

This workspace is intended to hold two separate git repositories:

1. `peaceland-dev`
   - The working project repo.
   - Expected to contain the playable game project, code changes, design implementation, UI work, prototypes, AI docs, production notes, and other development artifacts.
   - This may be a fork of the main project repo if the team workflow uses forks.
   - AI/offload/reference document packs should go into an `aidoc/` area inside this repo unless the user explicitly defines a different docs path.

2. `peaceland-assets`
   - The clean asset repo.
   - Expected to contain only source art and game asset files that belong in the asset library.
   - No design docs, AI workflow docs, implementation notes, or unrelated project-management files should live here.

If the exact repo names differ, preserve the same separation of responsibility.

## Local Repo Routes

Current user-directed local routes:

1. `D:\Peaceland\peaceland_Yu_Edit`
   - Local edit clone of the older GitHub repo `Peaceland-Game/Peaceland-Spring-2025.git`
   - Intended behavior: `pull` allowed, `push` should not be used
   - Commits are intended to stay local
   - Work should happen on a local branch rather than directly on the tracked default branch

2. `D:\1_schoolwork\selflearning\Peaceland-Spring-2025`
   - User-designated full working route
   - Intended behavior: can `update`, `pull`, `push`, and `commit`
   - This path was provided by the user and should be treated as the writable/publishable working copy unless later changed

## Workspace Intent

The root folder is a container for the Peaceland workspace, not the main repo itself.

The preferred future structure is:

```text
D:\Peaceland
|- AGENT.md
|- aidoc\
|  |- README.md
|  |- drive_sync\
|     |- INDEX.md
|- peaceland-dev\
|  |- aidoc\
|- peaceland-assets\
|- shared\
   |- references\
   |- exports\
   |- inbox\
```

Notes:

- `peaceland-dev` and `peaceland-assets` should each be their own independent git repository.
- The root `D:\Peaceland` does not need to be a git repository unless the user explicitly wants a meta-repo.
- Large binary exports that do not belong to either repo should stay outside the repos when possible.
- Until `peaceland-dev` exists, use root-level `aidoc/` as the temporary document staging area.

## Role Guidance

The user's role is `design dev`, so default priorities are:

- gameplay-facing design implementation
- UI and UX iteration
- asset integration
- scene or content assembly
- documentation that supports practical production work

Do not default to architecture-heavy refactors unless requested.
Do not move clean asset-library content into the dev repo unless the workflow explicitly requires a mirrored export/import path.

## Repo Boundary Rules

### `peaceland-dev`

Allowed content:

- game project files
- scripts and tooling for the game project
- `aidoc/` documents, offload packs, AI research notes, imported reference docs
- implementation notes
- AI docs
- workflow docs
- task tracking docs
- prototype assets needed for development
- imported or game-ready versions of assets

Avoid storing:

- master source art library if it is supposed to live in `peaceland-assets`
- large raw files that are not needed for development

### `peaceland-assets`

Allowed content:

- source PSDs
- sprites
- textures
- concept art
- audio source files
- other clean asset-library files

Avoid storing:

- code
- AI docs
- design logs
- planning notes
- mixed project-management content
- game-specific implementation experiments unless the user explicitly wants them there

## Default Operating Rules

When working in this workspace:

1. First determine which repo the task belongs to before editing.
2. If a file is ambiguous, prefer keeping implementation-side work in `peaceland-dev`.
3. If a file is a source asset, prefer `peaceland-assets`.
4. Keep docs near the repo they support. Cross-workspace loose docs should go under `D:\Peaceland\shared\` only if they do not belong clearly to one repo.
5. Do not initialize, merge, or restructure repos without explicit instruction.
6. Do not assume the fork model is correct; verify remotes before making git workflow recommendations.

## Git Expectations

Before giving git advice, verify:

- whether `peaceland-dev` is a fork or just a normal clone
- whether `peaceland-assets` has its own remote
- whether large files should be tracked with Git LFS
- whether `peaceland_Yu_Edit` is still configured as a no-push local edit clone
- whether the publishable working copy is still `D:\1_schoolwork\selflearning\Peaceland-Spring-2025`

If the user asks for setup help later, recommend checking:

- `git remote -v`
- `git branch -vv`
- whether `.gitattributes` exists
- whether large binary asset policy is already defined

## File Placement Guidance

Current observed file at workspace root:

- `Villain.psd`

This file likely belongs in the clean asset repo once that repo exists, unless the user wants a temporary staging area at root.

Referenced external file from the user:

- `D:\download\peaceland_codex_offload_pack.zip`

This should be treated as `aidoc` input and should be placed under the dev-side docs area when the user wants it imported.

## Drive Update Rule

The user may later ask the agent to check Google Drive for new Peaceland-related files and update its working knowledge.

Default mode for Drive checks: `low token mode`

When that happens:

1. search Drive first instead of assuming local copies are current
2. identify newly added or recently modified files relevant to Peaceland
3. capture the file title, location, and document type
4. record and use the file creation date when evaluating relevance, sequence, and freshness
5. distinguish creation date from last modified date when both are available
6. by default, return only the file list and metadata first
7. do not download full document content unless the user explicitly asks to sync or download the file, or unless the standing workflow for that folder already requires full sync
8. when syncing is requested, download the newest relevant files into the local `aidoc/` sync area
9. update the local directory index with sync time, file metadata, and a short summary
10. update recommendations based on the newest verified documents, not memory alone

Document creation dates are important signals and should be preserved whenever available.
If two docs conflict, prefer the newer verified source unless the user indicates an older source remains authoritative.

Recommended temporary local sync structure:

```text
D:\Peaceland\aidoc
|- README.md
|- drive_sync\
|  |- INDEX.md
|  |- YYYY-MM-DD__descriptive-file-name.md
|  |- YYYY-MM-DD__descriptive-file-name.meta.md
```

Rules for this sync area:

- every Drive query that finds new relevant files should refresh `INDEX.md`
- every downloaded file entry should include Drive URL, Drive file ID, created time, modified time, and local sync time
- `INDEX.md` should contain a brief summary for each file so the user can scan what is new
- if the original file is a Google Doc, prefer storing a Markdown export when available

Low token mode rules:

- default Drive search responses should stay at the metadata level whenever possible
- do not fetch or export full file bodies unless needed
- if a file has already been synced locally, compare timestamps first before re-downloading
- when reporting search results, summarize only the newest relevant items
- avoid re-reading large local files unless verification is necessary

## Agent Behavior

When assisting in this workspace:

- be pragmatic and repo-specific
- inspect the actual folder structure before proposing moves
- preserve repo boundary clarity
- favor low-risk organization over speculative cleanup
- ask before moving large groups of files
- treat the dev repo and asset repo as separate sources of truth
- when new Drive files are introduced, verify their dates and incorporate them into the current project context
- distinguish clearly between no-push clones and publishable working copies before doing git operations

## If Setup Has Not Happened Yet

If the repos do not exist yet, the next likely setup is:

1. create `peaceland-dev`
2. create `peaceland-assets`
3. move root-level source asset files into `peaceland-assets` after user confirmation
4. add any shared non-repo material under `shared`

Do not perform those steps automatically unless the user explicitly asks.
