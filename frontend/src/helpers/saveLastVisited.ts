import {getUserScopedKey, migrateToUserScoped} from '@/helpers/userScopedStorage'

const BASE_KEY = 'lastVisited'

export const saveLastVisited = (name: string | undefined, params: object, query: object) => {
	if (typeof name === 'undefined') {
		return
	}

	const key = getUserScopedKey(BASE_KEY)
	localStorage.setItem(key, JSON.stringify({name, params, query}))
}

export const getLastVisited = () => {
	const key = getUserScopedKey(BASE_KEY)
	const lastVisited = localStorage.getItem(key)
	if (lastVisited === null) {
		return null
	}

	return JSON.parse(lastVisited)
}

export const clearLastVisited = () => {
	const key = getUserScopedKey(BASE_KEY)
	return localStorage.removeItem(key)
}

/**
 * Migrate last visited route from unscoped to user-scoped storage.
 * Call this after user authentication to preserve existing data.
 */
export function migrateLastVisited() {
	migrateToUserScoped(BASE_KEY)
}
