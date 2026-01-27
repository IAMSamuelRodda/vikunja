<template>
	<div
		:data-task-id="task.id"
		:data-project-id="task.projectId"
	>
		<div
			ref="taskRoot"
			:class="{'is-loading': taskService.loading}"
			class="task loader-container single-task"
			tabindex="-1"
			@click="openTaskDetail"
			@keyup.enter="openTaskDetail"
		>
			<!-- Main row: checkbox + title -->
			<div class="task-main-row">
				<FancyCheckbox
					v-model="task.done"
					:disabled="(isArchived || disabled) && !canMarkAsDone"
					@update:modelValue="markAsDone"
					@click.stop
				/>

				<div
					:class="{ 'done': task.done }"
					class="task-title"
				>
					<TaskGlanceTooltip :task="task">
						<RouterLink
							ref="taskLinkRef"
							:to="taskDetailRoute"
							class="task-link"
							tabindex="-1"
						>
							{{ task.title }}
						</RouterLink>
					</TaskGlanceTooltip>
				</div>

				<BaseButton
					:class="{'is-favorite': task.isFavorite}"
					class="favorite"
					@click.stop="toggleFavorite"
				>
					<span class="is-sr-only">{{ task.isFavorite ? $t('task.detail.actions.unfavorite') : $t('task.detail.actions.favorite') }}</span>
					<Icon
						v-if="task.isFavorite"
						icon="star"
					/>
					<Icon
						v-else
						:icon="['far', 'star']"
					/>
				</BaseButton>
			</div>

			<!-- Description preview row -->
			<div
				v-if="descriptionPreview"
				class="task-description-row"
			>
				{{ descriptionPreview }}
			</div>

			<!-- Meta row: priority, due date, labels, icons on left; project name on right -->
			<div
				v-if="hasMetadata"
				class="task-meta-row"
			>
				<div class="task-meta-left">
					<PriorityLabel
						v-if="task.priority !== 0"
						:priority="task.priority"
						:done="task.done"
						class="task-priority"
					/>

					<Popup
						v-if="+new Date(task.dueDate) > 0"
					>
						<template #trigger="{toggle, isOpen}">
							<BaseButton
								v-tooltip="formatDateLong(task.dueDate)"
								class="dueDate"
								@click.prevent.stop="toggle()"
							>
								<time
									:datetime="formatISO(task.dueDate)"
									:class="{'overdue': task.dueDate <= new Date() && !task.done}"
									:aria-expanded="isOpen ? 'true' : 'false'"
								>
									{{ $t('task.detail.due', {at: dueDateFormatted}) }}
								</time>
							</BaseButton>
						</template>
						<template #content="{isOpen}">
							<DeferTask
								v-if="isOpen"
								v-model="task"
								@update:modelValue="deferTaskUpdate"
							/>
						</template>
					</Popup>

					<Labels
						v-if="task.labels.length > 0"
						class="labels"
						:labels="task.labels"
					/>

					<span class="task-icons">
						<span
							v-if="task.attachments.length > 0"
							class="project-task-icon"
						>
							<Icon icon="paperclip" />
						</span>
						<span
							v-if="taskIsRepeating"
							v-tooltip="repeatTooltip"
							class="project-task-icon"
						>
							<Icon icon="history" />
						</span>
						<CommentCount
							:task="task"
							class="project-task-icon"
						/>
					</span>

					<ChecklistSummary :task="task" />

					<ProgressBar
						v-if="task.percentDone > 0"
						:value="task.percentDone * 100"
						is-small
						class="task-progress"
					/>
				</div>

				<div class="task-meta-right">
					<AssigneeList
						v-if="task.assignees.length > 0"
						:assignees="task.assignees"
						:avatar-size="20"
						:inline="true"
					/>

					<RouterLink
						v-if="showProject && typeof project !== 'undefined'"
						v-tooltip="$t('task.detail.belongsToProject', {project: project.title})"
						:to="{ name: 'project.index', params: { projectId: task.projectId } }"
						class="task-project"
						@click.stop
					>
						<ColorBubble
							v-if="projectColor !== ''"
							:color="projectColor"
							class="mie-1"
						/>
						{{ project.title }}
					</RouterLink>

					<RouterLink
						v-else-if="showProjectSeparately && typeof project !== 'undefined'"
						v-tooltip="$t('task.detail.belongsToProject', {project: project.title})"
						:to="{ name: 'project.index', params: { projectId: task.projectId } }"
						class="task-project"
						@click.stop
					>
						<ColorBubble
							v-if="projectColor !== '' && currentProject?.id !== task.projectId"
							:color="projectColor"
							class="mie-1"
						/>
						{{ project.title }}
					</RouterLink>
				</div>
			</div>
			<slot />
		</div>
		<template v-if="typeof task.relatedTasks?.subtask !== 'undefined'">
			<template v-for="subtask in task.relatedTasks.subtask">
				<template v-if="getTaskById(subtask.id)">
					<single-task-in-project
						:key="subtask.id"
						:the-task="getTaskById(subtask.id)"
						:disabled="disabled"
						:can-mark-as-done="canMarkAsDone"
						:all-tasks="allTasks"
						class="subtask-nested"
					/>
				</template>
			</template>
		</template>
	</div>
