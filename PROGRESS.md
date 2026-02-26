# Progress: RRULE PR #2032 Feedback Rework

> Addressing maintainer review comments for upstream merge

## Milestone 1: Spikes & Research

| ID | Task | Complexity | Status |
|----|------|------------|--------|
| spike_1_1 | Spike - Todoist API structured recurrence data + Go NLP libs | 1.8 | Done |
| spike_1_2 | Spike - Structured repeat API model design | 2.4 | Done |

## Milestone 2: Backend Changes (blocked by M1)

| ID | Task | Complexity | Status |
|----|------|------------|--------|
| feature_2_1_1 | Add TaskRepeat struct (14 fields, 1:1 ROption mirror) and JSON serialization | 2.5 | Done |
| feature_2_1_2 | Update CalDAV to use internal RRULE string | 1.6 | Done (verified, no changes needed) |
| feature_2_2_1 | Verify and clean up RepeatDay references | 1.2 | Done |
| feature_2_3_1 | Add RRULE validation in Task Create/Update | 1.2 | Done |
| feature_2_3_2 | Add validation tests | 1.0 | Done |
| feature_2_4_1 | Revert auto-set due date behavior | 1.0 | Done |
| feature_2_5_1 | Todoist: English-only + lang gate | 2.2 | Done |

## Milestone 3: Frontend Changes (blocked by M2)

| ID | Task | Complexity | Status |
|----|------|------------|--------|
| feature_3_1_1 | Update TypeScript model for structured repeat | 1.2 | Done |
| feature_3_1_2 | Update RepeatAfter.vue to use structured data | 1.8 | Done |
| feature_3_1_3 | Remove rrule.ts helper | 1.2 | Done (rewritten, not deleted - still provides utility functions) |

## Milestone 4: Testing & Cleanup (blocked by M2, M3)

| ID | Task | Complexity | Status |
|----|------|------------|--------|
| feature_4_1 | Update web tests for structured repeat model | 1.4 | Done |
| feature_4_2 | Run full test suite | 1.6 | Done |
| feature_4_3 | Squash and reorder commits for clean PR | 1.8 | Done (commits already logical) |

## Gate: Human Review Before Push

> **MANUAL GATE**: All implementation work happens locally. Before any updated PR
> is force-pushed to the upstream branch, present a full summary of changes to the
> user for review. Only push when the user explicitly approves.
>
> Checklist before requesting approval:
> - [ ] All tests passing (backend + frontend)
> - [ ] Lint clean (backend + frontend)
> - [ ] Commits logically ordered and well-messaged
> - [ ] Diff reviewed for accidental inclusions
> - [ ] PR description drafted for maintainer
