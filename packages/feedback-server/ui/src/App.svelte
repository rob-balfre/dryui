<script lang="ts">
	import { onMount } from 'svelte';
	import { PageHeader } from '@dryui/primitives';
	import {
		Alert,
		Badge,
		BorderBeam,
		Button,
		Card,
		Container,
		DropdownMenu,
		Input,
		Tabs,
		Text
	} from '@dryui/ui';
	import {
		Check,
		ChevronDown,
		Copy,
		ExternalLink,
		Filter,
		Rocket,
		RefreshCw,
		X
	} from 'lucide-svelte';
	import { normalizeDevUrl } from '../../src/dev-url.js';
	import { buildFeedbackBulkPrompt } from '../../src/prompts.js';
	import type { Submission, SubmissionStatus } from '../../src/types.js';
	import AgentIcon from './agent-icon.svelte';
	import { AGENT_INFO, type DispatchAgent } from './agent-meta.js';
	import SubmissionCard from './submission-card.svelte';

	const AGENT_STORAGE_KEY = 'dryui-feedback-target-agent';
	const FOCUS_QUERY_PARAM = 'focus';

	interface SubmissionResponse {
		count: number;
		submissions: Submission[];
	}

	function readFocusId(): string | null {
		if (typeof window === 'undefined') return null;
		try {
			return new URL(window.location.href).searchParams.get(FOCUS_QUERY_PARAM);
		} catch {
			return null;
		}
	}

	function clearFocusQueryParam(): void {
		if (typeof window === 'undefined') return;
		try {
			const current = new URL(window.location.href);
			if (!current.searchParams.has(FOCUS_QUERY_PARAM)) return;
			current.searchParams.delete(FOCUS_QUERY_PARAM);
			window.history.replaceState(window.history.state, '', current.toString());
		} catch {
			// Navigation state is not critical; swallow replace failures.
		}
	}

	let activeTab = $state<SubmissionStatus>('pending');
	let error = $state('');
	let lastLoadedAt = $state<string | null>(null);
	let loading = $state(true);
	let bulkCopied = $state(false);
	let bulkCopyTimer: ReturnType<typeof setTimeout> | undefined;
	let refreshing = $state(false);
	let search = $state('');
	let searchOpen = $state(false);
	let searchContainer = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (searchOpen && searchContainer) {
			searchContainer.querySelector('input')?.focus();
		}
	});

	$effect(() => {
		if (!searchOpen) return;
		const handler = (event: MouseEvent) => {
			if (!searchContainer) return;
			if (searchContainer.contains(event.target as Node)) return;
			if (!search.trim()) searchOpen = false;
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	});

	function openSearch(): void {
		searchOpen = true;
	}

	function closeSearch(): void {
		search = '';
		searchOpen = false;
	}

	function handleSearchKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
		}
	}
	let submissions = $state<Submission[]>([]);
	let dispatchTargets = $state<DispatchAgent[]>([]);
	let targetAgent = $state<DispatchAgent | null>(null);
	let bulkLaunching = $state(false);
	let bulkLaunched = $state(false);
	let bulkLaunchError = $state('');
	let bulkLaunchTimer: ReturnType<typeof setTimeout> | undefined;
	let focusApplied = false;

	const bulkPrompt = buildFeedbackBulkPrompt();

	function pickTargetAgent(
		stored: DispatchAgent | null,
		fallback: DispatchAgent | undefined,
		available: DispatchAgent[]
	): DispatchAgent | null {
		if (stored && available.includes(stored)) return stored;
		if (fallback && available.includes(fallback)) return fallback;
		return available[0] ?? null;
	}

	async function loadDispatchTargets(): Promise<void> {
		try {
			const response = await fetch('/dispatch-targets');
			if (!response.ok) return;
			const body = (await response.json()) as {
				defaultAgent?: DispatchAgent;
				configuredAgents?: DispatchAgent[];
			};
			dispatchTargets = body.configuredAgents ?? [];
			const stored =
				typeof window !== 'undefined'
					? (window.localStorage.getItem(AGENT_STORAGE_KEY) as DispatchAgent | null)
					: null;
			targetAgent = pickTargetAgent(stored, body.defaultAgent, dispatchTargets);
		} catch {
			// Dispatcher is optional; swallow errors silently.
		}
	}

	function chooseTargetAgent(agent: DispatchAgent): void {
		targetAgent = agent;
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(AGENT_STORAGE_KEY, agent);
		}
	}

	async function dispatchAgent(prompt: string, submissionId?: string): Promise<void> {
		if (!targetAgent) throw new Error('No dispatch target configured');
		const response = await fetch('/dispatch', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				agent: targetAgent,
				prompt,
				...(submissionId ? { submissionId } : {})
			})
		});
		if (!response.ok) {
			const message = await response.text();
			throw new Error(message || `HTTP ${response.status}`);
		}
	}

	async function launchBulk(): Promise<void> {
		if (!targetAgent || bulkLaunching) return;
		bulkLaunching = true;
		bulkLaunched = false;
		bulkLaunchError = '';
		try {
			await dispatchAgent(bulkPrompt);
			bulkLaunched = true;
			clearTimeout(bulkLaunchTimer);
			bulkLaunchTimer = setTimeout(() => {
				bulkLaunched = false;
			}, 2500);
		} catch (errorValue) {
			bulkLaunchError = extractMessage(errorValue);
		} finally {
			bulkLaunching = false;
		}
	}

	function copyBulk(): void {
		navigator.clipboard.writeText(bulkPrompt).then(() => {
			bulkCopied = true;
			clearTimeout(bulkCopyTimer);
			bulkCopyTimer = setTimeout(() => {
				bulkCopied = false;
			}, 2000);
		});
	}

	function readDevUrl(): string | null {
		if (typeof window === 'undefined') return null;
		const value = new URL(window.location.href).searchParams.get('dev');
		return normalizeDevUrl(value);
	}

	const devUrl = readDevUrl();

	function formatRelativeTime(value: string): string {
		const deltaMs = Date.now() - new Date(value).getTime();
		const deltaMinutes = Math.round(deltaMs / 60_000);

		if (Math.abs(deltaMinutes) < 1) return 'just now';
		if (Math.abs(deltaMinutes) < 60) return `${deltaMinutes}m ago`;

		const deltaHours = Math.round(deltaMinutes / 60);
		if (Math.abs(deltaHours) < 24) return `${deltaHours}h ago`;

		const deltaDays = Math.round(deltaHours / 24);
		return `${deltaDays}d ago`;
	}

	function normalizeSearchTokens(query: string): string[] {
		return query
			.toLowerCase()
			.split(/[^a-z0-9.-]+/g)
			.filter(Boolean);
	}

	function searchableText(submission: Submission): string {
		const textNotes = submission.drawings
			.flatMap((drawing) =>
				drawing.kind === 'text' && typeof drawing.text === 'string' && drawing.text.length > 0
					? [drawing.text]
					: []
			)
			.join(' ')
			.toLowerCase();

		try {
			const url = new URL(submission.url);
			return [submission.url, url.hostname, url.pathname, submission.id, textNotes]
				.join(' ')
				.toLowerCase();
		} catch {
			return [submission.url, submission.id, textNotes].join(' ').toLowerCase();
		}
	}

	function matchesSearch(submission: Submission, query: string): boolean {
		const tokens = normalizeSearchTokens(query);
		if (tokens.length === 0) return true;

		const haystack = searchableText(submission);
		return tokens.every((token) => haystack.includes(token));
	}

	function byCreatedAtDesc(a: Submission, b: Submission): number {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	}

	function extractMessage(errorValue: unknown): string {
		return errorValue instanceof Error ? errorValue.message : 'Unknown error';
	}

	async function readSubmissions(): Promise<SubmissionResponse> {
		const response = await fetch('/submissions?status=all');
		if (!response.ok) {
			const message = await response.text();
			throw new Error(message || `HTTP ${response.status}`);
		}

		return response.json() as Promise<SubmissionResponse>;
	}

	async function loadSubmissions(mode: 'initial' | 'refresh' = 'initial'): Promise<void> {
		if (mode === 'initial') {
			loading = true;
		} else {
			refreshing = true;
		}

		error = '';

		try {
			const response = await readSubmissions();
			submissions = response.submissions;
			lastLoadedAt = new Date().toISOString();
			applyFocusSelection();
		} catch (errorValue) {
			error = extractMessage(errorValue);
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	function applyFocusSelection(): void {
		if (focusApplied) return;
		focusApplied = true;
		const focusId = readFocusId();
		if (!focusId) return;
		const match = submissions.find((submission) => submission.id === focusId);
		if (!match) return;
		activeTab = match.status;
		clearFocusQueryParam();
		if (typeof document === 'undefined') return;
		requestAnimationFrame(() => {
			const node = document.querySelector<HTMLElement>(`[data-submission-id="${match.id}"]`);
			if (node) {
				node.scrollIntoView({ block: 'start', behavior: 'smooth' });
			}
		});
	}

	async function setSubmissionStatus(
		submissionId: string,
		status: SubmissionStatus
	): Promise<void> {
		refreshing = true;
		error = '';

		try {
			const response = await fetch(`/submissions/${encodeURIComponent(submissionId)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || `HTTP ${response.status}`);
			}

			await loadSubmissions('refresh');
		} catch (errorValue) {
			error = extractMessage(errorValue);
			refreshing = false;
		}
	}

	let pendingSubmissions = $derived.by(() =>
		[...submissions].filter((submission) => submission.status === 'pending').sort(byCreatedAtDesc)
	);
	let resolvedSubmissions = $derived.by(() =>
		[...submissions].filter((submission) => submission.status === 'resolved').sort(byCreatedAtDesc)
	);
	let visiblePendingSubmissions = $derived.by(() =>
		pendingSubmissions.filter((submission) => matchesSearch(submission, search))
	);
	let visibleResolvedSubmissions = $derived.by(() =>
		resolvedSubmissions.filter((submission) => matchesSearch(submission, search))
	);
	let hasActiveSearch = $derived(search.trim().length > 0);
	let pendingCount = $derived(pendingSubmissions.length);
	let resolvedCount = $derived(resolvedSubmissions.length);
	let visiblePendingCount = $derived(visiblePendingSubmissions.length);
	let visibleResolvedCount = $derived(visibleResolvedSubmissions.length);
	let showBulkLaunch = $derived(
		activeTab === 'pending' && dispatchTargets.length > 0 && targetAgent !== null
	);

	onMount(() => {
		void loadSubmissions('initial');
		void loadDispatchTargets();
		const intervalId = window.setInterval(() => void loadSubmissions('refresh'), 10_000);

		return () => {
			window.clearInterval(intervalId);
			clearTimeout(bulkLaunchTimer);
			clearTimeout(bulkCopyTimer);
		};
	});
</script>

<Container size="xl" padding={false}>
	<section class="dashboard">
		<PageHeader.Root>
			<PageHeader.Content>
				<a class="brand" href="https://dryui.dev" target="_blank" rel="noreferrer">
					<span class="wordmark" aria-label="DryUI">
						DRY<span class="wordmark-badge">ui</span>
					</span>
					<span class="brand-divider" aria-hidden="true"></span>
					<span class="brand-title">Feedback</span>
				</a>
			</PageHeader.Content>
			<PageHeader.Actions>
				<span class="hero-status">
					<Text as="span" size="xs" color="secondary">
						{lastLoadedAt ? `Updated ${formatRelativeTime(lastLoadedAt)}` : 'Not refreshed yet'}
					</Text>
				</span>
				{#if devUrl}
					<Button
						href={devUrl}
						target="_blank"
						rel="noreferrer"
						variant="soft"
						size="sm"
						aria-label="Open dev app"
					>
						<ExternalLink size={14} aria-hidden="true" />
						Open dev app
					</Button>
				{/if}
				<Button
					variant="outline"
					size="sm"
					onclick={() => void loadSubmissions('refresh')}
					disabled={refreshing}
					aria-label="Refresh submissions"
				>
					<span class="refresh-icon" data-spinning={refreshing || undefined}>
						<RefreshCw size={14} aria-hidden="true" />
					</span>
					{refreshing ? 'Refreshing' : 'Refresh'}
				</Button>
			</PageHeader.Actions>
		</PageHeader.Root>

		{#if error}
			<Alert variant="error">{error}</Alert>
		{/if}

		<Tabs.Root bind:value={activeTab}>
			<Card.Root variant="elevated" size="sm">
				<Card.Content>
					<div class="filter-bar">
						<div
							class="filter-search"
							class:is-open={searchOpen || hasActiveSearch}
							bind:this={searchContainer}
							onkeydown={handleSearchKeydown}
						>
							{#if searchOpen || hasActiveSearch}
								<Input
									bind:value={search}
									size="sm"
									placeholder="Search URL, submission id, or note text"
									aria-label="Search submissions"
								/>
								<Tabs.List>
									<Tabs.Trigger value="pending">
										<span class="tab-trigger">
											<span>Pending</span>
											<Badge variant="outline" color="gray" size="sm">
												{hasActiveSearch ? `${visiblePendingCount}/${pendingCount}` : pendingCount}
											</Badge>
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger value="resolved">
										<span class="tab-trigger">
											<span>Complete</span>
											<Badge variant="outline" color="gray" size="sm">
												{hasActiveSearch
													? `${visibleResolvedCount}/${resolvedCount}`
													: resolvedCount}
											</Badge>
										</span>
									</Tabs.Trigger>
								</Tabs.List>
								<Button variant="soft" size="sm" onclick={closeSearch} aria-label="Close filter">
									<X size={14} aria-hidden="true" />
								</Button>
							{:else}
								<Button
									variant="soft"
									size="sm"
									onclick={openSearch}
									aria-label="Filter submissions"
								>
									<Filter size={14} aria-hidden="true" />
								</Button>
							{/if}
						</div>

						{#if showBulkLaunch && targetAgent}
							<div class="filter-bulk">
								<div class="launch-group">
									<BorderBeam size="sm" colorVariant="colorful" borderRadius={8}>
										<Button
											variant="solid"
											size="sm"
											onclick={launchBulk}
											disabled={bulkLaunching || pendingCount === 0}
											aria-label={bulkLaunched
												? 'Agent launched'
												: `Work through all pending with ${AGENT_INFO[targetAgent].label}`}
										>
											{#if bulkLaunched}
												<Check size={14} aria-hidden="true" />
												Launched
											{:else if bulkLaunching}
												<Rocket size={14} aria-hidden="true" />
												Launching...
											{:else}
												<Rocket size={14} aria-hidden="true" />
												Work through all
											{/if}
										</Button>
									</BorderBeam>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<Button variant="soft" size="sm" aria-label="Choose dispatch target">
												<AgentIcon agent={targetAgent} size={14} />
												<ChevronDown size={12} aria-hidden="true" />
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content placement="bottom-end" offset={8}>
											<DropdownMenu.Label>Dispatch target</DropdownMenu.Label>
											{#each dispatchTargets as agent (agent)}
												<DropdownMenu.Item
													onclick={() => chooseTargetAgent(agent)}
													data-active={agent === targetAgent || undefined}
												>
													<AgentIcon {agent} size={16} />
													<span class="agent-menu-label">
														{AGENT_INFO[agent].label}
													</span>
													{#if agent === targetAgent}
														<Check size={12} aria-hidden="true" />
													{/if}
												</DropdownMenu.Item>
											{/each}
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
								<Button
									variant="soft"
									size="sm"
									onclick={copyBulk}
									aria-label={bulkCopied ? 'Copied bulk prompt' : 'Copy bulk prompt'}
								>
									{#if bulkCopied}
										<Check size={14} aria-hidden="true" />
										Copied
									{:else}
										<Copy size={14} aria-hidden="true" />
										Copy prompt
									{/if}
								</Button>
							</div>
						{/if}
					</div>

					{#if bulkLaunchError}
						<Alert variant="error">{bulkLaunchError}</Alert>
					{/if}
				</Card.Content>
			</Card.Root>

			<Tabs.Content value="pending">
				{#if loading && pendingCount === 0}
					<Alert variant="info">Loading queued submissions...</Alert>
				{:else if visiblePendingSubmissions.length === 0}
					<Alert variant="info">No pending submissions match the current filter.</Alert>
				{:else}
					<div class="feed">
						{#each visiblePendingSubmissions as submission (submission.id)}
							<div class="feed-item" data-submission-id={submission.id}>
								<SubmissionCard
									{submission}
									{dispatchTargets}
									{targetAgent}
									{refreshing}
									onChooseAgent={chooseTargetAgent}
									onSetStatus={setSubmissionStatus}
									onLaunch={dispatchAgent}
								/>
							</div>
						{/each}
					</div>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="resolved">
				{#if loading && resolvedCount === 0}
					<Alert variant="info">Loading resolved history...</Alert>
				{:else if visibleResolvedSubmissions.length === 0}
					<Alert variant="info">No resolved submissions match the current filter.</Alert>
				{:else}
					<div class="feed">
						{#each visibleResolvedSubmissions as submission (submission.id)}
							<div class="feed-item" data-submission-id={submission.id}>
								<SubmissionCard
									{submission}
									{dispatchTargets}
									{targetAgent}
									{refreshing}
									onChooseAgent={chooseTargetAgent}
									onSetStatus={setSubmissionStatus}
									onLaunch={dispatchAgent}
								/>
							</div>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</section>
</Container>

<style>
	.dashboard {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
	}

	.brand {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-3);
		align-items: center;
		color: inherit;
		text-decoration: none;
		border-radius: var(--dry-radius-md);
	}

	.brand:focus-visible {
		outline: 2px solid var(--dry-color-stroke-brand, var(--dry-color-fill-brand));
		outline-offset: 2px;
	}

	.wordmark {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 0.2em;
		font-size: var(--dry-font-size-base, 1rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--dry-color-text-strong);
	}

	.wordmark-badge {
		border: 1.5px solid currentColor;
		padding: 0.1em 0.3em;
		border-radius: 0.25em;
		font-size: 0.75em;
		font-weight: 800;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.brand-divider {
		display: block;
		height: 1rem;
		border-left: 1px solid var(--dry-color-stroke-weak);
	}

	.brand-title {
		font-size: var(--dry-font-size-base, 1rem);
		font-weight: 600;
		color: var(--dry-color-text-strong);
		letter-spacing: -0.01em;
	}

	.refresh-icon {
		display: inline-grid;
		place-items: center;
	}

	.refresh-icon[data-spinning='true'] {
		animation: spin 1s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.refresh-icon[data-spinning='true'] {
			animation: none;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.filter-bar {
		display: grid;
		gap: var(--dry-space-3);
		align-items: center;
	}

	.filter-search {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		justify-self: start;
	}

	.filter-search.is-open {
		grid-template-columns: minmax(0, 1fr) auto auto;
		justify-self: stretch;
	}

	.filter-bulk {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.tab-trigger {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.launch-group {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		border-radius: 8px;
	}

	.agent-menu-label {
		font-size: var(--dry-text-sm-size);
		font-weight: 500;
	}

	.feed {
		display: grid;
		gap: var(--dry-space-3);
	}

	.feed-item {
		display: grid;
		scroll-margin-block-start: var(--dry-space-3);
	}

	@container (min-width: 48rem) {
		.filter-bar {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}
	}
</style>
