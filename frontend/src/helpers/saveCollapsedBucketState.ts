import type {IBucket} from '@/modelTypes/IBucket'
import type {IProject} from '@/modelTypes/IProject'
import {getUserScopedKey, migrateToUserScoped} from '@/helpers/userScopedStorage'

const BASE_KEY = 'collapsedBuckets'

export type CollapsedBuckets = {[id: IBucket['id']]: boolean}

function getAllState() {
	const key = getUserScopedKey(BASE_KEY)
	const saved = localStorage.getItem(key)
	return saved === null
		? {}
		: JSON.parse(saved)
}

export const saveCollapsedBucketState = (
	projectId: IProject['id'],
	collapsedBuckets: CollapsedBuckets,
) => {
	const key = getUserScopedKey(BASE_KEY)
	const state = getAllState()
	state[projectId] = collapsedBuckets
	for (const bucketId in state[projectId]) {
		if (!state[projectId][bucketId]) {
			delete state[projectId][bucketId]
		}
	}
	localStorage.setItem(key, JSON.stringify(state))
}

export function getCollapsedBucketState(projectId : IProject['id']) {
	const state = getAllState()
	return typeof state[projectId] !== 'undefined'
		? state[projectId]
		: {}
}

/**
 * Migrate collapsed bucket state from unscoped to user-scoped storage.
 * Call this after user authentication to preserve existing settings.
 */
export function migrateCollapsedBucketState() {
	migrateToUserScoped(BASE_KEY)
}
