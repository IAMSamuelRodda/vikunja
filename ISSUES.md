# Outstanding Issues - User-Scoped Storage

## Status: Ready for Upstream PR, Not Yet Deployed to Fork

### Issue: Permission Errors from Cached Project IDs

**Symptom**: Users see "You don't have the permission to see this" errors when:
- Different users login on the same browser
- Demo accounts are created (even with quick fix deployed)
- Sessions persist across user changes

**Root Cause**: localStorage keys like `projectHistory`, `lastVisited`, `projectViewSettings` store project IDs without user scoping. When a different user logs in, they inherit cached project IDs from the previous user.

**Proper Fix**: This branch (`fix/user-scoped-localstorage`) implements user-scoped localStorage keys:
- Pattern: `baseKey-user-{userId}` (e.g., `projectHistory-user-123`)
- Automatic migration of existing data on login
- Prevents cross-user data leakage

### Deployment Status

| Target | Status | Notes |
|--------|--------|-------|
| Upstream PR | Ready | Branch pushed, PR #2032 references this work |
| Fork (demo) | NOT DEPLOYED | Quick fix only - still seeing errors |
| Fork (prod) | NOT DEPLOYED | Same as above |

### To Deploy to Fork

Merge this branch into fork's main:

```bash
cd /home/samuelrodda/repos/2-areas/vikunja
git merge --no-ff fix/user-scoped-localstorage -m "feat(frontend): merge user-scoped localStorage fix"
git push origin main
# Then trigger Quick Deploy
```

### Files Changed

- `frontend/src/helpers/userScopedStorage.ts` (NEW)
- `frontend/src/modules/projectHistory.ts`
- `frontend/src/helpers/projectView.ts`
- `frontend/src/helpers/saveLastVisited.ts`
- `frontend/src/helpers/saveCollapsedBucketState.ts`
- `frontend/src/helpers/editorDraftStorage.ts`
- `frontend/src/stores/auth.ts`

### Related

- Original quick fix: `2f4af6e86` (clearUserSpecificCache in DemoAccountCreate.vue)
- Upstream issue: Vikunja doesn't scope localStorage by user