</template>

<script setup lang="ts">
import {ref, watch, shallowReactive, onMounted, computed} from 'vue'
import {useI18n} from 'vue-i18n'

import TaskModel from '@/models/task'
import type {ITask} from '@/modelTypes/ITask'

import PriorityLabel from '@/components/tasks/partials/PriorityLabel.vue'
import Labels from '@/components/tasks/partials/Labels.vue'
import TaskGlanceTooltip from '@/components/tasks/partials/TaskGlanceTooltip.vue'
import DeferTask from '@/components/tasks/partials/DeferTask.vue'
import ChecklistSummary from '@/components/tasks/partials/ChecklistSummary.vue'
import CommentCount from '@/components/tasks/partials/CommentCount.vue'

import ProgressBar from '@/components/misc/ProgressBar.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import FancyCheckbox from '@/components/input/FancyCheckbox.vue'
import ColorBubble from '@/components/misc/ColorBubble.vue'
import Popup from '@/components/misc/Popup.vue'

import TaskService from '@/services/task'

import {formatDisplayDate, formatISO, formatDateLong} from '@/helpers/time/formatDate'
import {success} from '@/message'

import {useProjectStore} from '@/stores/projects'
import {useBaseStore} from '@/stores/base'
import {useTaskStore} from '@/stores/tasks'
import AssigneeList from '@/components/tasks/partials/AssigneeList.vue'
import {useIntervalFn} from '@vueuse/core'
import {playPopSound} from '@/helpers/playPop'
import {isEditorContentEmpty} from '@/helpers/editorContentEmpty'
import {isRepeating, describeRepeat} from '@/helpers/rrule'

const props = withDefaults(defineProps<{
	theTask: ITask,
	isArchived?: boolean,
	showProject?: boolean,
	disabled?: boolean,
	canMarkAsDone?: boolean,
	allTasks?: ITask[],
}>(), {
	isArchived: false,
	showProject: false,
	disabled: false,
	canMarkAsDone: true,
	allTasks: () => [],
})

const emit = defineEmits<{
	'taskUpdated': [task: ITask],
}>()

function getTaskById(taskId: number): ITask | undefined {
	if (typeof props.allTasks === 'undefined' || props.allTasks.length === 0) {
		return null
	}

	return props.allTasks.find(t => t.id === taskId)
}

const {t} = useI18n({useScope: 'global'})

const taskService = shallowReactive(new TaskService())
const task = ref<ITask>(new TaskModel())

const taskIsRepeating = computed(() => isRepeating(task.value.repeat))

const repeatTooltip = computed(() => {
	if (!task.value.repeat) {
		return ''
	}
	return describeRepeat(task.value.repeat, t)
})

const descriptionPreview = computed(() => {
	if (isEditorContentEmpty(task.value.description)) {
		return ''
	}
	// Strip HTML tags and get plain text preview
	const plainText = task.value.description
		.replace(/<[^>]*>/g, ' ') // Remove HTML tags
		.replace(/&nbsp;/g, ' ') // Replace &nbsp;
		.replace(/\s+/g, ' ') // Collapse whitespace
		.trim()

	if (!plainText) {
		return ''
	}

	// Truncate to ~150 characters
	const maxLength = 150
	if (plainText.length <= maxLength) {
		return plainText
	}
	return plainText.substring(0, maxLength).trim() + '...'
})

