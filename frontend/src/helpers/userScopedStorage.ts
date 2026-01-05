/**
 * User-scoped localStorage helper.
 *
 * Provides functions to scope localStorage keys by user ID, preventing data leakage
 * when different users log in on the same browser without clearing localStorage.
 *
 * Usage:
 * 1. Call setCurrentUserId() when user authenticates
 * 2. Call clearCurrentUserId() when user logs out
 * 3. Use getUserScopedKey() to get a user-scoped key for localStorage operations
 */

const CURRENT_USER_ID_KEY = '_currentUserId'

/**
 * Set the current user ID. Call this after successful authentication.
 */
export function setCurrentUserId(userId: number | null): void {
	if (userId === null) {
		localStorage.removeItem(CURRENT_USER_ID_KEY)
	} else {
		localStorage.setItem(CURRENT_USER_ID_KEY, String(userId))
	}
}

/**
 * Get the current user ID from localStorage.
 */
export function getCurrentUserId(): number | null {
	const userId = localStorage.getItem(CURRENT_USER_ID_KEY)
	if (userId === null) {
		return null
	}
	const parsed = parseInt(userId, 10)
	return isNaN(parsed) ? null : parsed
}

/**
 * Clear the current user ID. Call this on logout.
 */
export function clearCurrentUserId(): void {
	localStorage.removeItem(CURRENT_USER_ID_KEY)
}

/**
 * Get a user-scoped localStorage key.
 * Returns the base key with user ID suffix if a user is logged in,
 * otherwise returns the base key unchanged (for backwards compatibility).
 */
export function getUserScopedKey(baseKey: string): string {
	const userId = getCurrentUserId()
	if (userId !== null) {
		return `${baseKey}-user-${userId}`
	}
	return baseKey
}

/**
 * Migrate data from an unscoped key to a user-scoped key.
 * This preserves existing user data after the upgrade.
 * Only migrates if:
 * - Old (unscoped) key exists
 * - New (user-scoped) key doesn't exist
 * - User is logged in
 */
export function migrateToUserScoped(baseKey: string): void {
	const userId = getCurrentUserId()
	if (userId === null) {
		return
	}

	const oldKey = baseKey
	const newKey = `${baseKey}-user-${userId}`

	const oldData = localStorage.getItem(oldKey)
	if (oldData !== null && localStorage.getItem(newKey) === null) {
		localStorage.setItem(newKey, oldData)
		localStorage.removeItem(oldKey)
	}
}

/**
 * Clear all user-scoped data for the current user.
 * Useful for targeted cleanup without clearing all localStorage.
 */
export function clearUserScopedData(baseKeys: string[]): void {
	const userId = getCurrentUserId()
	if (userId === null) {
		return
	}

	for (const baseKey of baseKeys) {
		const userKey = `${baseKey}-user-${userId}`
		localStorage.removeItem(userKey)
	}
}
