<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'

import {HTTPFactory} from '@/helpers/fetcher'
import {saveToken} from '@/helpers/auth'
import {useAuthStore} from '@/stores/auth'
import Logo from '@/assets/logo.svg?component'

const router = useRouter()
const authStore = useAuthStore()

const status = ref('Creating demo account...')
const error = ref('')

// Rate limiting: 1 demo account per 30 seconds per browser
const COOLDOWN_KEY = 'demo_account_cooldown'
const COOLDOWN_MS = 30 * 1000 // 30 seconds

function checkCooldown(): boolean {
	const lastCreated = localStorage.getItem(COOLDOWN_KEY)
	if (!lastCreated) return true
	const elapsed = Date.now() - parseInt(lastCreated, 10)
	return elapsed > COOLDOWN_MS
}

function setCooldown(): void {
	localStorage.setItem(COOLDOWN_KEY, Date.now().toString())
}

// Capacity check: server-side limit on total demo accounts
interface DemoStatus {
	can_create: boolean
	status: string
	total_accounts: number
	max_accounts: number
	capacity_percent: number
}

async function checkCapacity(): Promise<{allowed: boolean, message?: string}> {
	try {
		const response = await fetch('/demo-status')
		if (!response.ok) {
			// If status endpoint unavailable, allow creation (fail open)
			return {allowed: true}
		}
		const data: DemoStatus = await response.json()
		if (!data.can_create) {
			return {
				allowed: false,
				message: `Demo is at capacity (${data.total_accounts}/${data.max_accounts} accounts). Please try again later.`,
			}
		}
		return {allowed: true}
	} catch {
		// Network error - fail open to allow creation
		return {allowed: true}
	}
}

// IP tracking: record account creation for per-IP limits
const DEMO_EMAIL_KEY = 'demo_account_email'

async function recordAccountCreation(email: string): Promise<void> {
	try {
		await fetch('/demo-api/record', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({email}),
		})
		// Store email for logout deletion
		localStorage.setItem(DEMO_EMAIL_KEY, email)
	} catch {
		// Non-critical - account still works if tracking fails
		console.warn('Failed to record demo account creation')
	}
}

// Demo data
const DEMO_LABELS = [
	{title: 'Personal', hex_color: '3b82f6'},
	{title: 'Work', hex_color: 'f59e0b'},
	{title: 'Health', hex_color: '10b981'},
]

const DEMO_PROJECTS = [
	// Note: "Inbox" is auto-created by Vikunja on registration, so we only add extra projects
	{title: 'Trip to Mars', description: 'Planning the ultimate vacation'},
]

const DEMO_TASKS = [
	// Inbox tasks (project: 'inbox' refers to auto-created Inbox)
	{project: 'inbox', title: 'Call mom', labels: ['Personal'], due_date: 3},
	{project: 'inbox', title: 'Start a new book', labels: ['Work'], due_date: 7},
	{project: 'inbox', title: 'Plan weekend hike', labels: [], due_date: 8},
	{project: 'inbox', title: 'Update resume', labels: ['Health'], due_date: 9},
	// Trip to Mars tasks (project: 'mars' refers to our created project)
	{project: 'mars', title: 'Learn Martian language', labels: [], due_date: 7},
	{project: 'mars', title: 'Prepare for low gravity', labels: [], due_date: 90},
	{project: 'mars', title: 'Research Martian weather', labels: [], due_date: 120},
	{project: 'mars', title: 'Book rocket to Mars', labels: [], due_date: 120},
	{project: 'mars', title: 'Pack space snacks', labels: [], due_date: 365},
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
	// Note: Don't clear auth state here - it triggers router guards that redirect to login
	// The fullscreen overlay hides any cached UI

	// Check rate limit (client-side)
	if (!checkCooldown()) {
		const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10))) / 1000)
		error.value = `Please wait ${remaining} second(s) before creating another demo account.`
		return
	}

	// Check server capacity
	status.value = 'Checking availability...'
	const capacityCheck = await checkCapacity()
	if (!capacityCheck.allowed) {
		error.value = capacityCheck.message || 'Demo is at capacity. Please try again later.'
		return
	}

	const HTTP = HTTPFactory()

	try {
		const username = generateUsername()
		const email = `${username}@demo.vikunja.io`
		const password = generatePassword()

		// Step 1: Register
		status.value = 'Creating account...'
		await HTTP.post('register', {username, email, password})

		// Record for IP tracking (auto-deletes oldest if over limit)
		await recordAccountCreation(email)

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

		// Step 4: Get existing projects (Inbox is auto-created on registration)
		status.value = 'Setting up projects...'
		const existingProjects = await AuthHTTP.get('projects')
		const inboxProject = existingProjects.data.find((p: {title: string}) => p.title === 'Inbox')
		const projectMap: Record<string, number> = {
			inbox: inboxProject?.id,
		}

		// Create additional projects
		for (const project of DEMO_PROJECTS) {
			const response = await AuthHTTP.put('projects', project)
			if (project.title === 'Trip to Mars') {
				projectMap.mars = response.data.id
			}
		}

		// Step 5: Create tasks
		status.value = 'Creating sample tasks...'
		for (const task of DEMO_TASKS) {
			const projectId = projectMap[task.project]
			if (!projectId) continue
			const taskData: Record<string, unknown> = {
				title: task.title,
				due_date: addDays(task.due_date),
			}
			await AuthHTTP.put(`projects/${projectId}/tasks`, taskData)
		}

		// Step 6: Authenticate and redirect
		status.value = 'Redirecting...'
		setCooldown() // Prevent rapid demo account creation
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
			<Logo
				alt="Vikunja"
				class="logo"
			/>
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
	position: fixed;
	inset: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--grey-900);
}

.demo-card {
	text-align: center;
	padding: 2rem;
}

.logo {
	inline-size: 100px;
	margin-block-end: 1.5rem;
}

h1 {
	color: var(--grey-100);
	font-size: 1.5rem;
	margin-block-end: 0.5rem;
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
	inline-size: 32px;
	block-size: 32px;
	border: 3px solid var(--grey-700);
	border-block-start-color: var(--primary);
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
