# Tessa Rename Integration Workflow

This document describes how to integrate changes from the `main` branch (with "moltbot" naming) into the `tessa-rename` branch while preserving the rename.

## Branch Strategy

```
main (moltbot)           tessa-rename (tessa)
     |                         |
     |-- new features          |-- rename changes
     |                         |
     |                    rebase/merge
     +------------------------>|
                               |-- conflicts resolved
                               |-- rename preserved
```

## Core Principle

**Always prefer "tessa" naming in conflicts.** The rename takes precedence over main branch naming.

---

## Workflow 1: Periodic Rebase (Recommended)

Use this to integrate all changes from main regularly.

### Step 1: Prepare

```bash
# Ensure you're on the rename branch with clean working tree
git checkout tessa-rename
git status  # should be clean

# Fetch latest from main
git fetch origin main
```

### Step 2: Rebase onto main

```bash
# Start interactive rebase
git rebase origin/main

# OR for non-interactive (if confident):
git rebase origin/main
```

### Step 3: Resolve Conflicts (Automated Strategy)

When conflicts occur, apply this priority:

**Priority 1: Rename-specific files (always keep tessa version)**
```bash
# For core rename files, always use ours (tessa):
git checkout --ours package.json
git checkout --ours src/cli/cli-name.ts
git checkout --ours src/config/paths.ts
git checkout --ours src/compat/legacy-names.ts
git checkout --ours README.md
git checkout --ours AGENTS.md

git add package.json src/cli/cli-name.ts src/config/paths.ts src/compat/legacy-names.ts README.md AGENTS.md
```

**Priority 2: New files from main (accept theirs, then rename)**
```bash
# For new files added on main:
git checkout --theirs path/to/new/file.ts
# Then manually rename moltbot→tessa in the file
sed -i '' 's/moltbot/tessa/g; s/Moltbot/Tessa/g; s/MOLTBOT_/TESSA_/g; s/\.moltbot/.tessa/g' path/to/new/file.ts
git add path/to/new/file.ts
```

**Priority 3: Modified files (merge manually with rename)**
```bash
# For files modified on both branches:
# 1. Accept main's changes
git checkout --theirs src/some/file.ts
# 2. Apply rename transformations
sed -i '' 's/moltbot/tessa/g; s/Moltbot/Tessa/g; s/MOLTBOT_/TESSA_/g; s/\.moltbot/.tessa/g' src/some/file.ts
# 3. Review and stage
git add src/some/file.ts
```

### Step 4: Continue Rebase

```bash
git rebase --continue

# Repeat conflict resolution for each commit until done
```

### Step 5: Verify

```bash
# Build and test
pnpm build
pnpm test

# Check for any missed "moltbot" references
grep -r "moltbot" src/ --include="*.ts" | grep -v "legacy" | head -20
```

---

## Workflow 2: Cherry-Pick Specific Commits

Use this to selectively integrate specific features from main.

### Step 1: Identify Commits

```bash
# View commits on main that aren't on tessa-rename
git log tessa-rename..origin/main --oneline

# OR view by author/date/message
git log origin/main --since="2026-01-20" --author="contributor" --oneline
```

### Step 2: Cherry-Pick

```bash
git checkout tessa-rename

# Pick a single commit
git cherry-pick <commit-hash>

# Pick a range of commits
git cherry-pick <start-hash>^..<end-hash>
```

### Step 3: Resolve Conflicts (Same as Workflow 1)

Apply the same conflict resolution strategy as rebase.

### Step 4: Apply Rename Transform

After cherry-picking, ensure the new code uses tessa naming:

```bash
# Quick rename pass on changed files
git diff --name-only HEAD~1 | while read file; do
  sed -i '' 's/moltbot/tessa/g; s/Moltbot/Tessa/g; s/MOLTBOT_/TESSA_/g; s/\.moltbot/.tessa/g' "$file"
done

# Review changes
git diff

# Amend if needed
git add -u
git commit --amend --no-edit
```

---

## Workflow 3: Merge Strategy (Alternative)

Use this if you prefer merge commits over rebase.

### Step 1: Merge with Custom Strategy

```bash
git checkout tessa-rename
git merge origin/main --no-commit

# Resolve conflicts as in Workflow 1
# Then commit:
git commit -m "Merge main into tessa-rename, preserving tessa naming"
```

---

## Helper Scripts

### Script 1: Auto-Rename New Files

Create `scripts/apply-tessa-rename.sh`:

```bash
#!/usr/bin/env bash
# Apply tessa rename to specified files

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <file1> [file2] ..."
  exit 1
fi

for file in "$@"; do
  if [ -f "$file" ]; then
    echo "Renaming in $file..."
    sed -i '' '
      s/moltbot/tessa/g
      s/Moltbot/Tessa/g
      s/MOLTBOT_/TESSA_/g
      s/CLAWDBOT_/TESSA_/g
      s/\.moltbot/.tessa/g
      s/moltbot\.json/tessa.json/g
      s/clawdbot\.json/tessa.json/g
    ' "$file"
  else
    echo "Skipping $file (not found)"
  fi
done

echo "Done!"
```

