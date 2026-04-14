<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Alert,
		Badge,
		Button,
		Card,
		Container,
		DescriptionList,
		Field,
		Heading,
		Image,
		Input,
		Label,
		Tabs,
		Text
	} from '@dryui/ui';
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
	let error = $state('');
	let lastLoadedAt = $state<string | null>(null);
	let loading = $state(true);
	let refreshing = $state(false);
	let search = $state('');
	let selectedId = $state<string | null>(null);
	let submissions = $state<Submission[]>([]);

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

	onMount(() => {
		void loadSubmissions('initial');
		const intervalId = window.setInterval(() => void loadSubmissions('refresh'), 10_000);

		return () => window.clearInterval(intervalId);
	});
</script>

<Container size="full" padding={false}>
	<section class="dashboard">
		<header class="hero">
			<div class="hero-copy">
				<Badge variant="soft" color="blue" size="sm">Feedback Console</Badge>
				<Heading level={1}>Queue and history for feedback submissions</Heading>
				<Text as="p" color="secondary">
					Review queued screenshots, inspect annotations, and reopen resolved items when a fix needs
					another pass.
				</Text>
			</div>

			<div class="hero-actions">
				<Button
					variant="outline"
					onclick={() => void loadSubmissions('refresh')}
					disabled={refreshing}
				>
					{refreshing ? 'Refreshing...' : 'Refresh queue'}
				</Button>
			</div>
		</header>

		<div class="stats">
			<Card.Root>
				<Card.Header>
					<Text as="span" size="sm" color="secondary">Pending queue</Text>
				</Card.Header>
				<Card.Content>
					<Heading level={2}>{pendingCount}</Heading>
				</Card.Content>
				<Card.Footer>
					<Text as="span" size="sm" color="secondary">Oldest items stay at the top.</Text>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Text as="span" size="sm" color="secondary">Resolved history</Text>
				</Card.Header>
				<Card.Content>
					<Heading level={2}>{resolvedCount}</Heading>
				</Card.Content>
				<Card.Footer>
					<Text as="span" size="sm" color="secondary"
						>Newest resolved items are easiest to revisit.</Text
					>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Text as="span" size="sm" color="secondary">Total submissions</Text>
				</Card.Header>
				<Card.Content>
					<Heading level={2}>{totalCount}</Heading>
				</Card.Content>
				<Card.Footer>
					<Text as="span" size="sm" color="secondary">
						Last refreshed {lastLoadedAt ? formatAbsoluteTime(lastLoadedAt) : 'Never'}
					</Text>
				</Card.Footer>
			</Card.Root>
		</div>

		{#if error}
			<Alert variant="error">{error}</Alert>
		{/if}

		<div class="workspace">
			<div class="queue-panel">
				<Card.Root variant="elevated">
					<Card.Header>
						<div class="panel-heading">
							<div class="panel-copy">
								<Heading level={2}>Submission browser</Heading>
								<Text as="p" size="sm" color="secondary">
									Search by URL or submission id, then switch between queue and history.
								</Text>
							</div>
						</div>
					</Card.Header>

					<Card.Content>
						<div class="panel-stack">
							<Field.Root>
								<Label>Search submissions</Label>
								<Input bind:value={search} placeholder="URL, submission id, or note text" />
							</Field.Root>

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
									<div class="submission-list">
										{#if loading && pendingCount === 0}
											<Alert variant="info">Loading queued submissions...</Alert>
										{:else if visiblePendingSubmissions.length === 0}
											<Alert variant="info">No pending submissions match the current filter.</Alert>
										{:else}
											{#each visiblePendingSubmissions as submission (submission.id)}
												<div class="submission-card">
													<Card.Root
														as="button"
														variant="interactive"
														selected={selectedSubmission?.id === submission.id}
														onclick={() => (selectedId = submission.id)}
													>
														<Card.Header>
															<div class="submission-heading">
																<Text as="span" size="sm" weight="semibold">{submission.url}</Text>
																<Badge
																	variant="soft"
																	color={statusColor(submission.status)}
																	size="sm"
																>
																	{statusLabel(submission.status)}
																</Badge>
															</div>
														</Card.Header>
														<Card.Content>
															<div class="submission-badges">
																<Badge variant="outline" color="gray" size="sm">
																	{submission.drawings.length} marks
																</Badge>
																<Badge variant="outline" color="gray" size="sm">
																	{formatViewport(submission.viewport)}
																</Badge>
															</div>
														</Card.Content>
														<Card.Footer>
															<Text as="span" size="sm" color="secondary">
																{formatRelativeTime(submission.createdAt)} / #{shortenId(
																	submission.id
																)}
															</Text>
														</Card.Footer>
													</Card.Root>
												</div>
											{/each}
										{/if}
									</div>
								</Tabs.Content>

								<Tabs.Content value="resolved">
									<div class="submission-list">
										{#if loading && resolvedCount === 0}
											<Alert variant="info">Loading resolved history...</Alert>
										{:else if visibleResolvedSubmissions.length === 0}
											<Alert variant="info">No resolved submissions match the current filter.</Alert
											>
										{:else}
											{#each visibleResolvedSubmissions as submission (submission.id)}
												<div class="submission-card">
													<Card.Root
														as="button"
														variant="interactive"
														selected={selectedSubmission?.id === submission.id}
														onclick={() => (selectedId = submission.id)}
													>
														<Card.Header>
															<div class="submission-heading">
																<Text as="span" size="sm" weight="semibold">{submission.url}</Text>
																<Badge
																	variant="soft"
																	color={statusColor(submission.status)}
																	size="sm"
																>
																	{statusLabel(submission.status)}
																</Badge>
															</div>
														</Card.Header>
														<Card.Content>
															<div class="submission-badges">
																<Badge variant="outline" color="gray" size="sm">
																	{submission.drawings.length} marks
																</Badge>
																<Badge variant="outline" color="gray" size="sm">
																	Resolved item
																</Badge>
															</div>
														</Card.Content>
														<Card.Footer>
															<Text as="span" size="sm" color="secondary">
																{formatRelativeTime(submission.createdAt)} / #{shortenId(
																	submission.id
																)}
															</Text>
														</Card.Footer>
													</Card.Root>
												</div>
											{/each}
										{/if}
									</div>
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
				<Card.Header>
					<div class="panel-heading">
						<div class="panel-copy">
							<Heading level={2}>Submission detail</Heading>
							<Text as="p" size="sm" color="secondary">
								Inspect the screenshot, notes, and metadata for the selected submission.
							</Text>
						</div>

						{#if selectedSubmission}
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
						{/if}
					</div>
				</Card.Header>

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
									<div class="screenshot-image">
										<Image
											src={screenshotUrl(selectedSubmission.id)}
											alt={`Feedback screenshot for ${selectedSubmission.url}`}
											fallback="Screenshot unavailable"
										/>
									</div>
								</Card.Content>
								<Card.Footer>
									<Text as="span" size="sm" color="secondary">
										{formatAbsoluteTime(selectedSubmission.createdAt)} / {formatViewport(
											selectedSubmission.viewport
										)}
									</Text>
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

	.hero {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) 0;
	}

	.hero-copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.hero-actions {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
		justify-content: start;
	}

	.stats {
		display: grid;
		gap: var(--dry-space-3);
	}

	.workspace {
		display: grid;
		gap: var(--dry-space-4);
	}

	.panel-heading {
		display: grid;
		gap: var(--dry-space-3);
	}

	.panel-copy {
		display: grid;
		gap: var(--dry-space-1);
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
		gap: var(--dry-space-3);
		padding-block-start: var(--dry-space-3);
	}

	.submission-card {
		display: grid;
		text-align: left;
	}

	.submission-heading {
		display: grid;
		gap: var(--dry-space-2);
	}

	.submission-badges {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
		justify-content: start;
		align-items: center;
	}

	.detail-actions {
		display: grid;
		gap: var(--dry-space-2);
	}

	.detail-stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.screenshot-image {
		--dry-image-bg: var(--dry-color-surface);
		--dry-image-object-fit: contain;
		--dry-image-radius: 0;

		display: block;
		aspect-ratio: 16 / 10;
		background: var(--dry-color-surface);
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
		.stats {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.submission-heading {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}
	}

	@container (min-width: 64rem) {
		.hero {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}

		.workspace {
			grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
			align-items: start;
		}

		.queue-panel {
			position: sticky;
			inset-block-start: var(--dry-space-4);
		}

		.panel-heading {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: start;
		}

		.detail-actions {
			grid-auto-flow: column;
			justify-content: start;
		}

		.detail-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
