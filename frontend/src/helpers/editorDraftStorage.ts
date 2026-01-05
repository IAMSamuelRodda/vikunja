import {isEditorContentEmpty} from '@/helpers/editorContentEmpty'
import {getUserScopedKey, migrateToUserScoped} from '@/helpers/userScopedStorage'

const BASE_KEY = 'editorDraft'

/**
 * Get the full storage key for an editor draft
 */
function getDraftKey(storageKey: string): string {
	// First add the storage key suffix, then scope by user
	const baseWithSuffix = `${BASE_KEY}-${storageKey}`
	return getUserScopedKey(baseWithSuffix)
}

/**
 * Save editor content to local storage
 */
export function saveEditorDraft(storageKey: string, content: string) {
	if (!storageKey) {
		return
	}

	const key = getDraftKey(storageKey)

	try {
		if (!content || isEditorContentEmpty(content)) {
			// Remove empty drafts
			localStorage.removeItem(key)
			return
		}

		localStorage.setItem(key, content)
	} catch (error) {
		console.warn('Failed to save editor draft:', error)
	}
}

/**
 * Load editor content from local storage
 */
export function loadEditorDraft(storageKey: string): string | null {
	if (!storageKey) {
		return null
	}

	const key = getDraftKey(storageKey)

	try {
		return localStorage.getItem(key)
	} catch (error) {
		console.warn('Failed to load editor draft:', error)
		return null
	}
}

/**
 * Clear editor content from local storage
 */
export function clearEditorDraft(storageKey: string) {
	if (!storageKey) {
		return
	}

	const key = getDraftKey(storageKey)

	try {
		localStorage.removeItem(key)
	} catch (error) {
		console.warn('Failed to clear editor draft:', error)
	}
}

/**
 * Migrate editor drafts from unscoped to user-scoped storage.
 * Note: This only migrates drafts with known storage keys.
 * Old drafts with dynamic keys may remain orphaned.
 */
export function migrateEditorDrafts(knownStorageKeys: string[]) {
	for (const storageKey of knownStorageKeys) {
		migrateToUserScoped(`${BASE_KEY}-${storageKey}`)
	}
}
