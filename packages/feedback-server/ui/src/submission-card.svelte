<script lang="ts">
	import {
		Alert,
		Badge,
		BorderBeam,
		Button,
		ButtonGroup,
		Card,
		ChipGroup,
		CodeBlock,
		Dialog,
		DropdownMenu,
		FormatDate,
		Heading,
		Image,
		Link,
		Text
	} from '@dryui/ui';
	import {
		Check,
		ChevronDown,
		Copy,
		CornerLeftUp,
		ExternalLink,
		MessageSquare,
		Rocket
	} from 'lucide-svelte';
	import { buildFeedbackDispatchPrompt, getTextNotes } from '../../src/prompts.js';
	import type { Submission, SubmissionStatus } from '../../src/types.js';
	import AgentIcon from './agent-icon.svelte';
	import { AGENT_INFO, type DispatchAgent } from './agent-meta.js';

	interface Props {
		submission: Submission;
		dispatchTargets: DispatchAgent[];
		targetAgent: DispatchAgent | null;
		refreshing: boolean;
		onChooseAgent: (agent: DispatchAgent) => void;
		onSetStatus: (id: string, status: SubmissionStatus) => void | Promise<void>;
		onLaunch: (prompt: string, submissionId: string) => Promise<void>;
	}

	interface DrawingCount {
		label: string;
		count: number;
	}

	let {
		submission,
		dispatchTargets,
		targetAgent,
		refreshing,
		onChooseAgent,
		onSetStatus,
		onLaunch
	}: Props = $props();

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let launching = $state(false);
	let launched = $state(false);
	let launchError = $state('');
	let launchTimer: ReturnType<typeof setTimeout> | undefined;

	let promptText = $derived(buildFeedbackDispatchPrompt(submission));
	let drawingCounts = $derived.by(() => getDrawingCounts(submission.drawings));
	let textNotes = $derived(getTextNotes(submission.drawings));

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

	function screenshotUrl(id: string): string {
		return `/submissions/${encodeURIComponent(id)}/screenshot`;
	}

	function shortenId(value: string): string {
		return value.slice(0, 8);
	}

	function statusColor(status: SubmissionStatus): 'green' | 'yellow' {
		return status === 'resolved' ? 'green' : 'yellow';
	}

	function statusLabel(status: SubmissionStatus): string {
		return status === 'resolved' ? 'Resolved' : 'Pending';
	}

	function formatViewport(viewport: Submission['viewport']): string {
		if (!viewport) return 'Unknown';
		return `${viewport.width} x ${viewport.height}`;
	}

	function copyPrompt(): void {
		navigator.clipboard.writeText(promptText).then(() => {
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}

	async function launch(): Promise<void> {
		if (!targetAgent || launching) return;
		launching = true;
		launched = false;
		launchError = '';
		try {
			await onLaunch(promptText, submission.id);
			launched = true;
			clearTimeout(launchTimer);
			launchTimer = setTimeout(() => {
				launched = false;
			}, 2500);
		} catch (errorValue) {
			launchError = errorValue instanceof Error ? errorValue.message : 'Unknown error';
		} finally {
			launching = false;
		}
	}
</script>

<article class="submission-card">
	<Card.Root variant="elevated" size="sm">
		<Card.Header>
			<div class="header">
				<div class="header-info">
					<div class="header-top">
						<Badge variant="soft" color={statusColor(submission.status)} size="sm">
							{statusLabel(submission.status)}
						</Badge>
						<span class="url">
							<Link href={submission.url} external underline="hover" title={submission.url}>
								{submission.url}
							</Link>
						</span>
					</div>
					<div class="header-meta">
						<span class="id">#{shortenId(submission.id)}</span>
						<span class="dot" aria-hidden="true">·</span>
						<FormatDate date={submission.createdAt} dateStyle="medium" timeStyle="short" />
						<span class="dot" aria-hidden="true">·</span>
						<span>{formatViewport(submission.viewport)}</span>
					</div>
				</div>
				<ButtonGroup size="sm">
					<Button href={submission.url} target="_blank" rel="noreferrer" variant="ghost" size="sm">
						<ExternalLink size={14} aria-hidden="true" />
						Open page
					</Button>

					{#if submission.status === 'pending'}
						<Button
							variant="solid"
							size="sm"
							onclick={() => void onSetStatus(submission.id, 'resolved')}
							disabled={refreshing}
						>
							<Check size={14} aria-hidden="true" />
							Mark resolved
						</Button>
					{:else}
						<Button
							variant="outline"
							size="sm"
							onclick={() => void onSetStatus(submission.id, 'pending')}
							disabled={refreshing}
						>
							Reopen
						</Button>
					{/if}
				</ButtonGroup>
			</div>
		</Card.Header>

		<Card.Content>
			<div class="body">
				<div class="media">
					<div class="screenshot-trigger feedback-screenshot-dialog">
						<Dialog.Root>
							<Dialog.Trigger>
								<Button variant="bare" aria-label={`Open full screenshot for ${submission.url}`}>
									<span class="feedback-screenshot-thumb">
										<Image
											src={screenshotUrl(submission.id)}
											alt={`Feedback screenshot for ${submission.url}`}
											fallback="Screenshot unavailable"
										/>
									</span>
								</Button>
							</Dialog.Trigger>

							<Dialog.Content>
								<Dialog.Header>
									<div class="dialog-head">
										<div class="dialog-head-info">
											<Heading level={3}>Captured screenshot</Heading>
											<Text as="span" size="sm" color="secondary">
												<FormatDate
													date={submission.createdAt}
													dateStyle="medium"
													timeStyle="short"
												/>
												/ {formatViewport(submission.viewport)}
											</Text>
										</div>
										<Dialog.Close aria-label="Close screenshot dialog">
											<span aria-hidden="true">&times;</span>
										</Dialog.Close>
									</div>
								</Dialog.Header>
								<Dialog.Body>
									<div class="dialog-image">
										<span class="feedback-screenshot-full">
											<Image
												src={screenshotUrl(submission.id)}
												alt={`Feedback screenshot for ${submission.url}`}
												fallback="Screenshot unavailable"
											/>
										</span>
									</div>
								</Dialog.Body>
								<Dialog.Footer>
									<Dialog.Close>Close</Dialog.Close>
									<Button href={submission.url} target="_blank" rel="noreferrer" variant="ghost">
										Open page
									</Button>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</div>

					<section class="notes">
						<header class="notes-head">
							<Heading level={4}>Notes</Heading>
							{#if drawingCounts.length > 0}
								<ChipGroup.Root gap="sm" aria-label="Annotation counts">
									<ChipGroup.Label hidden>Annotation counts</ChipGroup.Label>
									{#each drawingCounts as entry (entry.label)}
										<Badge variant="outline" color="gray" size="sm">
											{entry.label}: {entry.count}
										</Badge>
									{/each}
								</ChipGroup.Root>
							{/if}
						</header>

						{#if textNotes.length > 0}
							<div class="notes-stack">
								{#each textNotes as note, index (`${submission.id}-${index}`)}
									<div class="note-card">
										<div class="note-card-head">
											<MessageSquare size={12} aria-hidden="true" />
											<Text as="span" size="xs" color="secondary">Note {index + 1}</Text>
										</div>
										<Text as="p" size="sm">{note}</Text>
									</div>
								{/each}
							</div>
						{:else if drawingCounts.length > 0}
							<Text as="p" size="sm" color="secondary">
								This submission only uses visual arrows or freehand marks.
							</Text>
						{:else}
							<Text as="p" size="sm" color="secondary">No annotations attached.</Text>
						{/if}
					</section>
				</div>

				<div class="prompt">
					<CodeBlock code={promptText} language="text" showCopyButton={false} />
					<div class="prompt-actions">
						{#if dispatchTargets.length > 0 && targetAgent}
							<div class="launch-group">
								<BorderBeam size="sm" colorVariant="colorful" borderRadius={8}>
									<Button
										variant="solid"
										size="sm"
										onclick={launch}
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
												onclick={() => onChooseAgent(agent)}
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
							onclick={copyPrompt}
							aria-label={copied ? 'Copied prompt' : 'Copy prompt'}
						>
							{#if copied}
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
								Launch the agent with this prompt, or copy to paste elsewhere
							{:else}
								Copy this prompt to work on this submission
							{/if}
						</Text>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</article>

<style>
	.submission-card {
		container: feedback-submission / inline-size;
		display: grid;
	}

	.header {
		display: grid;
		gap: var(--dry-space-3);
		align-items: center;
	}

	.header-info {
		display: grid;
		gap: var(--dry-space-1_5);
	}

	.header-top {
		display: grid;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.url {
		--dry-link-color: var(--dry-color-text-strong);
		--dry-link-hover-color: var(--dry-color-fill-brand);

		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--dry-font-size-sm, 0.875rem);
		font-weight: 500;
	}

	.url:hover {
		--dry-link-color: var(--dry-color-fill-brand);
	}

	.header-meta {
		display: grid;
		gap: var(--dry-space-1);
		align-items: start;
		font-size: var(--dry-font-size-xs, 0.75rem);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	.id {
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, monospace);
	}

	.dot {
		display: none;
		opacity: 0.5;
	}

	.body {
		display: grid;
		gap: var(--dry-space-3);
		align-items: start;
	}

	.media {
		display: grid;
		gap: var(--dry-space-3);
		align-content: start;
	}

	.screenshot-trigger {
		display: grid;
		justify-self: start;
		cursor: zoom-in;
	}

	.dialog-head-info {
		display: grid;
		gap: var(--dry-space-1);
	}

	.dialog-head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--dry-space-3);
		align-items: start;
	}

	.dialog-image {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, min(64dvh, 44rem));
		place-items: center;
		padding: var(--dry-space-2);
		background: var(--dry-color-bg-overlay);
		overflow: hidden;
	}

	.notes {
		display: grid;
		gap: var(--dry-space-2);
	}

	.prompt {
		display: grid;
		gap: var(--dry-space-1_5);
		align-content: start;
	}

	.prompt-actions {
		display: grid;
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
		gap: var(--dry-space-3);
		align-items: start;
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
		background: var(--dry-color-bg-raised);
	}

	.note-card-head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1_5);
		align-items: center;
		color: var(--dry-color-text-weak);
	}

	@container feedback-submission (min-width: 30rem) {
		.header-top {
			grid-template-columns: auto minmax(0, 1fr);
		}

		.header-meta {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
			gap: var(--dry-space-2);
			align-items: center;
		}

		.dot {
			display: inline;
		}

		.prompt-actions {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
		}

		.notes-head {
			grid-template-columns: auto minmax(0, 1fr);
			align-items: center;
		}
	}

	@container feedback-submission (min-width: 42rem) {
		.header {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.body {
			grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
		}
	}
</style>
