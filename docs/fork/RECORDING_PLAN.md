# Fork Demo Recording Plan

> Step-by-step guide for creating demo videos and screenshots for FORK.md

## Overview

| Demo | Type | Priority | Duration | Status |
|------|------|----------|----------|--------|
| RRULE CalDAV Sync | Video | High | 30-45s | ⬜ Not started |
| RRULE Before/After | Screenshots | High | - | ⬜ Not started |
| Compact Sidebar | Video | Medium | 15-20s | ⬜ Not started |
| Filter Favorite Fix | Video | Low | 10-15s | ⬜ Not started |

---

## Pre-Recording Setup

### 1. Environment Preparation

```bash
# Ensure fork is running locally with all features
cd ~/repos/2-areas/vikunja

# Build and run (or use Docker)
docker pull ghcr.io/iamsamuelrodda/vikunja:unstable-fork
docker run -p 3456:3456 ghcr.io/iamsamuelrodda/vikunja:unstable-fork
```

### 2. Test Data Setup

**Option A: Use Demo Creator (Recommended)**

Use the [Demo Creator](https://iamsamuelrodda.github.io/vikunja/fork/demo-creator.html) to automatically create:
- Demo account with random credentials
- Sample labels (High Priority, In Progress, Review, Done, Bug)
- "My Tasks" project with 8 sample tasks
- Recurring task example for RRULE demo

**Option B: Manual Setup**

Create clean, presentable test data:
- [ ] Project: "Work Tasks" with 5-6 sample tasks
- [ ] Project: "Personal" with 3-4 tasks
- [ ] One recurring task for RRULE demo: "Weekly Team Meeting" (every Monday)
- [ ] One saved filter marked as favorite

### 3. Recording Tool Setup

```bash
# Install peek
sudo apt install peek

# Configure peek:
# - Output format: MP4 (better for GitHub)
# - Framerate: 30fps
# - Resolution: Match your window size
```

### 4. Browser/Window Setup

- [ ] Use Firefox or Chrome (clean profile, no extensions visible)
- [ ] Window size: 1280x800 (good balance of detail and file size)
- [ ] Hide bookmarks bar
- [ ] Dark mode OFF (better contrast for demos)
- [ ] Zoom: 100%

---

## Demo 1: RRULE CalDAV Sync (HIGH PRIORITY)

**Purpose**: Show that recurring tasks sync properly with CalDAV clients

### Pre-requisites
- [ ] Vikunja running with CalDAV enabled
- [ ] iOS device with Reminders app connected to Vikunja CalDAV, OR
- [ ] Thunderbird with CalDAV calendar configured, OR
- [ ] Any CalDAV client (Evolution, GNOME Calendar, etc.)

### Screenshots Needed

#### Screenshot 1A: "Before" - Legacy Recurrence (Optional)
*If you have access to old Vikunja version*
- Show task edit modal with old `repeat_after` dropdown
- Filename: `rrule-before-legacy.png`

#### Screenshot 1B: "After" - RRULE Format
- Show task edit modal with new RRULE field
- Highlight the RFC 5545 format
- Filename: `rrule-after-new.png`

### Video Recording: RRULE Sync Demo

**Duration**: 30-45 seconds
**Filename**: `rrule-sync-demo.mp4`

#### Script/Flow:

```
[0:00-0:05] Show Vikunja task list with existing recurring task
            - Task visible: "Weekly Team Meeting"
            - Shows recurrence indicator

[0:05-0:15] Click to edit the task
            - Show the RRULE field populated
            - Hover/highlight to show "FREQ=WEEKLY;BYDAY=MO"

[0:15-0:20] Create NEW recurring task
            - Click "New Task"
            - Title: "Daily Standup"
            - Set recurrence: Daily

[0:20-0:30] Switch to CalDAV client (split screen or cut)
            - Show iOS Reminders / Thunderbird / etc.
            - Refresh/sync
            - Show the task appearing with correct recurrence

[0:30-0:40] (Optional) Edit in CalDAV client
            - Change recurrence to "Every 2 days"
            - Sync back to Vikunja
            - Show updated RRULE in Vikunja

[0:40-0:45] End on Vikunja showing synced state
```

#### Recording Checklist:
- [ ] Clean task list visible
- [ ] Recurring task already exists
- [ ] CalDAV client connected and ready
- [ ] Smooth, deliberate mouse movements
- [ ] No personal data visible

---

## Demo 2: Compact Sidebar (MEDIUM PRIORITY)

**Purpose**: Show the improved sidebar navigation UX

### Pre-requisites
- [ ] Switch to `feat/compact-sidebar` branch (or have it merged to main)
- [ ] Multiple projects with tasks for visual demo

### Screenshots Needed

#### Screenshot 2A: Sidebar Expanded
- Full sidebar with all projects visible
- Filename: `sidebar-expanded.png`

#### Screenshot 2B: Sidebar Collapsed
- Compact view with collapsed project groups
- Filename: `sidebar-collapsed.png`

### Video Recording: Compact Sidebar Demo

**Duration**: 15-20 seconds
**Filename**: `sidebar-compact-demo.mp4`

#### Script/Flow:

```
[0:00-0:05] Show sidebar in default/expanded state
            - Multiple projects visible
            - Task counts shown

[0:05-0:10] Click to collapse a project group
            - Smooth animation
            - Group collapses with indicator

[0:10-0:15] Collapse another group
            - Show multiple collapsed
            - More vertical space available

[0:15-0:20] Expand one group back
            - Click to expand
            - Show it remembers state
```

#### Recording Checklist:
- [ ] At least 3-4 projects visible
- [ ] Some projects with task counts
- [ ] Smooth animations captured
- [ ] Clear visual feedback on collapse/expand

---

## Demo 3: Filter Favorite Fix (LOW PRIORITY)

**Purpose**: Show the bug fix for saved filter favorites

### Pre-requisites
- [ ] At least one saved filter created
- [ ] Bug reproduction scenario ready

### Video Recording: Filter Favorite Fix

**Duration**: 10-15 seconds
**Filename**: `filter-favorite-fix.mp4`

#### Script/Flow:

```
[0:00-0:03] Show saved filter in sidebar
            - Filter visible, not favorited

[0:03-0:07] Click star/favorite icon
            - Filter becomes favorited
            - Visual indicator shows

[0:07-0:10] Refresh the page (F5 or click refresh)
            - Page reloads

[0:10-0:15] Show filter still favorited
            - Star icon still active
            - Fix confirmed working
```

#### Recording Checklist:
- [ ] Clear view of favorite indicator
- [ ] Visible page refresh
- [ ] State persists after refresh

---

## Post-Recording Workflow

### 1. Review Recordings
- [ ] Watch each recording for quality
- [ ] Check for personal data leaks
- [ ] Verify smooth playback

### 2. Upload to GitHub

For each video:
```
1. Go to: https://github.com/iamsamuelrodda/vikunja/issues
2. Click "New issue" (don't actually create it)
3. Drag MP4 file into the comment box
4. Wait for upload to complete
5. Copy the generated URL: https://github.com/user-attachments/assets/...
6. Cancel the issue (don't submit)
```

### 3. Update FORK.md

Replace placeholder comments with actual embeds:

```markdown
<!-- Before -->
<!-- TODO: Add demo video -->
<!-- ![RRULE Sync Demo](docs/fork/rrule-sync-demo.mp4) -->

<!-- After -->
https://github.com/user-attachments/assets/abc123-your-video-id

![RRULE Sync Demo](https://github.com/user-attachments/assets/abc123...)
```

### 4. Screenshot Organization

Save screenshots to `docs/fork/`:
```
docs/fork/
├── RECORDING_PLAN.md
├── rrule-before-legacy.png
├── rrule-after-new.png
├── sidebar-expanded.png
├── sidebar-collapsed.png
└── README.md
```

---

## Quality Checklist

Before publishing, verify:

- [ ] **No personal data**: Email, real names, sensitive tasks hidden
- [ ] **Professional appearance**: Clean UI, no debug panels
- [ ] **Readable text**: Font size large enough, good contrast
- [ ] **Smooth motion**: No lag, stuttering, or rushed movements
- [ ] **Correct duration**: Not too long, not too short
- [ ] **Clear purpose**: Each demo shows exactly one feature

---

## Recording Priority Order

1. **RRULE Screenshots** (can do immediately)
   - Before/after comparison tells the story even without video

2. **RRULE Video** (requires CalDAV setup)
   - Most impressive demo, shows real-world value

3. **Sidebar Video** (if feature is ready)
   - Quick win, visually appealing

4. **Filter Fix Video** (optional)
   - Minor fix, screenshot might suffice

---

## Notes

- Keep recordings SHORT - attention spans are limited
- GitHub video player auto-loops, so ending smoothly matters
- For PRs, the maintainer appreciates visual proof > long explanations
- Screenshots in PR descriptions are almost mandatory for UI changes
