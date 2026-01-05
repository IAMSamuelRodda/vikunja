import {getUserScopedKey, migrateToUserScoped} from '@/helpers/userScopedStorage'

export interface ProjectHistory {
	id: number;
}

const BASE_KEY = 'projectHistory'

export function getHistory(): ProjectHistory[] {
	const key = getUserScopedKey(BASE_KEY)
	const savedHistory = localStorage.getItem(key)
	if (savedHistory === null) {
		return []
	}

	return JSON.parse(savedHistory)
}

function saveHistory(history: ProjectHistory[]) {
	const key = getUserScopedKey(BASE_KEY)
	if (history.length === 0) {
		localStorage.removeItem(key)
		return
	}

	localStorage.setItem(key, JSON.stringify(history))
}

const MAX_SAVED_PROJECTS = 6

export function saveProjectToHistory(project: ProjectHistory) {
	const history: ProjectHistory[] = getHistory()

	// Remove the element if it already exists in history, preventing duplicates and essentially moving it to the beginning
	history.forEach((l, i) => {
		if (l.id === project.id) {
			history.splice(i, 1)
		}
	})

	// Add the new project to the beginning of the project
	history.unshift(project)

	if (history.length > MAX_SAVED_PROJECTS) {
		history.pop()
	}
	saveHistory(history)
}

export function removeProjectFromHistory(project: ProjectHistory) {
	const history: ProjectHistory[] = getHistory()

	history.forEach((l, i) => {
		if (l.id === project.id) {
			history.splice(i, 1)
		}
	})
	saveHistory(history)
}

/**
 * Migrate project history from unscoped to user-scoped storage.
 * Call this after user authentication to preserve existing history.
 */
export function migrateProjectHistory() {
	migrateToUserScoped(BASE_KEY)
}
