<script lang="ts">
	import { onMount } from 'svelte';
	import { PageHeader } from '@dryui/primitives';
	import {
		Alert,
		Badge,
		Button,
		Card,
		Container,
		DescriptionList,
		Dialog,
		Field,
		Heading,
		Image,
		Input,
		Label,
		Tabs,
		Text
	} from '@dryui/ui';
	import { normalizeDevUrl } from '../../src/dev-url.js';
	import type { Submission, SubmissionStatus } from '../../src/types.js';

	interface SubmissionResponse {
		count: number;
		submissions: Submission[];
	}

	interface DrawingCount {
		label: string;
		count: number;
	}

	let activeTab = $state<SubmissionStatus>('pending');
	let copyState = $state<'idle' | 'copied' | 'error'>('idle');
	let error = $state('');
	let lastLoadedAt = $state<string | null>(null);
	let loading = $state(true);
	let refreshing = $state(false);
	let search = $state('');
	let selectedId = $state<string | null>(null);
	let submissions = $state<Submission[]>([]);

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

	function getTextNotes(drawings: unknown[]): string[] {
		return drawings.flatMap((drawing) => {
			if (typeof drawing !== 'object' || drawing === null) return [];

			const kind = Reflect.get(drawing, 'kind');
			const text = Reflect.get(drawing, 'text');

			return kind === 'text' && typeof text === 'string' ? [text] : [];
		});
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

	let promptText = $derived.by(() => {
		if (selectedSubmission) {
			const notes =
				selectedTextNotes.length > 0
					? `\n\nText notes from the annotation:\n${selectedTextNotes.map((note) => `- ${note}`).join('\n')}`
					: '';
			return `Work on DryUI feedback submission ${selectedSubmission.id} from ${selectedSubmission.url}.

Use the dryui-feedback MCP server:
1. Call feedback_get_submissions to fetch the latest submission details
2. Read the screenshot at screenshotPath to see what the user annotated
3. Review the drawings (arrows, freehand marks, text notes) to understand the requested changes
4. Apply the fixes following DryUI conventions (CSS grid layout, --dry-* tokens, component usage)
5. Call feedback_resolve_submission with id "${selectedSubmission.id}" once resolved${notes}`;
		}
		return `Work on pending DryUI feedback submissions.

Use the dryui-feedback MCP server:
1. Call feedback_get_submissions to list pending submissions
2. For each submission, read the screenshot at screenshotPath
3. Review the drawings (arrows, freehand marks, text notes) to understand the requested changes
4. Apply the fixes following DryUI conventions (CSS grid layout, --dry-* tokens, component usage)
5. Call feedback_resolve_submission with the submission id after each fix is complete`;
	});

	async function copyPromptToClipboard(): Promise<void> {
		try {
			await navigator.clipboard.writeText(promptText);
			copyState = 'copied';
		} catch {
			copyState = 'error';
		}
		window.setTimeout(() => (copyState = 'idle'), 2000);
	}

	onMount(() => {
		void loadSubmissions('initial');
		const intervalId = window.setInterval(() => void loadSubmissions('refresh'), 10_000);

		return () => window.clearInterval(intervalId);
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
					<Heading level={2}>Feedback</Heading>
				</a>
			</PageHeader.Content>
			<PageHeader.Actions>
				<nav class="hero-nav" aria-label="DryUI resources">
					<Button href="https://dryui.dev" target="_blank" rel="noreferrer" variant="ghost">
						Docs
					</Button>
					<Button
						href="https://dryui.dev/theme-wizard"
						target="_blank"
						rel="noreferrer"
						variant="ghost"
					>
						Theme Wizard
					</Button>
				</nav>
				<span class="hero-status">
					<Text as="span" size="sm" color="secondary">
						{lastLoadedAt ? `Updated ${formatRelativeTime(lastLoadedAt)}` : 'Not refreshed yet'}
					</Text>
				</span>
				{#if devUrl}
					<Button href={devUrl} target="_blank" rel="noreferrer" variant="solid">
						Open dev app
					</Button>
				{/if}
				<Button
					variant="outline"
					onclick={() => void loadSubmissions('refresh')}
					disabled={refreshing}
				>
					{refreshing ? 'Refreshing...' : 'Refresh'}
				</Button>
			</PageHeader.Actions>
		</PageHeader.Root>

		{#if error}
			<Alert variant="error">{error}</Alert>
		{/if}

		<Card.Root variant="elevated">
			<Card.Header>
				<div class="prompt-header">
					<div class="prompt-heading">
						<Heading level={3}>LLM prompt</Heading>
						<Text as="span" size="sm" color="secondary">
							{selectedSubmission
								? 'Copy this prompt to work on the selected submission'
								: 'Copy this prompt to work on all pending submissions'}
						</Text>
					</div>
					<div class="prompt-copy">
						<Button
							variant="solid"
							onclick={() => void copyPromptToClipboard()}
							disabled={copyState !== 'idle'}
						>
							{copyState === 'copied'
								? 'Copied!'
								: copyState === 'error'
									? 'Copy failed'
									: 'Copy prompt'}
						</Button>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<pre class="prompt-body">{promptText}</pre>
			</Card.Content>
		</Card.Root>

		<div class="workspace">
			<div class="queue-panel">
				<Card.Root variant="elevated">
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

			<Card.Root variant="elevated">
				{#if selectedSubmission}
					<Card.Header>
						<div class="detail-actions">
							<Button
								href={selectedSubmission.url}
								target="_blank"
								rel="noreferrer"
								variant="ghost"
							>
								Open page
							</Button>

							{#if selectedSubmission.status === 'pending'}
								<Button
									variant="solid"
									onclick={() => void setSubmissionStatus(selectedSubmission.id, 'resolved')}
									disabled={refreshing}
								>
									Mark resolved
								</Button>
							{:else}
								<Button
									variant="outline"
									onclick={() => void setSubmissionStatus(selectedSubmission.id, 'pending')}
									disabled={refreshing}
								>
									Move back to queue
								</Button>
							{/if}
						</div>
					</Card.Header>
				{/if}

				<Card.Content>
					{#if selectedSubmission}
						<div class="detail-stack">
							<Card.Root class="screenshot-card">
								<Card.Header>
									<div class="submission-heading">
										<Text as="span" size="sm" weight="semibold">Captured screenshot</Text>
										<Badge variant="soft" color={statusColor(selectedSubmission.status)} size="sm">
											{statusLabel(selectedSubmission.status)}
										</Badge>
									</div>
								</Card.Header>
								<Card.Content noPadding={true}>
									<Dialog.Root>
										<Dialog.Trigger>
											<Button
												variant="bare"
												aria-label={`Open full screenshot for ${selectedSubmission.url}`}
											>
												<div class="screenshot-thumbnail">
													<Image
														class="feedback-screenshot-thumb"
														src={screenshotUrl(selectedSubmission.id)}
														alt={`Feedback screenshot for ${selectedSubmission.url}`}
														fallback="Screenshot unavailable"
													/>
												</div>
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
								</Card.Content>
								<Card.Footer>
									<div class="screenshot-meta">
										<Text as="span" size="sm" color="secondary">
											Click the thumbnail to open the full capture
										</Text>
										<Text as="span" size="sm" color="secondary">
											{formatAbsoluteTime(selectedSubmission.createdAt)} / {formatViewport(
												selectedSubmission.viewport
											)}
										</Text>
									</div>
								</Card.Footer>
							</Card.Root>

							<div class="detail-grid">
								<Card.Root>
									<Card.Header>
										<Heading level={3}>Metadata</Heading>
									</Card.Header>
									<Card.Content>
										<DescriptionList.Root>
											<DescriptionList.Item>
												<DescriptionList.Term>Submission id</DescriptionList.Term>
												<DescriptionList.Description>
													<Text as="span" size="sm">{selectedSubmission.id}</Text>
												</DescriptionList.Description>
											</DescriptionList.Item>
											<DescriptionList.Item>
												<DescriptionList.Term>Status</DescriptionList.Term>
												<DescriptionList.Description>
													<Badge
														variant="soft"
														color={statusColor(selectedSubmission.status)}
														size="sm"
													>
														{statusLabel(selectedSubmission.status)}
													</Badge>
												</DescriptionList.Description>
											</DescriptionList.Item>
											<DescriptionList.Item>
												<DescriptionList.Term>Created</DescriptionList.Term>
												<DescriptionList.Description>
													<Text as="span" size="sm">
														{formatAbsoluteTime(selectedSubmission.createdAt)}
													</Text>
												</DescriptionList.Description>
											</DescriptionList.Item>
											<DescriptionList.Item>
												<DescriptionList.Term>Viewport</DescriptionList.Term>
												<DescriptionList.Description>
													<Text as="span" size="sm">
														{formatViewport(selectedSubmission.viewport)}
													</Text>
												</DescriptionList.Description>
											</DescriptionList.Item>
											<DescriptionList.Item>
												<DescriptionList.Term>Screenshot file</DescriptionList.Term>
												<DescriptionList.Description>
													<Text as="span" size="sm">{selectedSubmission.screenshotPath}</Text>
												</DescriptionList.Description>
											</DescriptionList.Item>
										</DescriptionList.Root>
									</Card.Content>
									<Card.Footer>
										<Text as="span" size="sm" color="secondary">
											Original page: {selectedSubmission.url}
										</Text>
									</Card.Footer>
								</Card.Root>

								<Card.Root>
									<Card.Header>
										<Heading level={3}>Annotation summary</Heading>
									</Card.Header>
									<Card.Content>
										<div class="summary-stack">
											<div class="submission-badges">
												{#if selectedDrawingCounts.length > 0}
													{#each selectedDrawingCounts as entry (entry.label)}
														<Badge variant="outline" color="gray" size="sm">
															{entry.label}: {entry.count}
														</Badge>
													{/each}
												{:else}
													<Alert variant="info"
														>No drawing data was attached to this submission.</Alert
													>
												{/if}
											</div>

											<div class="notes-stack">
												<Heading level={4}>Text notes</Heading>
												{#if selectedTextNotes.length > 0}
													{#each selectedTextNotes as note, index (`${selectedSubmission.id}-${index}`)}
														<div class="note-card">
															<Badge variant="outline" color="gray" size="sm">
																Note {index + 1}
															</Badge>
															<Text as="p">{note}</Text>
														</div>
													{/each}
												{:else}
													<Text as="p" size="sm" color="secondary">
														This submission only uses visual arrows or freehand marks.
													</Text>
												{/if}
											</div>
										</div>
									</Card.Content>
									<Card.Footer>
										<Text as="span" size="sm" color="secondary">
											{selectedSubmission.drawings.length} total marks captured with the screenshot
										</Text>
									</Card.Footer>
								</Card.Root>
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

				<Card.Footer>
					<Text as="span" size="sm" color="secondary">
						{selectedSubmission
							? `${formatRelativeTime(selectedSubmission.createdAt)} / ${selectedSubmission.url}`
							: 'Select a queue item to inspect its screenshot and notes.'}
					</Text>
				</Card.Footer>
			</Card.Root>
		</div>
	</section>
</Container>

<style>
	.dashboard {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
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
		font-size: 1.35rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--dry-color-text-strong);
	}

	.wordmark-badge {
		border: 2px solid currentColor;
		padding: 0.1em 0.35em;
		border-radius: 0.3em;
		font-size: 0.75em;
		font-weight: 800;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.brand-divider {
		display: block;
		height: 1.5rem;
		border-left: 1px solid var(--dry-color-stroke-weak);
	}

	.hero-nav {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-1);
		align-items: center;
	}

	.prompt-header {
		display: grid;
		gap: var(--dry-space-3);
		align-items: start;
	}

	.prompt-heading {
		display: grid;
		gap: var(--dry-space-1);
	}

	.prompt-copy {
		display: grid;
		justify-content: start;
	}

	.prompt-body {
		display: block;
		margin: 0;
		padding: var(--dry-space-3);
		font-family: var(--dry-font-mono, ui-monospace, monospace);
		font-size: var(--dry-font-size-sm, 0.875rem);
		line-height: 1.6;
		color: var(--dry-color-text-strong);
		background: var(--dry-color-bg-raised, var(--dry-color-surface));
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		white-space: pre-wrap;
		word-break: break-word;
		overflow-x: auto;
	}

	.workspace {
		display: grid;
		gap: var(--dry-space-4);
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

	.submission-heading {
		display: grid;
		gap: var(--dry-space-2);
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
		box-shadow: inset 2px 0 0 var(--dry-color-fill-brand);
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
		gap: var(--dry-space-4);
	}

	.screenshot-thumbnail {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: 14rem;
		place-items: center;
		padding: var(--dry-space-3);
		overflow: hidden;
		background: var(--dry-color-surface);
	}

	.screenshot-meta {
		display: grid;
		gap: var(--dry-space-1);
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

	.detail-grid {
		display: grid;
		gap: var(--dry-space-4);
	}

	.summary-stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.notes-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	.note-card {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-surface);
	}

	@container (min-width: 42rem) {
		.submission-heading {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}

		.submission-row-meta {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			column-gap: var(--dry-space-3);
		}

		.prompt-header {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}
	}

	@container (min-width: 64rem) {
		.workspace {
			grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
			align-items: start;
		}

		.queue-panel {
			position: sticky;
			inset-block-start: var(--dry-space-4);
		}

		.detail-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