const hasMetadata = computed(() => {
	return task.value.priority !== 0 ||
		task.value.labels.length > 0 ||
		+new Date(task.value.dueDate) > 0 ||
		task.value.attachments.length > 0 ||
		!isEditorContentEmpty(task.value.description) ||
		taskIsRepeating.value ||
		task.value.percentDone > 0 ||
		task.value.assignees.length > 0 ||
		(props.showProject && project.value) ||
		showProjectSeparately.value
})

watch(
	() => props.theTask,
	newVal => {
		task.value = newVal
	},
	{
		immediate: true,
		deep: true,
	},
)

const baseStore = useBaseStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const project = computed(() => projectStore.projects[task.value.projectId])
const projectColor = computed(() => project.value ? project.value?.hexColor : '')

const showProjectSeparately = computed(() => !props.showProject && currentProject.value?.id !== task.value.projectId && project.value)

const currentProject = computed(() => {
	return typeof baseStore.currentProject === 'undefined' ? {
		id: 0,
		title: '',
	} : baseStore.currentProject
})

const taskDetailRoute = computed(() => ({
	name: 'task.detail',
	params: {id: task.value.id},
	// TODO: re-enable opening task detail in modal
	// state: { backdropView: router.currentRoute.value.fullPath },
}))

function updateDueDate() {
	if (!task.value.dueDate) {
		return
	}

	dueDateFormatted.value = formatDisplayDate(task.value.dueDate)
}

const dueDateFormatted = ref('')
useIntervalFn(updateDueDate, 60_000, {
	immediateCallback: true,
})
onMounted(updateDueDate)

watch(() => task.value.dueDate, updateDueDate)

let oldTask

async function markAsDone(checked: boolean, wasReverted: boolean = false) {
	const updateFunc = async () => {
		oldTask = {...task.value}
		const newTask = await taskStore.update(task.value)
		task.value = newTask

		updateDueDate()

		if (wasReverted) {
			return
		}

		if (checked) {
			playPopSound()
		}
		emit('taskUpdated', newTask)

		let message = t('task.doneSuccess')
		if (!task.value.done && !taskIsRepeating.value) {
			message = t('task.undoneSuccess')
		}

		success({message}, [{
			title: t('task.undo'),
			callback: () => undoDone(checked),
		}])
	}

	if (checked) {
		setTimeout(updateFunc, 300) // Delay it to show the animation when marking a task as done
	} else {
		await updateFunc() // Don't delay it when un-marking it as it doesn't have an animation the other way around
	}
}

function undoDone(checked: boolean) {
	if (taskIsRepeating.value) {
		task.value = {...oldTask}
	}
	task.value.done = !task.value.done
	markAsDone(!checked, true)
}

async function toggleFavorite() {
	task.value = await taskStore.toggleFavorite(task.value)
	emit('taskUpdated', task.value)
}

function deferTaskUpdate(updatedTask: ITask) {
	task.value = updatedTask
	updateDueDate()
	emit('taskUpdated', updatedTask)
}

const taskRoot = ref<HTMLElement | null>(null)
const taskLinkRef = ref<HTMLElement | null>(null)

function hasTextSelected() {
	const isTextSelected = window.getSelection().toString()
	return !(typeof isTextSelected === 'undefined' || isTextSelected === '' || isTextSelected === '\n')
}

function openTaskDetail(event: MouseEvent | KeyboardEvent) {
	if (event.target instanceof HTMLElement) {
		const isInteractiveElement = event.target.closest('a, button, .favorite, [role="button"]')
		if (isInteractiveElement || hasTextSelected()) {
			return
		}
	}

	taskLinkRef.value?.$el.click()
}

defineExpose({
	focus: () => taskRoot.value?.focus(),
	click: (e: MouseEvent | KeyboardEvent) => openTaskDetail(e),
})
</script>

