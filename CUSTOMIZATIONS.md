# Customizations

## 2026-02-04

- Temporary patch: resolve Control UI assets for linked global installs by using module URL and initial CWD when resolving repo root and dist index.
- Updated `ensureControlUiAssetsBuilt()` to accept explicit argv1/moduleUrl/cwd inputs.
- Added Control UI asset resolution tests for module URL cases.
- Applied upstream PR #8413 (temporary until merged upstream).
