# Issues: RRULE PR #2032 Feedback Rework

## Maintainer Review Comments (source: kolaente on PR #2032)

### 1. Frontend RRULE parsing duplicates backend logic
- **File**: `frontend/src/helpers/rrule.ts`
- **Concern**: Parsing RRULE in the frontend doubles the logic. API should pass structured data.
- **Resolution**: spike_1_2 -> feature_2_1_1 -> feature_3_1_1/2/3 (structured API model, remove frontend parsing)
- **Approach chosen**: Structured-only API (no raw RRULE in API responses)
- **Struct scope**: 14 fields mirroring rrule-go ROption 1:1 (excludes Dtstart and Byeaster only). Frontend uses what it needs, preserves the rest on round-trip.

### 2. RepeatDay column is redundant with RRULE
- **File**: `pkg/migration/20251228214425.go`
- **Concern**: BYMONTHDAY is already part of the RRULE string, separate column unnecessary.
- **Resolution**: feature_2_2_1 (verify it's already dropped, clean up migration)
- **Status**: RepeatDay is already a temporary bridge field dropped by migration 20251229100000. May just need migration consolidation.

### 3. RRULE validation needed on save
- **File**: `pkg/models/tasks.go` (setTaskDatesRRule)
- **Concern**: Invalid RRULE strings are silently accepted, only fail at task completion.
- **Resolution**: feature_2_3_1 + feature_2_3_2 (add validation + tests)

### 4. Don't auto-set due date (breaking change)
- **File**: `pkg/models/tasks.go` (line 1534)
- **Concern**: Repeating tasks without due dates now get auto-assigned a due date. This changes upstream behavior.
- **Resolution**: feature_2_4_1 (revert to upstream behavior: repeat + no due date = no-op)

### 5. Todoist migration NLP fragility
- **File**: `pkg/modules/migration/todoist/todoist.go` (todoistDueStringToRRule)
- **Concern**: Regex-based English-only parser won't work for non-English Todoist users. Maintenance burden.
- **Resolution**: spike_1_1 (research API fields + Go NLP libraries) -> feature_2_5_1

## Spikes Required

| Spike | Uncertainty | Blocking |
|-------|-------------|----------|
| spike_1_1: Todoist API + NLP libs | 4/5 | feature_2_5_1 |
| spike_1_2: Structured API model | 3/5 | feature_2_1_1, all M3 tasks |

## Risks

- **Structured API model is a significant design decision** - kolaente may have a different preference than what we design. Consider posting the spike_1_2 design on the PR for early feedback before implementing.
- **Migration consolidation** - if we merge the two repeat migrations, existing users who ran the first migration separately could have issues. Need to check if this is pre-release only.