<style lang="scss" scoped>
.task {
	display: flex;
	flex-direction: column;
	padding: .4rem;
	transition: background-color $transition;
	cursor: pointer;
	border-radius: $radius;
	border: 2px solid transparent;

	&:hover {
		background-color: var(--grey-100);
	}

	&:has(*:focus-visible), &:focus {
		box-shadow: 0 0 0 2px hsla(var(--primary-hsl), 0.5);

		a.task-link {
			box-shadow: none;
		}
	}

	@supports not selector(:focus-within) {
		:focus {
			box-shadow: 0 0 0 2px hsla(var(--primary-hsl), 0.5);

			a.task-link {
				box-shadow: none;
			}
		}
	}

	a {
		color: var(--text);
		transition: color ease $transition-duration;

		&:hover {
			color: var(--grey-900);
		}
	}

	&.loader-container.is-loading:after {
		inset-block-start: calc(50% - 1rem);
		inset-inline-start: calc(50% - 1rem);
		inline-size: 2rem;
		block-size: 2rem;
		border-inline-start-color: var(--grey-300);
		border-block-end-color: var(--grey-300);
	}
}

// Main row: checkbox + title + favorite
.task-main-row {
	display: flex;
	align-items: flex-start;
	gap: 0.25rem;
	inline-size: 100%;

	:deep(.fancy-checkbox) {
		flex-shrink: 0;
		block-size: 18px;
		padding-block-start: 2px; // Align with first line of text
		padding-inline-end: .25rem;

		span {
			display: none;
		}
	}

	.task-title {
		flex: 1;
		min-inline-size: 0; // Allow text to shrink and wrap
		word-wrap: break-word;
		word-break: break-word;
		hyphens: auto;

		&.done {
			text-decoration: line-through;
			color: var(--grey-500);
		}
	}

	.favorite {
		flex-shrink: 0;
		opacity: 1;
		text-align: center;
		inline-size: 27px;
		transition: opacity $transition, color $transition;
		border-radius: $radius;
		margin-inline-start: auto;

		&:hover {
			color: var(--warning);
		}

		&.is-favorite {
			opacity: 1;
			color: var(--warning);
		}

		&:focus {
			opacity: 1;
		}
	}

	@media(hover: hover) and (pointer: fine) {
		.favorite {
			opacity: 0;
		}
	}
}

.task:hover .task-main-row .favorite,
.task:focus-within .task-main-row .favorite {
	opacity: 1;
}

// Description preview row
.task-description-row {
	margin-block-start: 0.125rem;
	margin-inline-start: calc(18px + 0.5rem); // Align with title
	font-size: 0.85rem;
	color: var(--grey-400);
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
}

// Meta row: priority, due date, labels, icons on left; project name on right
.task-meta-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-block-start: 0.25rem;
	margin-inline-start: calc(18px + 0.5rem); // Align with title (checkbox width + gap)
	font-size: 0.85rem;
	color: var(--grey-500);

	.task-meta-left {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;

		.task-priority {
			flex-shrink: 0;
		}

		.labels {
			display: flex;
			flex-wrap: wrap;
			gap: 0.25rem;
		}

		.dueDate {
			display: inline-flex;
			align-items: center;

			&:focus-visible {
				box-shadow: none;

				time {
					box-shadow: 0 0 0 1px hsla(var(--primary-hsl), 0.5);
					border-radius: 3px;
				}
			}

			time {
				font-size: 0.85rem;
			}

			.overdue {
				color: var(--danger);
			}
		}

		.task-icons {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
		}

		.project-task-icon {
			display: inline-flex;
			align-items: center;
		}

		.task-progress {
			inline-size: 50px;
		}
	}

	.task-meta-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-inline-start: auto;

		.task-project {
			display: inline-flex;
			align-items: center;
			color: var(--grey-400);
			font-size: 0.85rem;
			white-space: nowrap;
		}
	}
}

.subtask-nested {
	margin-inline-start: 1.75rem;
}

:deep(.popup) {
	border-radius: $radius;
	background-color: var(--white);
	box-shadow: var(--shadow-lg);
	color: var(--text);
	inset-block-start: unset;

	&.is-open {
		padding: 1rem;
		border: 1px solid var(--grey-200);
	}
}
</style>
