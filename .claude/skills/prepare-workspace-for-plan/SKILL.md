---
name: prepare-workspace-for-plan
description: Use when you have a plan file ready and need to create an isolated git worktree for implementation - creates worktree from upstream/main (for clean PRs) and moves the plan file
---

# Prepare Workspace for Plan

Use this skill when you have created or refined a plan and need to set up an isolated workspace for implementation.

## When to Use

- After creating/finalizing a plan in the `plans/` directory
- Before starting implementation of a multi-phase plan
- When you need an isolated branch for a feature or fix

## Prerequisites

- A plan file exists in the current workspace's `plans/` directory
- You are in a git repository that supports worktrees
- The `upstream` remote points to the original repo (go-vikunja/vikunja)

## Steps

### 1. Determine Workspace Name

Choose a name following the project convention:
- `fix-<description>` for bug fixes (branch: `fix/<description>`)
- `feat-<description>` for new features (branch: `feat/<description>`)

The name should be kebab-case and descriptive but concise.

### 2. Fetch Upstream

**CRITICAL**: Always fetch upstream before creating a worktree to ensure you're branching from the latest code.

```bash
git fetch upstream
```

### 3. Create the Git Worktree from Upstream

**IMPORTANT**: Create from `upstream/main`, NOT from `origin/main` or local `main`.

This ensures clean PRs to upstream without fork-specific commits.

```bash
# For bug fixes
git worktree add ../<workspace-name> -b fix/<description> upstream/main

# For features
git worktree add ../<workspace-name> -b feat/<description> upstream/main
```

### 4. Create Plans Directory and Move Plan

```bash
mkdir -p ../<workspace-name>/plans
mv plans/<plan-file>.md ../<workspace-name>/plans/
```

### 5. Verify Structure

```bash
ls -la ../<workspace-name>/plans/
```

## Example

```bash
# Fetch latest upstream
git fetch upstream

# Create worktree for RRULE calculation fix (from upstream/main)
git worktree add ../fix-rrule-calculation -b fix/rrule-calculation upstream/main

# Move the plan
mkdir -p ../fix-rrule-calculation/plans
mv plans/rrule-fixes.md ../fix-rrule-calculation/plans/
```

## Result

After completion, you'll have:
```
parent-directory/
├── vikunja/                 # Main workspace (fork's main)
├── <new-workspace>/         # New worktree (based on upstream/main)
│   └── plans/
│       └── <plan-file>.md   # Your plan
└── ...                      # Other existing worktrees
```

## Branch Workflow

| Step | Command |
|------|---------|
| Create branch | `git worktree add ../fix-foo -b fix/foo upstream/main` |
| Push to fork | `git push -u origin fix/foo` |
| Create PR | PR from `IAMSamuelRodda/vikunja:fix/foo` → `go-vikunja/vikunja:main` |
| After merge | Delete worktree, sync fork's main with upstream |

## Notes

- **Always base from `upstream/main`** for upstream contributions
- The new worktree shares git history but has its own working directory
- Changes won't affect main until merged
- Plans are not committed to git (see `.gitignore`)
- Push to `origin` (your fork), PR to `upstream` (original repo)
- After upstream accepts, merge `upstream/main` into fork's `main`
