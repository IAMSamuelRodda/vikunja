# Outstanding Issues

## ✅ Resolved: User-Scoped Storage

**Status**: Deployed to fork (commit `19dc05bd8`)

Permission errors from cached project IDs when different users login on the same browser have been fixed with user-scoped localStorage keys.

**Solution**: Pattern `baseKey-user-{userId}` with automatic migration on login.

**Files**: `frontend/src/helpers/userScopedStorage.ts` and related storage helpers.

---

## Tech Debt: Demo Instance Auto-Redirect

**Status**: Deferred (recording complete)

**Issue**: Users visiting `try.vikunja.arcforge.au` directly hit the main app instead of being redirected to `/demo-account-create`. This can cause stale session/localStorage issues.

**Desired behavior**: Demo instance should auto-redirect unauthenticated users to `/demo-account-create`.

**Options** (not implemented):
1. Router guard redirect when `demoModeEnabled` 
2. Nginx/Caddy redirect at infrastructure level
3. Make `/demo-account-create` the homepage in demo mode

**Priority**: Low - demo recording complete, not blocking.
