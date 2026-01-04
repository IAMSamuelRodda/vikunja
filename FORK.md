# Vikunja Fork - Samuel Rodda

> Personal fork with experimental features pending upstream merge.
> **Upstream**: [go-vikunja/vikunja](https://github.com/go-vikunja/vikunja)

## Why This Fork Exists

This fork serves as:
1. **PR Staging Ground** - Live demos of features under review
2. **Early Access Build** - Use new features before upstream merge
3. **Contribution Portfolio** - Showcase of my work on Vikunja

## Try the Demo

**[🚀 Create Demo Account](https://try.vikunja.arcforge.au/demo-account-create)**

Zero-click demo: automatically creates an account with sample data and logs you in.

## Docker Image

```bash
# Pull the fork build (all features integrated)
docker pull ghcr.io/iamsamuelrodda/vikunja:unstable-fork
```

---

## Features in This Fork

### 🔄 RFC 5545 RRULE Recurrence Migration
**Status**: [PR #2032](https://github.com/go-vikunja/vikunja/pull/2032) - Open

Migrates Vikunja's legacy recurrence system to RFC 5545 RRULE format, enabling proper synchronization with CalDAV clients (iOS Reminders, Thunderbird, Google Calendar).

<!-- TODO: Add demo video -->
<!-- ![RRULE Sync Demo](docs/fork/rrule-sync-demo.mp4) -->

**Problem Solved**:
- Legacy `repeat_after` field used seconds-based intervals with no standard format
- CalDAV clients couldn't sync recurring tasks properly
- No support for complex recurrence patterns (e.g., "every 2nd Tuesday")

**Solution**:
- New `rrule` field stores RFC 5545 compliant recurrence rules
- Automatic migration from legacy fields to RRULE on task access
- Full iCal/CalDAV compatibility

**Key Changes**:
| File | Change |
|------|--------|
| `pkg/models/tasks.go` | Added `RRULE` field, migration logic |
| `pkg/models/task_collection.go` | RRULE-aware task filtering |
| `frontend/src/models/` | TypeScript interfaces updated |
| `pkg/migration/` | Database migration for rrule column |

---

### ⭐ Saved Filter Favorite Fix
**Status**: [PR #2031](https://github.com/go-vikunja/vikunja/pull/2031) - Open

Fixes a bug where the `IsFavorite` property wasn't preserved when reading saved filters.

**Problem**: Marking a saved filter as favorite would persist to database but not return correctly on subsequent reads.

**Solution**: Ensure `IsFavorite` is included in the `ReadOne` response.

---

### 🗂️ Compact Sidebar Mode (In Development)
**Status**: Branch `feat/compact-sidebar` - Not yet PR'd

Enhanced sidebar with collapsible sections and improved navigation UX.

<!-- TODO: Add demo video -->
<!-- ![Sidebar Demo](docs/fork/sidebar-compact-demo.mp4) -->

**Features**:
- Collapsible project groups
- Task count badges
- Improved visual hierarchy
- Persistent expand/collapse state

---

## Installation

### Docker (Recommended)

```bash
# Use this fork's image instead of upstream
docker pull ghcr.io/iamsamuelrodda/vikunja:unstable-fork

# Docker Compose example
services:
  vikunja:
    image: ghcr.io/iamsamuelrodda/vikunja:unstable-fork
    # ... rest of config same as upstream
```

### From Source

```bash
# Clone this fork
git clone https://github.com/iamsamuelrodda/vikunja.git
cd vikunja

# Standard Vikunja build
mage build

# Frontend
cd frontend && pnpm install && pnpm build
```

See [upstream docs](https://vikunja.io/docs) for full setup guide.

---

## Staying Current with Upstream

This fork regularly merges from upstream to stay compatible:

```bash
git fetch upstream
git merge upstream/main
git push origin main
```

| Date | Upstream Commit | Notes |
|------|-----------------|-------|
| <!-- Add sync dates here --> | | |

---

## For Maintainers

Each feature branch corresponds to an open PR. To test features in isolation:

```bash
# Clone and checkout specific feature
git clone https://github.com/iamsamuelrodda/vikunja.git
git checkout feat/rrule-upstream-pr

# Or use the main branch for all features combined
git checkout main
```

---

## Contributing Back

All significant features are submitted as PRs to upstream. This fork is not intended to diverge permanently - it's a proving ground for contributions.

**Contribution Workflow**:
1. Create branch from `upstream/main` (not fork's main)
2. Develop and test locally
3. Submit PR to upstream
4. Merge to fork's main for combined testing
5. Delete branch after upstream accepts

---

## Contact

- **GitHub**: [@iamsamuelrodda](https://github.com/iamsamuelrodda)
- **Portfolio**: [arcforge.au](https://arcforge.au)

---

*This fork is maintained for personal use and contribution staging. For production use, consider the [official Vikunja releases](https://vikunja.io).*
