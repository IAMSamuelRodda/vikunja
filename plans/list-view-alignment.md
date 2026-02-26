# List View Task Alignment Feature

## Problem Statement

In Vikunja's list view, when task titles wrap to multiple lines:
1. The checkbox is vertically centered with the entire content block
2. Metadata elements (project name, priority, labels) are displayed inline with the title, causing unpredictable wrapping
3. The layout becomes messy when titles are long

## Design Reference: Todoist

Based on Todoist's task list design, the ideal layout is:

```
┌─────────────────────────────────────────────────────────────────┐
│ ○  Task title that can wrap to multiple lines naturally         │
│    and the checkbox stays aligned with the first line           │
│    ─────────────────────────────────────────────────────────    │
│    📅 16 Dec 2025 ↻                           List of Wisdoms # │
└─────────────────────────────────────────────────────────────────┘
```

**Key characteristics:**
1. **Row 1 (Main)**: Checkbox + Priority indicator + Title (title wraps naturally)
2. **Row 2 (Metadata)**: Due date & icons on left, Project name on right
3. Checkbox aligned to TOP of first line
4. Clean separation between title and metadata
5. No color bubbles inline with title (hide or move to metadata row)

## Current Vikunja Structure (Problem)

```html
.task (display: flex, flex-wrap: wrap, align-items: center)
├── FancyCheckbox
├── ColorBubble (project color) ← inline, causes layout issues
├── .tasktext (flex: 1 0 50%)
│   ├── span.is-inline-flex
│   │   ├── RouterLink (project name) ← BEFORE title
│   │   ├── ColorBubble ← BEFORE title
│   │   ├── PriorityLabel ← BEFORE title
│   │   └── TaskGlanceTooltip > RouterLink (actual title)
│   ├── Labels ← inline
│   ├── AssigneeList ← inline
│   ├── Popup (due date) ← inline
│   ├── span (icons) ← inline
│   └── ChecklistSummary ← inline
├── ProgressBar
├── ColorBubble (conditional)
├── RouterLink (project name conditional)
└── BaseButton.favorite
```

**Problems:**
- `flex-wrap: wrap` + many inline elements = unpredictable layout
- Project name, color, priority all appear BEFORE the title
- `align-items: center` centers checkbox with entire content block
- Changing to `flex-start` breaks the layout because elements wrap unexpectedly

## Proposed Solution: Two-Row Layout

### New Structure

```html
.task (display: flex, flex-direction: column)
├── .task-main-row (display: flex, align-items: flex-start)
│   ├── FancyCheckbox
│   ├── PriorityLabel (small indicator only)
│   └── .task-title-wrapper
│       └── RouterLink (task title - can wrap freely)
├── .task-meta-row (display: flex, justify-content: space-between)
│   ├── .task-meta-left
│   │   ├── Labels
│   │   ├── DueDate
│   │   └── Icons (attachments, description, repeat, comments)
│   └── .task-meta-right
│       ├── AssigneeList
│       └── ProjectName (with color indicator)
└── BaseButton.favorite (positioned absolute or in main row)
```

### CSS Changes

```scss
.task {
  display: flex;
  flex-direction: column;
  padding: .4rem;
  cursor: pointer;
  // Remove flex-wrap, align-items: center
}

.task-main-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.task-title-wrapper {
  flex: 1;
  // Allow natural text wrapping
}

.task-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
  margin-left: calc(18px + 0.5rem); // Align with title (checkbox width + gap)
  font-size: 0.85rem;
  color: var(--grey-500);
}
```

## Implementation Plan

### Phase 1: Restructure Template
1. Create `.task-main-row` wrapper for checkbox + priority + title
2. Create `.task-meta-row` wrapper for all metadata
3. Move elements to appropriate rows
4. Remove inline project name/color from before title

### Phase 2: Update Styles
1. Change `.task` to column flex layout
2. Add styles for new row wrappers
3. Adjust spacing and alignment
4. Ensure responsive behavior

### Phase 3: Test & Refine
1. Test with various task configurations
2. Verify hover/focus states
3. Check mobile layout
4. Fine-tune spacing

## Files to Modify

1. `frontend/src/components/tasks/partials/SingleTaskInProject.vue`
   - Template restructure
   - CSS updates

## Testing Checklist

- [ ] Single-line task titles display correctly
- [ ] Multi-line task titles have checkbox aligned to first line
- [ ] Metadata row displays below title consistently
- [ ] Due dates display on left of metadata row
- [ ] Project name displays on right of metadata row
- [ ] Labels display correctly
- [ ] Priority indicator visible next to checkbox
- [ ] Icons (attachment, description, repeat) display correctly
- [ ] Assignees display correctly
- [ ] Hover states work properly
- [ ] Focus states work properly
- [ ] Subtasks (nested) display correctly
- [ ] Mobile/responsive layout works

## References

- Todoist web app: https://app.todoist.com
- Vikunja instance: https://tasks.rodda.xyz
