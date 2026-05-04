<script lang="ts">
	import { onMount } from 'svelte';
	import { EmptyState, PageHeader } from '@dryui/primitives';
	import {
		Alert,
		Badge,
		BorderBeam,
		Button,
		ButtonGroup,
		Card,
		Container,
		DropdownMenu,
		Field,
		Input,
		Label,
		Link,
		RelativeTime,
		Skeleton,
		Text,
		VisuallyHidden
	} from '@dryui/ui';
	import {
		Check,
		ChevronDown,
		CheckCircle2,
		Copy,
		ExternalLink,
		Inbox,
		Rocket,
		Search,
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

	type DispatchSkillPaths = Partial<Record<DispatchAgent, string>>;

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

	function isInsideSearch(target: EventTarget | null): boolean {
		return target instanceof Element && target.closest('[data-feedback-search]') !== null;
	}

	function focusSearchInput(): void {
		queueMicrotask(() =>
			document.querySelector<HTMLInputElement>('[data-feedback-search] input')?.focus()
		);
	}

	function handleSearchMouseDown(event: MouseEvent): void {
		if (!searchOpen) return;
		if (isInsideSearch(event.target)) return;
		if (!search.trim()) searchOpen = false;
	}

	function handleSearchKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape') return;
		if (!searchOpen || !isInsideSearch(event.target)) return;
		event.preventDefault();
		closeSearch();
	}

	function openSearch(): void {
		searchOpen = true;
		focusSearchInput();
	}

	function closeSearch(): void {
		search = '';
		searchOpen = false;
	}
	let submissions = $state<Submission[]>([]);
	let dispatchTargets = $state<DispatchAgent[]>([]);
	let targetAgent = $state<DispatchAgent | null>(null);
	let dispatchSkillPaths = $state<DispatchSkillPaths>({});
	let bulkLaunching = $state(false);
	let bulkLaunched = $state(false);
	let bulkLaunchError = $state('');
	let bulkLaunchTimer: ReturnType<typeof setTimeout> | undefined;
	let focusApplied = false;

	let activeSkillPath = $derived(targetAgent ? (dispatchSkillPaths[targetAgent] ?? null) : null);
	const bulkPrompt = $derived(
		buildFeedbackBulkPrompt(activeSkillPath ? { skillPath: activeSkillPath } : undefined)
	);

	function pickTargetAgent(
		stored: DispatchAgent | null,
		fallback: DispatchAgent | 'off' | undefined,
		available: DispatchAgent[]
	): DispatchAgent | null {
		// Honor the user's last explicit choice. Never auto-pick: the user must
		// consciously select an agent each time, otherwise the server stays in
		// 'off' mode and no terminal opens behind their back.
		if (stored && available.includes(stored)) return stored;
		if (fallback && fallback !== 'off' && available.includes(fallback as DispatchAgent)) {
			return fallback as DispatchAgent;
		}
		return null;
	}

	function normalizeDispatchSkillPaths(
		skillPaths: DispatchSkillPaths | undefined,
		fallback: string | null,
		available: DispatchAgent[]
	): DispatchSkillPaths {
		if (skillPaths) return { ...skillPaths };
		if (!fallback) return {};
		return Object.fromEntries(available.map((agent) => [agent, fallback])) as DispatchSkillPaths;
	}

	async function loadDispatchTargets(): Promise<void> {
		try {
			const response = await fetch('/dispatch-targets');
			if (!response.ok) return;
			const body = (await response.json()) as {
				defaultAgent?: DispatchAgent | 'off';
				configuredAgents?: DispatchAgent[];
				skillPaths?: DispatchSkillPaths;
				skillPath?: string | null;
			};
			dispatchTargets = body.configuredAgents ?? [];
			dispatchSkillPaths = normalizeDispatchSkillPaths(
				body.skillPaths,
				body.skillPath ?? null,
				dispatchTargets
			);
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

	async function deleteSubmission(submissionId: string): Promise<void> {
		refreshing = true;
		error = '';

		try {
			const response = await fetch(`/submissions/${encodeURIComponent(submissionId)}`, {
				method: 'DELETE'
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

<svelte:document onmousedown={handleSearchMouseDown} onkeydown={handleSearchKeydown} />

<Container size="xl" padding={false}>
	<div class="dashboard-shell">
		<section class="dashboard">
			<PageHeader.Root>
				<PageHeader.Content>
					<div class="brand-lockup">
						<Link href="https://dryui.dev" external underline="none" aria-label="DryUI website">
							<span class="brand">
								<span class="wordmark">DryUI</span>
							</span>
						</Link>
						<PageHeader.Title level={1}>Feedback</PageHeader.Title>
					</div>
					<PageHeader.Description>
						Local review queue for captured markup, screenshots, and agent handoff.
					</PageHeader.Description>
				</PageHeader.Content>
				<PageHeader.Actions>
					<span class="hero-status">
						<Text as="span" size="sm" color="secondary">
							{#if lastLoadedAt}
								Updated <RelativeTime date={lastLoadedAt} />
							{:else}
								Not refreshed yet
							{/if}
						</Text>
					</span>
					<div class="dashboard-actions" role="group" aria-label="Dashboard actions">
						{#if devUrl}
							<Button
								href={devUrl}
								target="_blank"
								rel="noreferrer"
								variant="ghost"
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
					</div>
				</PageHeader.Actions>
			</PageHeader.Root>

			{#if error}
				<Alert variant="error">{error}</Alert>
			{/if}

			<div class="queue">
				<div class="filter-bar">
					<div class="filter-tabs">
						<div class="filter-segments">
							<ButtonGroup size="sm" aria-label="Submission status">
								<Button
									variant="toggle"
									size="sm"
									aria-pressed={activeTab === 'pending'}
									onclick={() => (activeTab = 'pending')}
								>
									<span class="tab-trigger">
										<span>Pending</span>
										<Badge variant="outline" color="gray" size="sm">
											{hasActiveSearch ? `${visiblePendingCount}/${pendingCount}` : pendingCount}
										</Badge>
									</span>
								</Button>
								<Button
									variant="toggle"
									size="sm"
									aria-pressed={activeTab === 'resolved'}
									onclick={() => (activeTab = 'resolved')}
								>
									<span class="tab-trigger">
										<span>Complete</span>
										<Badge variant="outline" color="gray" size="sm">
											{hasActiveSearch ? `${visibleResolvedCount}/${resolvedCount}` : resolvedCount}
										</Badge>
									</span>
								</Button>
							</ButtonGroup>
						</div>
					</div>

					<div class="filter-actions">
						<div
							class="filter-search"
							class:is-open={searchOpen || hasActiveSearch}
							data-feedback-search
							role="search"
						>
							{#if searchOpen || hasActiveSearch}
								<Field.Root>
									<Label size="sm">
										<VisuallyHidden>Search submissions</VisuallyHidden>
									</Label>
									<Input
										bind:value={search}
										size="sm"
										placeholder="Search URL, submission id, or note text"
									/>
								</Field.Root>
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
									<Search size={14} aria-hidden="true" />
								</Button>
							{/if}
						</div>

						{#if showBulkLaunch && targetAgent}
							<div class="filter-bulk">
								<div class="launch-group">
									<BorderBeam size="sm" colorVariant="colorful" borderRadius="var(--dry-radius-md)">
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
				</div>

				{#if bulkLaunchError}
					<Alert variant="error">{bulkLaunchError}</Alert>
				{/if}

				<div class="feed-panel">
					{#if activeTab === 'pending'}
						{#if loading && pendingCount === 0}
							<div class="loading-feed" aria-label="Loading pending submissions">
								{#each [0, 1] as index (index)}
									<Card.Root variant="elevated" size="sm">
										<Card.Content>
											<div class="submission-skeleton">
												<div class="skeleton-head">
													<Skeleton width="5rem" height="1.25rem" />
													<Skeleton width="min(34rem, 100%)" height="1.25rem" />
												</div>
												<div class="skeleton-body">
													<Skeleton variant="rectangular" height="9rem" />
													<div class="skeleton-lines">
														<Skeleton width="70%" height="1rem" />
														<Skeleton width="48%" height="1rem" />
														<Skeleton width="88%" height="6rem" variant="rectangular" />
													</div>
												</div>
											</div>
										</Card.Content>
									</Card.Root>
								{/each}
							</div>
						{:else if visiblePendingSubmissions.length === 0}
							<div class="empty-state">
								<EmptyState.Root>
									<EmptyState.Icon>
										<Inbox size={18} aria-hidden="true" />
									</EmptyState.Icon>
									<EmptyState.Title>
										{hasActiveSearch ? 'No pending matches' : 'No pending submissions'}
									</EmptyState.Title>
									<EmptyState.Description>
										{hasActiveSearch
											? 'Try a URL, submission id, or note from the captured annotation.'
											: 'New feedback appears here as soon as a reviewer submits an annotation.'}
									</EmptyState.Description>
									{#if hasActiveSearch}
										<EmptyState.Action>
											<Button variant="soft" size="sm" onclick={closeSearch}>Clear filter</Button>
										</EmptyState.Action>
									{/if}
								</EmptyState.Root>
							</div>
						{:else}
							<div class="feed">
								{#each visiblePendingSubmissions as submission (submission.id)}
									<div class="feed-item" data-submission-id={submission.id}>
										<SubmissionCard
											{submission}
											{dispatchTargets}
											{targetAgent}
											{refreshing}
											skillPath={activeSkillPath}
											onChooseAgent={chooseTargetAgent}
											onSetStatus={setSubmissionStatus}
											onDelete={deleteSubmission}
											onLaunch={dispatchAgent}
										/>
									</div>
								{/each}
							</div>
						{/if}
					{:else if loading && resolvedCount === 0}
						<div class="loading-feed" aria-label="Loading resolved submissions">
							{#each [0, 1] as index (index)}
								<Card.Root variant="elevated" size="sm">
									<Card.Content>
										<div class="submission-skeleton">
											<div class="skeleton-head">
												<Skeleton width="5rem" height="1.25rem" />
												<Skeleton width="min(34rem, 100%)" height="1.25rem" />
											</div>
											<div class="skeleton-body">
												<Skeleton variant="rectangular" height="9rem" />
												<div class="skeleton-lines">
													<Skeleton width="70%" height="1rem" />
													<Skeleton width="48%" height="1rem" />
													<Skeleton width="88%" height="6rem" variant="rectangular" />
												</div>
											</div>
										</div>
									</Card.Content>
								</Card.Root>
							{/each}
						</div>
					{:else if visibleResolvedSubmissions.length === 0}
						<div class="empty-state">
							<EmptyState.Root>
								<EmptyState.Icon>
									<CheckCircle2 size={18} aria-hidden="true" />
								</EmptyState.Icon>
								<EmptyState.Title>
									{hasActiveSearch ? 'No completed matches' : 'No completed submissions'}
								</EmptyState.Title>
								<EmptyState.Description>
									{hasActiveSearch
										? 'Try a URL, submission id, or note from the captured annotation.'
										: 'Resolved feedback is kept here for local review history.'}
								</EmptyState.Description>
								{#if hasActiveSearch}
									<EmptyState.Action>
										<Button variant="soft" size="sm" onclick={closeSearch}>Clear filter</Button>
									</EmptyState.Action>
								{/if}
							</EmptyState.Root>
						</div>
					{:else}
						<div class="feed">
							{#each visibleResolvedSubmissions as submission (submission.id)}
								<div class="feed-item" data-submission-id={submission.id}>
									<SubmissionCard
										{submission}
										{dispatchTargets}
										{targetAgent}
										{refreshing}
										skillPath={activeSkillPath}
										onChooseAgent={chooseTargetAgent}
										onSetStatus={setSubmissionStatus}
										onDelete={deleteSubmission}
										onLaunch={dispatchAgent}
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
</Container>

<style>
	.dashboard-shell {
		container: feedback-dashboard / inline-size;
		--dry-card-radius: var(--dry-radius-md);
		--dry-card-shadow: none;
		--dry-btn-radius: var(--dry-radius-md);

		display: grid;
	}

	.dashboard {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
	}

	.brand {
		display: inline-grid;
		align-items: center;
		color: inherit;
		text-decoration: none;
		border-radius: var(--dry-radius-md);
		--dry-link-color: inherit;
		--dry-link-hover-color: inherit;
	}

	.brand-lockup {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.brand:focus-visible {
		outline: 2px solid var(--dry-color-stroke-brand, var(--dry-color-fill-brand));
		outline-offset: 2px;
	}

	.wordmark {
		display: inline-grid;
		align-items: center;
		color: var(--dry-color-text-strong);
		font-family:
			Arial,
			Helvetica Neue,
			Helvetica,
			system-ui,
			sans-serif;
		font-size: var(--dry-type-ui-section-size, var(--dry-type-heading-3-size));
		font-weight: 800;
		letter-spacing: 0;
		line-height: 0.92;
		text-transform: none;
	}

	.refresh-icon {
		display: inline-grid;
		place-items: center;
	}

	.refresh-icon[data-spinning='true'] {
		animation: spin 1s linear infinite;
	}

	.dashboard-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		align-items: center;
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

	.queue {
		display: grid;
		gap: var(--dry-space-2);
	}

	.filter-bar {
		container: feedback-filters / inline-size;
		--dry-btn-radius: var(--dry-radius-md);

		display: grid;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.filter-actions {
		display: grid;
		gap: var(--dry-space-2);
		align-items: center;
		justify-items: start;
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
		grid-template-columns: minmax(0, 1fr) auto;
		justify-self: stretch;
	}

	.filter-tabs {
		display: grid;
		justify-self: start;
	}

	.filter-segments {
		--dry-button-group-gap: var(--dry-space-2);
		--dry-button-group-radius: var(--dry-radius-md);
		--dry-btn-min-height: var(--dry-space-8);
		--dry-btn-padding-x: var(--dry-space-3);
		--dry-btn-padding-y: var(--dry-space-0_5);
		--dry-btn-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	.filter-bulk {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
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
		border-radius: var(--dry-radius-md);
	}

	.agent-menu-label {
		font-size: var(--dry-text-sm-size);
		font-weight: 500;
	}

	.feed {
		display: grid;
		gap: var(--dry-space-2);
	}

	.feed-panel {
		display: grid;
	}

	.loading-feed {
		display: grid;
		gap: var(--dry-space-3);
	}

	.submission-skeleton,
	.skeleton-lines {
		display: grid;
		gap: var(--dry-space-2);
	}

	.skeleton-head {
		display: grid;
		gap: var(--dry-space-2);
	}

	.skeleton-body {
		display: grid;
		gap: var(--dry-space-3);
		align-items: start;
	}

	.feed-item {
		display: grid;
		scroll-margin-block-start: var(--dry-space-3);
	}

	@container feedback-dashboard (max-width: 36rem) {
		.dashboard {
			gap: var(--dry-space-2);
			padding: var(--dry-space-2);
		}

		.brand-lockup {
			grid-auto-flow: row;
			grid-auto-columns: initial;
			gap: var(--dry-space-2);
			align-items: start;
		}
	}

	@container feedback-filters (min-width: 42rem) {
		.filter-actions {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
			justify-content: start;
		}

		.filter-search.is-open {
			grid-template-columns: minmax(18rem, 28rem) auto;
		}

		.filter-bulk {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
			grid-template-columns: none;
		}
	}

	@container feedback-dashboard (min-width: 48rem) {
		.filter-bar {
			grid-template-columns: max-content max-content;
			justify-content: start;
			align-items: center;
		}

		.skeleton-head {
			grid-template-columns: max-content minmax(0, 1fr);
		}

		.skeleton-body {
			grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
		}
	}
</style>
