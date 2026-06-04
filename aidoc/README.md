# Peaceland AI Doc Staging

This folder is the temporary local staging area for Peaceland AI docs and Drive-synced reference files.

## Purpose

- keep newly found Drive documents locally available
- preserve source metadata, especially creation time
- maintain a short human-readable index of what is new

## Current Structure

```text
D:\Peaceland\aidoc
|- README.md
|- drive_sync\
|  |- INDEX.md
|  |- 2026-06-02__peaceland-build-testing-notes.md
```

## Update Rule

Whenever Drive is queried for new Peaceland files:

1. default to metadata-only search first
2. only download files here when the user asks to sync/download them, or when the workflow explicitly requires a local sync
3. preserve Drive creation and modified timestamps in the local record
4. update `drive_sync/INDEX.md`
5. add a short summary so the newest file can be understood at a glance

Last local sync update: `2026-06-03T10:13:46.3062767-04:00`
