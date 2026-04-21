<script lang="ts">
	import { onMount } from 'svelte';
	import { PageHeader } from '@dryui/primitives';
	import {
		Alert,
		Badge,
		BorderBeam,
		Button,
		Card,
		CodeBlock,
		Container,
		Dialog,
		DropdownMenu,
		Field,
		Heading,
		Image,
		Input,
		Label,
		Tabs,
		Text
	} from '@dryui/ui';
	import {
		Check,
		ChevronDown,
		Copy,
		CornerLeftUp,
		ExternalLink,
		MessageSquare,
		Rocket,
		RefreshCw
	} from 'lucide-svelte';
	import { normalizeDevUrl } from '../../src/dev-url.js';
	import {
		buildFeedbackBulkPrompt,
		buildFeedbackDispatchPrompt,
		getTextNotes
	} from '../../src/prompts.js';
	import type { Submission, SubmissionStatus } from '../../src/types.js';
	import AgentIcon from './agent-icon.svelte';
	import { AGENT_INFO, type DispatchAgent } from './agent-meta.js';

	const AGENT_STORAGE_KEY = 'dryui-feedback-target-agent';

	interface SubmissionResponse {
		count: number;
		submissions: Submission[];
	}

	interface DrawingCount {
		label: string;
		count: number;
	}

	let activeTab = $state<SubmissionStatus>('pending');
	let error = $state('');
	let lastLoadedAt = $state<string | null>(null);
	let loading = $state(true);
	let promptCopied = $state(false);
	let promptCopyTimer: ReturnType<typeof setTimeout> | undefined;
	let refreshing = $state(false);
	let search = $state('');
	let selectedId = $state<string | null>(null);
	let submissions = $state<Submission[]>([]);
	let dispatchTargets = $state<DispatchAgent[]>([]);
	let targetAgent = $state<DispatchAgent | null>(null);
	let launching = $state(false);
	let launched = $state(false);
	let launchError = $state('');
	let launchFeedbackTimer: ReturnType<typeof setTimeout> | undefined;

	function copyPrompt(text: string): void {
		navigator.clipboard.writeText(text).then(() => {
			promptCopied = true;
			clearTimeout(promptCopyTimer);
			promptCopyTimer = setTimeout(() => {
				promptCopied = false;
			}, 2000);
		});
	}

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

	async function launchAgent(prompt: string): Promise<void> {
		if (!targetAgent || launching) return;
		launching = true;
		launched = false;
		launchError = '';
		try {
			const response = await fetch('/dispatch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ agent: targetAgent, prompt })
			});
			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || `HTTP ${response.status}`);
			}
			launched = true;
			clearTimeout(launchFeedbackTimer);
			launchFeedbackTimer = setTimeout(() => {
				launched = false;
			}, 2500);
		} catch (errorValue) {
			launchError = extractMessage(errorValue);
		} finally {
			launching = false;
		}
	}

	function readDevUrl(): string | null {
		if (typeof window === 'undefined') return null;
		const value = new URL(window.location.href).searchParams.get('dev');
		return normalizeDevUrl(value);
	}

	const devUrl = readDevUrl();

	function formatAbsoluteTime(value: string): string {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}

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
		const textNotes = getTextNotes(submission.drawings).join(' ').toLowerCase();

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

	function pendingSort(a: Submission, b: Submission): number {
		return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
	}

	function resolvedSort(a: Submission, b: Submission): number {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	}

	function extractMessage(errorValue: unknown): string {
		return errorValue instanceof Error ? errorValue.message : 'Unknown error';
	}

	function screenshotUrl(submissionId: string): string {
		return `/submissions/${encodeURIComponent(submissionId)}/screenshot`;
	}

	function statusColor(status: SubmissionStatus): 'green' | 'yellow' {
		return status === 'resolved' ? 'green' : 'yellow';
	}

	function statusLabel(status: SubmissionStatus): string {
		return status === 'resolved' ? 'Resolved' : 'Pending';
	}

	function shortenId(value: string): string {
		return value.slice(0, 8);
	}

	function formatViewport(viewport: Submission['viewport']): string {
		if (!viewport) return 'Unknown';
		return `${viewport.width} x ${viewport.height}`;
	}

	function readDrawingKind(value: unknown): string {
		if (typeof value !== 'object' || value === null) return 'unknown';
		const kind = Reflect.get(value, 'kind');
		return typeof kind === 'string' ? kind : 'unknown';
	}

	function getDrawingCounts(drawings: unknown[]): DrawingCount[] {
		const counts: Record<string, number> = {};

		for (const drawing of drawings) {
			const kind = readDrawingKind(drawing);
			counts[kind] = (counts[kind] ?? 0) + 1;
		}

		return Object.entries(counts).map(([kind, count]) => ({
			label:
				kind === 'freehand'
					? 'Freehand'
					: kind === 'arrow'
						? 'Arrows'
						: kind === 'text'
							? 'Text'
							: 'Other',
			count
		}));
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
		} catch (errorValue) {
			error = extractMessage(errorValue);
		} finally {
			loading = false;
			refreshing = false;
		}
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
		[...submissions].filter((submission) => submission.status === 'pending').sort(pendingSort)
	);
	let resolvedSubmissions = $derived.by(() =>
		[...submissions].filter((submission) => submission.status === 'resolved').sort(resolvedSort)
	);
	let visiblePendingSubmissions = $derived.by(() =>
		pendingSubmissions.filter((submission) => matchesSearch(submission, search))
	);
	let visibleResolvedSubmissions = $derived.by(() =>
		resolvedSubmissions.filter((submission) => matchesSearch(submission, search))
	);
	let visibleSubmissions = $derived.by(() =>
		activeTab === 'pending' ? visiblePendingSubmissions : visibleResolvedSubmissions
	);
	let selectedSubmission = $derived.by(
		() =>
			visibleSubmissions.find((submission) => submission.id === selectedId) ??
			visibleSubmissions[0] ??
			null
	);
	let selectedDrawingCounts = $derived.by(() =>
		selectedSubmission ? getDrawingCounts(selectedSubmission.drawings) : []
	);
	let selectedTextNotes = $derived.by(() =>
		selectedSubmission ? getTextNotes(selectedSubmission.drawings) : []
	);
	let hasActiveSearch = $derived(search.trim().length > 0);
	let pendingCount = $derived(pendingSubmissions.length);
	let resolvedCount = $derived(resolvedSubmissions.length);
	let totalCount = $derived(submissions.length);
	let visiblePendingCount = $derived(visiblePendingSubmissions.length);
	let visibleResolvedCount = $derived(visibleResolvedSubmissions.length);
	let visibleCount = $derived(visibleSubmissions.length);

	let promptText = $derived(
		selectedSubmission ? buildFeedbackDispatchPrompt(selectedSubmission) : buildFeedbackBulkPrompt()
	);

	onMount(() => {
		void loadSubmissions('initial');
		void loadDispatchTargets();
		const intervalId = window.setInterval(() => void loadSubmissions('refresh'), 10_000);

		return () => {
			window.clearInterval(intervalId);
			clearTimeout(launchFeedbackTimer);
			clearTimeout(promptCopyTimer);
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

		<div class="workspace">
			<div class="queue-panel">
				<Card.Root variant="elevated" size="sm">
					<Card.Content>
						<div class="panel-stack">
							<Field.Root>
								<Label>Search submissions</Label>
								<Input bind:value={search} placeholder="URL, submission id, or note text" />
							</Field.Root>

							{#snippet submissionRow(submission: Submission)}
								<div
									class="submission-row-shell"
									data-selected={selectedSubmission?.id === submission.id || undefined}
								>
									<Button
										variant="toggle"
										size="sm"
										aria-pressed={selectedSubmission?.id === submission.id}
										onclick={() => (selectedId = submission.id)}
										title={submission.url}
									>
										<div class="submission-row">
											<div class="submission-row-primary">
												<span class="submission-row-url">{submission.url}</span>
												<Badge variant="soft" color={statusColor(submission.status)} size="sm">
													{statusLabel(submission.status)}
												</Badge>
											</div>
											<div class="submission-row-meta">
												<div class="submission-badges">
													<Badge variant="outline" color="gray" size="sm">
														{submission.drawings.length} marks
													</Badge>
													<Badge variant="outline" color="gray" size="sm">
														{formatViewport(submission.viewport)}
													</Badge>
												</div>
												<span class="submission-row-trailing">
													{formatRelativeTime(submission.createdAt)} / #
													{shortenId(submission.id)}
												</span>
											</div>
										</div>
									</Button>
								</div>
							{/snippet}

							<Tabs.Root bind:value={activeTab}>
								<Tabs.List>
									<Tabs.Trigger value="pending">
										<span class="tab-trigger">
											<span>Queue</span>
											<Badge variant="outline" color="gray" size="sm">
												{hasActiveSearch ? `${visiblePendingCount}/${pendingCount}` : pendingCount}
											</Badge>
										</span>
									</Tabs.Trigger>
									<Tabs.Trigger value="resolved">
										<span class="tab-trigger">
											<span>History</span>
											<Badge variant="outline" color="gray" size="sm">
												{hasActiveSearch
													? `${visibleResolvedCount}/${resolvedCount}`
													: resolvedCount}
											</Badge>
										</span>
									</Tabs.Trigger>
								</Tabs.List>

								<Tabs.Content value="pending">
									{#if loading && pendingCount === 0}
										<Alert variant="info">Loading queued submissions...</Alert>
									{:else if visiblePendingSubmissions.length === 0}
										<Alert variant="info">No pending submissions match the current filter.</Alert>
									{:else}
										<div class="submission-list">
											{#each visiblePendingSubmissions as submission (submission.id)}
												{@render submissionRow(submission)}
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
										<div class="submission-list">
											{#each visibleResolvedSubmissions as submission (submission.id)}
												{@render submissionRow(submission)}
											{/each}
										</div>
									{/if}
								</Tabs.Content>
							</Tabs.Root>
						</div>
					</Card.Content>

					<Card.Footer>
						<Text as="span" size="sm" color="secondary">
							{activeTab === 'pending'
								? hasActiveSearch
									? `${visiblePendingCount} of ${pendingCount} queue items visible`
									: `${pendingCount} queue items`
								: hasActiveSearch
									? `${visibleResolvedCount} of ${resolvedCount} history items visible`
									: `${resolvedCount} history items`} / auto-refresh every 10 seconds
						</Text>
					</Card.Footer>
				</Card.Root>
			</div>

			<Card.Root variant="elevated" size="sm">
				{#if selectedSubmission}
					<Card.Header>
						<div class="detail-header">
							<div class="detail-header-info">
								<div class="detail-header-top">
									<Badge variant="soft" color={statusColor(selectedSubmission.status)} size="sm">
										{statusLabel(selectedSubmission.status)}
									</Badge>
									<a
										class="detail-url"
										href={selectedSubmission.url}
										target="_blank"
										rel="noreferrer"
										title={selectedSubmission.url}
									>
										{selectedSubmission.url}
									</a>
								</div>
								<div class="detail-header-meta">
									<span class="detail-header-id">#{shortenId(selectedSubmission.id)}</span>
									<span class="detail-header-dot" aria-hidden="true">·</span>
									<span>{formatAbsoluteTime(selectedSubmission.createdAt)}</span>
									<span class="detail-header-dot" aria-hidden="true">·</span>
									<span>{formatViewport(selectedSubmission.viewport)}</span>
								</div>
							</div>
							<div class="detail-actions">
								<Button
									href={selectedSubmission.url}
									target="_blank"
									rel="noreferrer"
									variant="ghost"
									size="sm"
								>
									<ExternalLink size={14} aria-hidden="true" />
									Open page
								</Button>

								{#if selectedSubmission.status === 'pending'}
									<Button
										variant="solid"
										size="sm"
										onclick={() => void setSubmissionStatus(selectedSubmission.id, 'resolved')}
										disabled={refreshing}
									>
										<Check size={14} aria-hidden="true" />
										Mark resolved
									</Button>
								{:else}
									<Button
										variant="outline"
										size="sm"
										onclick={() => void setSubmissionStatus(selectedSubmission.id, 'pending')}
										disabled={refreshing}
									>
										Reopen
									</Button>
								{/if}
							</div>
						</div>
					</Card.Header>
				{/if}

				<Card.Content>
					{#if selectedSubmission}
						<div class="detail-stack">
							<div class="detail-top">
								<div class="detail-media">
									<div class="screenshot-trigger">
										<Dialog.Root>
											<Dialog.Trigger>
												<Button
													variant="bare"
													aria-label={`Open full screenshot for ${selectedSubmission.url}`}
												>
													<Image
														class="feedback-screenshot-thumb"
														src={screenshotUrl(selectedSubmission.id)}
														alt={`Feedback screenshot for ${selectedSubmission.url}`}
														fallback="Screenshot unavailable"
													/>
												</Button>
											</Dialog.Trigger>

											<Dialog.Content class="feedback-screenshot-dialog">
												<Dialog.Header>
													<div class="screenshot-dialog-header">
														<div class="screenshot-dialog-heading">
															<Heading level={3}>Captured screenshot</Heading>
															<Text as="span" size="sm" color="secondary">
																{formatAbsoluteTime(selectedSubmission.createdAt)} / {formatViewport(
																	selectedSubmission.viewport
																)}
															</Text>
														</div>
														<Dialog.Close aria-label="Close screenshot dialog">
															<span aria-hidden="true">&times;</span>
														</Dialog.Close>
													</div>
												</Dialog.Header>
												<Dialog.Body class="screenshot-dialog-body">
													<div class="screenshot-dialog-image">
														<Image
															class="feedback-screenshot-full"
															src={screenshotUrl(selectedSubmission.id)}
															alt={`Feedback screenshot for ${selectedSubmission.url}`}
															fallback="Screenshot unavailable"
														/>
													</div>
												</Dialog.Body>
												<Dialog.Footer>
													<Dialog.Close>Close</Dialog.Close>
													<Button
														href={selectedSubmission.url}
														target="_blank"
														rel="noreferrer"
														variant="ghost"
													>
														Open page
													</Button>
												</Dialog.Footer>
											</Dialog.Content>
										</Dialog.Root>
									</div>

									<section class="notes-section">
										<header class="notes-head">
											<Heading level={4}>Notes</Heading>
											{#if selectedDrawingCounts.length > 0}
												<div class="annotation-pills">
													{#each selectedDrawingCounts as entry (entry.label)}
														<Badge variant="outline" color="gray" size="sm">
															{entry.label}: {entry.count}
														</Badge>
													{/each}
												</div>
											{/if}
										</header>

										{#if selectedTextNotes.length > 0}
											<div class="notes-stack">
												{#each selectedTextNotes as note, index (`${selectedSubmission.id}-${index}`)}
													<div class="note-card">
														<div class="note-card-head">
															<MessageSquare size={12} aria-hidden="true" />
															<Text as="span" size="xs" color="secondary">
																Note {index + 1}
															</Text>
														</div>
														<Text as="p" size="sm">{note}</Text>
													</div>
												{/each}
											</div>
										{:else if selectedDrawingCounts.length > 0}
											<Text as="p" size="sm" color="secondary">
												This submission only uses visual arrows or freehand marks.
											</Text>
										{:else}
											<Text as="p" size="sm" color="secondary">No annotations attached.</Text>
										{/if}
									</section>
								</div>

								<div class="prompt-section">
									<CodeBlock code={promptText} language="markdown" showCopyButton={false} />
									<div class="prompt-actions">
										{#if dispatchTargets.length > 0 && targetAgent}
											<div class="launch-group">
												<BorderBeam size="sm" colorVariant="colorful" borderRadius={8}>
													<Button
														variant="solid"
														size="sm"
														onclick={() => launchAgent(promptText)}
														disabled={launching}
														aria-label={launched
															? 'Agent launched'
															: `Launch ${AGENT_INFO[targetAgent].label}`}
													>
														{#if launched}
															<Check size={14} aria-hidden="true" />
															Launched
														{:else if launching}
															<Rocket size={14} aria-hidden="true" />
															Launching...
														{:else}
															<Rocket size={14} aria-hidden="true" />
															Launch {AGENT_INFO[targetAgent].shortLabel}
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
													<DropdownMenu.Content placement="top-end" offset={8}>
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
										{/if}
										<Button
											variant="soft"
											size="sm"
											onclick={() => copyPrompt(promptText)}
											aria-label={promptCopied ? 'Copied prompt' : 'Copy prompt'}
										>
											{#if promptCopied}
												<Check size={14} aria-hidden="true" />
												Copied
											{:else}
												<Copy size={14} aria-hidden="true" />
												Copy
											{/if}
										</Button>
									</div>
									{#if launchError}
										<Alert variant="error">{launchError}</Alert>
									{/if}
									<div class="prompt-caption">
										<CornerLeftUp size={14} aria-hidden="true" />
										<Text as="span" size="xs" color="secondary">
											{#if dispatchTargets.length > 0 && targetAgent}
												{selectedSubmission
													? 'Launch the agent with this prompt, or copy to paste elsewhere'
													: 'Launch to run through all pending submissions in order, or copy the prompt'}
											{:else}
												{selectedSubmission
													? 'Copy this prompt to work on the selected submission'
													: 'Copy this prompt to work on all pending submissions'}
											{/if}
										</Text>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<Alert variant="info">
							{loading
								? 'Loading submissions...'
								: 'No submission is selected. Try clearing the filter or switching tabs.'}
						</Alert>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
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

	.workspace {
		display: grid;
		gap: var(--dry-space-3);
	}

	.panel-stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.tab-trigger {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.submission-list {
		display: grid;
		gap: 0;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-xl);
		background: var(--dry-color-bg-raised, var(--dry-color-surface));
		overflow: hidden;
	}

	.submission-row-shell {
		display: grid;
		background: transparent;
		border-block-end: 1px solid var(--dry-color-stroke-weak);
		transition:
			background var(--dry-duration-fast, 120ms) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast, 120ms) var(--dry-ease-default);
		--dry-btn-align: stretch;
		--dry-btn-justify: start;
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-padding-x: var(--dry-space-3);
		--dry-btn-padding-y: var(--dry-space-2_5);
		--dry-btn-radius: 0;
		--dry-btn-color: var(--dry-color-text-strong);
	}

	.submission-row-shell:hover {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 6%, transparent);
	}

	.submission-row-shell:last-child {
		border-block-end: none;
	}

	.submission-row-shell[data-selected] {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent);
	}

	.submission-row {
		display: grid;
		gap: var(--dry-space-2);
		text-align: left;
	}

	.submission-row-primary {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--dry-space-2);
		align-items: start;
	}

	.submission-row-url {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--dry-font-size-sm, 0.875rem);
		font-weight: 600;
		line-height: 1.5;
		color: var(--dry-color-text-strong);
	}

	.submission-row-meta {
		display: grid;
		gap: var(--dry-space-1_5);
	}

	.submission-badges {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-1_5);
		justify-content: start;
		align-items: center;
	}

	.submission-row-trailing {
		display: block;
		font-size: var(--dry-font-size-sm, 0.875rem);
		line-height: 1.5;
		color: var(--dry-color-text-weak);
	}

	.detail-header {
		display: grid;
		gap: var(--dry-space-3);
		align-items: center;
	}

	.detail-header-info {
		display: grid;
		gap: var(--dry-space-1_5);
		min-inline-size: 0;
	}

	.detail-header-top {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--dry-space-2);
		align-items: center;
	}

	.detail-url {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--dry-font-size-sm, 0.875rem);
		font-weight: 500;
		color: var(--dry-color-text-strong);
		text-decoration: none;
	}

	.detail-url:hover {
		color: var(--dry-color-fill-brand);
		text-decoration: underline;
	}

	.detail-header-meta {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		align-items: center;
		font-size: var(--dry-font-size-xs, 0.75rem);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	.detail-header-id {
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, monospace);
	}

	.detail-header-dot {
		opacity: 0.5;
	}

	.detail-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		justify-content: start;
		align-items: center;
	}

	.detail-stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.detail-top {
		display: grid;
		gap: var(--dry-space-3);
		align-items: start;
	}

	.detail-media {
		display: grid;
		gap: var(--dry-space-3);
		align-content: start;
	}

	.screenshot-trigger {
		display: grid;
		justify-self: start;
		cursor: zoom-in;
	}

	.screenshot-dialog-heading {
		display: grid;
		gap: var(--dry-space-1);
	}

	.screenshot-dialog-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--dry-space-3);
		align-items: start;
	}

	.screenshot-dialog-image {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, min(64dvh, 44rem));
		place-items: center;
		padding: var(--dry-space-2);
		background: var(--dry-color-surface);
		overflow: hidden;
	}

	.notes-section {
		display: grid;
		gap: var(--dry-space-2);
	}

	.prompt-section {
		display: grid;
		gap: var(--dry-space-1_5);
		align-content: start;
	}

	.prompt-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		align-items: center;
		gap: var(--dry-space-2);
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

	.prompt-caption {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--dry-space-1_5);
		align-items: center;
		color: var(--dry-color-text-weak);
		padding-inline-start: var(--dry-space-2);
	}

	.notes-head {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: center;
	}

	.annotation-pills {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1_5);
		justify-content: start;
	}

	.notes-stack {
		display: grid;
		gap: var(--dry-space-1_5);
	}

	.note-card {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-2) var(--dry-space-2_5);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-surface);
	}

	.note-card-head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1_5);
		align-items: center;
		color: var(--dry-color-text-weak);
	}

	@container (min-width: 42rem) {
		.submission-row-meta {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			column-gap: var(--dry-space-3);
		}

		.detail-header {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.detail-top {
			grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
		}
	}

	@container (min-width: 64rem) {
		.workspace {
			grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
			align-items: start;
		}

		.queue-panel {
			position: sticky;
			inset-block-start: var(--dry-space-3);
		}
	}
</style>
