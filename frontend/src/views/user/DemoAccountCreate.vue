<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'

import {HTTPFactory} from '@/helpers/fetcher'
import {saveToken} from '@/helpers/auth'
import {useAuthStore} from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const status = ref('Creating demo account...')
const error = ref('')

// Demo data
const DEMO_LABELS = [
	{title: 'Personal', hex_color: '3b82f6'},
	{title: 'Work', hex_color: 'f59e0b'},
	{title: 'Health', hex_color: '10b981'},
]

const DEMO_PROJECTS = [
	{title: 'Inbox', description: 'Default inbox for quick captures'},
	{title: 'Trip to Mars', description: 'Planning the ultimate vacation'},
]

const DEMO_TASKS = [
	// Inbox tasks
	{project: 0, title: 'Call mom', labels: ['Personal'], due_date: 3},
	{project: 0, title: 'Start a new book', labels: ['Work'], due_date: 7},
	{project: 0, title: 'Plan weekend hike', labels: [], due_date: 8},
	{project: 0, title: 'Update resume', labels: ['Health'], due_date: 9},
	// Trip to Mars tasks
	{project: 1, title: 'Learn Martian language', labels: [], due_date: 7},
	{project: 1, title: 'Prepare for low gravity', labels: [], due_date: 90},
	{project: 1, title: 'Research Martian weather', labels: [], due_date: 120},
	{project: 1, title: 'Book rocket to Mars', labels: [], due_date: 120},
	{project: 1, title: 'Pack space snacks', labels: [], due_date: 365},
]

function generateUsername(): string {
	const adjectives = ['happy', 'clever', 'swift', 'bright', 'dusty', 'sunny', 'misty', 'bold']
	const nouns = ['panda', 'falcon', 'otter', 'koala', 'dolphin', 'phoenix', 'tiger', 'owl']
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
	const noun = nouns[Math.floor(Math.random() * nouns.length)]
	const num = Math.floor(Math.random() * 1000)
	return `${adj}-${noun}-${num}`
}

function generatePassword(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	let result = ''
	for (let i = 0; i < 16; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}

function addDays(days: number): string {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date.toISOString()
}

async function createDemoAccount() {
	const HTTP = HTTPFactory()

	try {
		const username = generateUsername()
		const email = `${username}@demo.vikunja.io`
		const password = generatePassword()

		// Step 1: Register
		status.value = 'Creating account...'
		await HTTP.post('register', {username, email, password})

		// Step 2: Login
		status.value = 'Logging in...'
		const loginResponse = await HTTP.post('login', {username, password})
		const token = loginResponse.data.token
		saveToken(token, true)

		// Create authenticated HTTP client
		const AuthHTTP = HTTPFactory()
		AuthHTTP.defaults.headers.common['Authorization'] = `Bearer ${token}`

		// Step 3: Create labels
		status.value = 'Creating labels...'
		const labelMap: Record<string, number> = {}
		for (const label of DEMO_LABELS) {
			const response = await AuthHTTP.put('labels', label)
			labelMap[label.title] = response.data.id
		}

		// Step 4: Create projects
		status.value = 'Creating projects...'
		const projectIds: number[] = []
		for (const project of DEMO_PROJECTS) {
			const response = await AuthHTTP.put('projects', project)
			projectIds.push(response.data.id)
		}

		// Step 5: Create tasks
		status.value = 'Creating sample tasks...'
		for (const task of DEMO_TASKS) {
			const taskData: Record<string, unknown> = {
				title: task.title,
				due_date: addDays(task.due_date),
			}
			await AuthHTTP.put(`projects/${projectIds[task.project]}/tasks`, taskData)
		}

		// Step 6: Authenticate and redirect
		status.value = 'Redirecting...'
		await authStore.checkAuth()
		router.push({name: 'home'})

	} catch (e) {
		console.error('Demo creation failed:', e)
		error.value = e?.response?.data?.message || e?.message || 'Failed to create demo account'
	}
}

onMounted(() => {
	createDemoAccount()
})
</script>

<template>
	<div class="demo-create">
		<div class="demo-card">
			<img
				src="@/assets/llama.svg"
				alt="Vikunja"
				class="logo"
			>
			<h1>{{ error ? 'Error' : 'Setting up your demo...' }}</h1>
			<p
				v-if="!error"
				class="status"
			>
				{{ status }}
			</p>
			<p
				v-else
				class="error"
			>
				{{ error }}
			</p>
			<div
				v-if="!error"
				class="spinner"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
.demo-create {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background: var(--grey-900);
}

.demo-card {
	text-align: center;
	padding: 2rem;
}

.logo {
	width: 100px;
	margin-bottom: 1.5rem;
}

h1 {
	color: var(--grey-100);
	font-size: 1.5rem;
	margin-bottom: 0.5rem;
}

.status {
	color: var(--grey-400);
	font-size: 0.9rem;
}

.error {
	color: var(--danger);
	font-size: 0.9rem;
}

.spinner {
	width: 32px;
	height: 32px;
	border: 3px solid var(--grey-700);
	border-top-color: var(--primary);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 1.5rem auto 0;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
