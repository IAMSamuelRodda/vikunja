import type {IProject} from '@/modelTypes/IProject'
import {getUserScopedKey, migrateToUserScoped} from '@/helpers/userScopedStorage'

export type ProjectViewSettings = Record<IProject['id'], number>

const BASE_KEY = 'projectView'

/**
 * Save the current project view to local storage
 */
export function saveProjectView(projectId: IProject['id'], viewId: number) {
	if (!projectId || !viewId) {
		return
	}

	const key = getUserScopedKey(BASE_KEY)

	// We use local storage and not the store here to make it persistent across reloads.
	const savedProjectView = localStorage.getItem(key)
	let savedProjectViewSettings: ProjectViewSettings | false = false
	if (savedProjectView !== null) {
		savedProjectViewSettings = JSON.parse(savedProjectView) as ProjectViewSettings
	}

	let projectViewSettings: ProjectViewSettings = {}
	if (savedProjectViewSettings) {
		projectViewSettings = savedProjectViewSettings
	}

	projectViewSettings[projectId] = viewId
	localStorage.setItem(key, JSON.stringify(projectViewSettings))
}

export function getProjectViewId(projectId: IProject['id']): number {
	const key = getUserScopedKey(BASE_KEY)
	const projectViewSettingsString = localStorage.getItem(key)
	if (!projectViewSettingsString) {
		return 0
	}

	const projectViewSettings = JSON.parse(projectViewSettingsString) as ProjectViewSettings
	if (isNaN(projectViewSettings[projectId])) {
		return 0
	}
	return projectViewSettings[projectId]
}

/**
 * Migrate project view settings from unscoped to user-scoped storage.
 * Call this after user authentication to preserve existing settings.
 */
export function migrateProjectViewSettings() {
	migrateToUserScoped(BASE_KEY)
}