Make executable:
```bash
chmod +x scripts/apply-tessa-rename.sh
```

### Script 2: Find Missed Renames

Create `scripts/check-rename.sh`:

```bash
#!/usr/bin/env bash
# Check for missed moltbot/clawdbot references

set -euo pipefail

echo "=== Checking for missed 'moltbot' references ==="
grep -r "moltbot" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "legacy" \
  | grep -v "LEGACY" \
  | grep -v "// keep as moltbot" \
  || echo "✓ No missed moltbot references"

echo ""
echo "=== Checking for missed 'Moltbot' references ==="
grep -r "Moltbot" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "legacy" \
  | grep -v "LEGACY" \
  || echo "✓ No missed Moltbot references"

echo ""
echo "=== Checking for missed MOLTBOT_ env vars ==="
grep -r "MOLTBOT_" src/ --include="*.ts" \
  | grep -v "TESSA_.*MOLTBOT_" \
  | grep -v "|| process.env.MOLTBOT_" \
  || echo "✓ No missed MOLTBOT_ references"
```

Make executable:
```bash
chmod +x scripts/check-rename.sh
```

---

## Conflict Resolution Priority Reference

| File Type | Strategy | Command |
|-----------|----------|---------|
| **Core rename files** | Always keep tessa version | `git checkout --ours <file>` |
| **New files from main** | Accept main, then rename | `git checkout --theirs <file>` + rename |
| **Modified files** | Merge manually | Edit file, apply rename |
| **Documentation** | Keep tessa version | `git checkout --ours <file>` |
| **Tests** | Merge + rename | Accept main, apply rename |
| **Dependencies** | Keep main version | `git checkout --theirs package.json` then update name |

---

## After Integration Checklist

After any integration (rebase/cherry-pick/merge):

```bash
# 1. Check for compile errors
pnpm build

# 2. Run rename check script
./scripts/check-rename.sh

# 3. Check for any remaining "moltbot" in key files
grep -i "moltbot" package.json src/cli/cli-name.ts src/config/paths.ts

# 4. Verify CLI still works
pnpm tessa --version
pnpm tessa --help | head -20

# 5. Run tests
pnpm test

# 6. Check critical paths still use tessa
grep "DEFAULT_CLI_NAME" src/cli/cli-name.ts  # should be "tessa"
grep "NEW_STATE_DIRNAME" src/config/paths.ts  # should be ".tessa"

# 7. Verify package name
jq -r '.name' package.json  # should be "tessa"
```

---

## Emergency: Undo Integration

If integration goes wrong:

```bash
# If rebase in progress
git rebase --abort

# If merge in progress
git merge --abort

# If commits already made (reset to before integration)
git reflog  # find the commit hash before integration
git reset --hard <hash-before-integration>
```

---

## Long-Term Strategy

### Approach A: Keep Separate Branches Indefinitely
- Main branch: `moltbot` (legacy)
- Rename branch: `tessa-rename` → eventually becomes new `main`
- Periodically rebase tessa-rename onto main
- When ready, rename `main` → `main-legacy`, `tessa-rename` → `main`

### Approach B: Merge Rename to Main
- Complete all rename work on `tessa-rename` branch
- Test thoroughly
- Merge to main in one big PR
- All future work uses tessa naming

**Recommendation:** Use Approach B once rename is complete and tested.

---

## Pro Tips

1. **Use `git rerere`** (reuse recorded resolution):
   ```bash
   git config rerere.enabled true
   ```
   This remembers how you resolved conflicts and auto-applies them in future rebases.

2. **Create conflict markers for rename:**
   ```bash
   git config merge.conflictstyle diff3
   ```
   Shows the original version in conflicts, making it easier to see what changed.

3. **Automate with hooks:**
   Create `.git/hooks/post-merge` to auto-run rename checks:
   ```bash
   #!/usr/bin/env bash
   ./scripts/check-rename.sh
   ```

4. **Use interactive rebase for cleanup:**
   ```bash
   git rebase -i origin/main
   ```
   Allows you to squash rename fix-up commits.

---

## Summary

**Daily Development:**
- Work on `tessa-rename` branch
- All new code uses tessa naming

**Weekly/Bi-Weekly Integration:**
- Run Workflow 1 (rebase onto main)
- Resolve conflicts following priority rules
- Run checklist

**Selective Feature Integration:**
- Run Workflow 2 (cherry-pick)
- Apply rename transform
- Test and verify

**Goal:**
Eventually merge `tessa-rename` → `main` and make tessa the official naming.
