<script lang="ts">
	import {
		Alert,
		AlertDialog,
		Badge,
		BorderBeam,
		Button,
		ChipGroup,
		CodeBlock,
		Dialog,
		DropdownMenu,
		FormatDate,
		Heading,
		Image,
		Link,
		Text,
		VisuallyHidden
	} from '@dryui/ui';
	import {
		Check,
		ChevronDown,
		Clock,
		Copy,
		CornerLeftUp,
		ExternalLink,
		Loader2,
		MessageSquare,
		RotateCcw,
		Rocket,
		Timer,
		Trash2,
		Undo2
	} from 'lucide-svelte';
	import { buildFeedbackDispatchPrompt } from '../../src/prompts.js';
	import type { SubmissionPresentation } from '../../src/submission-presentation.js';
	import type { SubmissionStatus } from '../../src/types.js';
	import AgentIcon from './agent-icon.svelte';
	import { AGENT_INFO, type DispatchAgent } from './agent-meta.js';

	interface Props {
		submission: SubmissionPresentation;
		dispatchTargets: DispatchAgent[];
		targetAgent: DispatchAgent | null;
		refreshing: boolean;
		/**
		 * Target-specific canonical SKILL.md path supplied by `/dispatch-targets`.
		 * Falls back to the prompt's relative skill reference when unresolved.
		 */
		skillPath?: string | null;
		onChooseAgent: (agent: DispatchAgent) => void;
		onSetStatus: (id: string, status: SubmissionStatus) => void | Promise<void>;
		onDelete: (id: string) => void | Promise<void>;
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
		skillPath = null,
		onChooseAgent,
		onSetStatus,
		onDelete,
		onLaunch
	}: Props = $props();

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let launching = $state(false);
	let launched = $state(false);
	let launchError = $state('');
	let launchTimer: ReturnType<typeof setTimeout> | undefined;
	let deleting = $state(false);
	let deleteError = $state('');

	let promptText = $derived(
		buildFeedbackDispatchPrompt(submission, skillPath ? { skillPath } : undefined)
	);
	let drawingCounts = $derived.by(() => getDrawingCounts(submission.summary));
	let textNotes = $derived(submission.textNotes);

	function getDrawingCounts(summary: SubmissionPresentation['summary']): DrawingCount[] {
		return Object.entries(summary.drawingKinds).map(([kind, count]) => ({
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

	function statusColor(status: SubmissionStatus): 'gray' | 'blue' | 'success' {
		if (status === 'processing') return 'blue';
		if (status === 'resolved') return 'success';
		return 'gray';
	}

	function statusLabel(status: SubmissionStatus): string {
		if (status === 'processing') return 'Processing';
		if (status === 'resolved') return 'Resolved';
		return 'Pending';
	}

	function formatDurationMs(value: number | undefined): string | null {
		if (value === undefined || !Number.isFinite(value) || value < 0) return null;
		if (value < 1_000) return `${value} ms`;
		const seconds = value / 1_000;
		if (seconds < 60) return `${seconds.toFixed(seconds >= 10 ? 0 : 1)}s`;
		const minutes = Math.floor(seconds / 60);
		const remainder = Math.round(seconds - minutes * 60);
		if (minutes < 60) return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const minutesRemainder = minutes - hours * 60;
		return minutesRemainder > 0 ? `${hours}h ${minutesRemainder}m` : `${hours}h`;
	}

	function workerHeadline(worker: SubmissionPresentation['worker']): string {
		if (!worker) return 'Unknown agent';
		if (worker.name) return worker.name;
		return AGENT_INFO[worker.agent as DispatchAgent]?.label ?? worker.agent;
	}

	function formatViewport(viewport: SubmissionPresentation['viewport']): string {
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

	async function deleteSubmission(): Promise<void> {
		if (deleting) return;
		deleting = true;
		deleteError = '';
		try {
			await onDelete(submission.id);
		} catch (errorValue) {
			deleteError = errorValue instanceof Error ? errorValue.message : 'Unknown error';
		} finally {
			deleting = false;
		}
	}
</script>

<article class="submission-card">
	<div class="surface">
		<header class="surface-header">
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
					{#if submission.worker || submission.processingStartedAt || submission.resolvedAt}
						{@const workerAgent = (submission.worker?.agent ??
							submission.agent ??
							'off') as DispatchAgent}
						{@const startedAt = submission.processingStartedAt}
						{@const resolvedAt = submission.resolvedAt}
						{@const duration = formatDurationMs(submission.durationMs)}
						<div class="worker-strip" data-status={submission.status}>
							<span class="worker-pill">
								{#if submission.status === 'processing'}
									<span class="worker-spinner" aria-hidden="true">
										<Loader2 size={14} />
									</span>
								{:else}
									<AgentIcon agent={workerAgent} size={14} />
								{/if}
								<span class="worker-label">
									{#if submission.status === 'processing'}
										Being processed by {workerHeadline(submission.worker)}
									{:else if submission.status === 'resolved'}
										Resolved by {workerHeadline(submission.worker)}
									{:else}
										{workerHeadline(submission.worker)}
									{/if}
								</span>
							</span>
							{#if submission.worker?.model || submission.worker?.version}
								<span class="worker-versions">
									{#if submission.worker?.model}
										<span class="worker-version">{submission.worker.model}</span>
									{/if}
									{#if submission.worker?.version}
										<span class="worker-version">v{submission.worker.version}</span>
									{/if}
								</span>
							{/if}
							{#if startedAt}
								<span class="worker-meta">
									<Clock size={12} aria-hidden="true" />
									Started <FormatDate date={startedAt} dateStyle="medium" timeStyle="short" />
								</span>
							{/if}
							{#if resolvedAt}
								<span class="worker-meta">
									<Check size={12} aria-hidden="true" />
									Resolved <FormatDate date={resolvedAt} dateStyle="medium" timeStyle="short" />
								</span>
							{/if}
							{#if duration}
								<span class="worker-meta">
									<Timer size={12} aria-hidden="true" />
									{duration}
								</span>
							{/if}
						</div>
					{/if}
				</div>
				<div class="header-actions" role="group" aria-label="Submission actions">
					<Button href={submission.url} target="_blank" rel="noreferrer" variant="ghost" size="sm">
						<ExternalLink size={14} aria-hidden="true" />
						Open page
					</Button>

					{#if submission.status === 'pending'}
						<Button
							variant="outline"
							size="sm"
							onclick={() => void onSetStatus(submission.id, 'resolved')}
							disabled={refreshing}
						>
							<Check size={14} aria-hidden="true" />
							Mark resolved
						</Button>
					{:else if submission.status === 'processing'}
						<Button
							variant="outline"
							size="sm"
							onclick={() => void onSetStatus(submission.id, 'resolved')}
							disabled={refreshing}
						>
							<Check size={14} aria-hidden="true" />
							Mark resolved
						</Button>
						<Button
							variant="outline"
							size="sm"
							onclick={() => void onSetStatus(submission.id, 'pending')}
							disabled={refreshing}
						>
							<Undo2 size={14} aria-hidden="true" />
							Release
						</Button>
					{:else}
						<Button
							variant="outline"
							size="sm"
							onclick={() => void onSetStatus(submission.id, 'pending')}
							disabled={refreshing}
						>
							<RotateCcw size={14} aria-hidden="true" />
							Reopen
						</Button>
					{/if}

					<AlertDialog.Root>
						<AlertDialog.Trigger>
							<Button
								variant="outline"
								color="danger"
								size="sm"
								disabled={refreshing || deleting}
								onclick={() => {
									deleteError = '';
								}}
							>
								<Trash2 size={14} aria-hidden="true" />
								Delete
							</Button>
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>Delete feedback submission?</AlertDialog.Header>
							<AlertDialog.Body>
								This removes the submission and its captured screenshot from the local feedback
								store.
								{#if deleteError}
									<Alert variant="error">{deleteError}</Alert>
								{/if}
							</AlertDialog.Body>
							<AlertDialog.Footer>
								<AlertDialog.Cancel disabled={deleting}>Keep submission</AlertDialog.Cancel>
								<AlertDialog.Action
									disabled={deleting || refreshing}
									onclick={() => void deleteSubmission()}
								>
									{deleting ? 'Deleting...' : 'Delete submission'}
								</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</div>
		</header>

		<div class="surface-content">
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
				</div>

				<section class="notes">
					<header class="notes-head">
						<Heading level={6}>Notes</Heading>
						{#if drawingCounts.length > 0}
							<ChipGroup.Root gap="sm" aria-label="Annotation counts">
								<ChipGroup.Label>
									<VisuallyHidden>Annotation counts</VisuallyHidden>
								</ChipGroup.Label>
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
									<Text as="p" size="xs">{note}</Text>
								</div>
							{/each}
						</div>
					{:else if drawingCounts.length > 0}
						<Text as="p" size="xs" color="secondary">
							This submission only uses visual arrows or freehand marks.
						</Text>
					{:else}
						<Text as="p" size="xs" color="secondary">No annotations attached.</Text>
					{/if}
				</section>

				<div class="prompt">
					<div class="feedback-prompt-block">
						<CodeBlock code={promptText} language="text" showCopyButton={false} />
					</div>
					<div class="prompt-actions">
						{#if dispatchTargets.length > 0 && targetAgent}
							<div class="launch-group">
								<BorderBeam size="sm" colorVariant="mono" borderRadius="var(--dry-radius-md)">
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
		</div>
	</div>
</article>

<style>
	.submission-card {
		container: feedback-submission / inline-size;
		display: grid;
	}

	.surface {
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		overflow: hidden;
	}

	.surface-header {
		padding: var(--dry-space-3) var(--dry-space-4);
		border-bottom: 1px solid var(--dry-color-stroke-weak);
	}

	.surface-content {
		padding: var(--dry-space-3) var(--dry-space-4) var(--dry-space-4);
	}

	.header {
		display: grid;
		gap: var(--dry-space-2);
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
		font-size: var(--dry-text-sm-size);
		line-height: var(--dry-text-sm-leading);
	}

	.url {
		--dry-link-color: var(--dry-color-text-strong);
		--dry-link-hover-color: var(--dry-color-fill-brand);

		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: inherit;
		font-weight: 500;
		line-height: inherit;
	}

	.url:hover {
		--dry-link-color: var(--dry-color-fill-brand);
	}

	.header-meta {
		display: grid;
		gap: var(--dry-space-1_5);
		align-items: start;
		font-size: var(--dry-text-xs-size);
		line-height: var(--dry-text-xs-leading);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	.id {
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, monospace);
		font-size: inherit;
		line-height: inherit;
	}

	.dot {
		display: none;
		opacity: 0.5;
	}

	.worker-strip {
		display: grid;
		gap: var(--dry-space-1_5);
		align-items: center;
		padding: var(--dry-space-1_5) var(--dry-space-2);
		margin-block-start: var(--dry-space-1);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-sm);
		background: var(--dry-color-bg-sunken);
		font-size: var(--dry-text-xs-size);
		line-height: var(--dry-text-xs-leading);
		color: var(--dry-color-text-weak);
	}

	.worker-strip[data-status='processing'] {
		border-color: var(--dry-color-stroke-brand, var(--dry-color-fill-brand));
		background: color-mix(in oklch, var(--dry-color-fill-brand) 7%, var(--dry-color-bg-sunken));
		color: var(--dry-color-text-strong);
	}

	.worker-pill {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1_5);
		align-items: center;
		font-weight: 500;
		color: var(--dry-color-text-strong);
	}

	.worker-label {
		font-size: var(--dry-text-xs-size);
	}

	.worker-versions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1);
		align-items: center;
	}

	.worker-version {
		display: inline-grid;
		place-items: center;
		padding-inline: var(--dry-space-1);
		padding-block: var(--dry-space-0_5);
		border-radius: var(--dry-radius-xs, var(--dry-radius-sm));
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-weak);
		font-family: var(--dry-font-mono, ui-monospace, SFMono-Regular, monospace);
		font-size: var(--dry-text-2xs-size, 0.65rem);
		color: var(--dry-color-text-weak);
	}

	.worker-meta {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-1);
		align-items: center;
		font-variant-numeric: tabular-nums;
	}

	.worker-spinner {
		display: inline-grid;
		place-items: center;
		color: var(--dry-color-fill-brand);
		animation: worker-strip-spin 1.4s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.worker-spinner {
			animation: none;
		}
	}

	@keyframes worker-strip-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.header-actions {
		--dry-btn-radius: var(--dry-radius-md);

		display: grid;
		gap: var(--dry-space-2);
		align-items: center;
		justify-items: start;
	}

	.body {
		display: grid;
		gap: var(--dry-space-4);
		align-items: start;
	}

	.media {
		display: grid;
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
		gap: var(--dry-space-1_5);
		align-content: start;
	}

	.prompt {
		display: grid;
		gap: var(--dry-space-1_5);
		align-content: start;
	}

	.feedback-prompt-block {
		--dry-code-font-size: var(--dry-type-ui-caption-size, var(--dry-text-xs-size));
		--dry-code-line-height: var(--dry-type-ui-caption-leading, var(--dry-text-xs-leading));
		--dry-code-padding: var(--dry-space-2_5);
		--dry-code-radius: var(--dry-radius-md);

		max-block-size: min(15rem, 38dvh);
		overflow: auto;
		border-radius: var(--dry-radius-md);
	}

	.prompt-actions {
		--dry-btn-radius: var(--dry-radius-md);

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
		border-radius: var(--dry-radius-md);
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
		padding-inline-start: var(--dry-space-1);
	}

	.notes-head {
		display: grid;
		gap: var(--dry-space-1_5);
		align-items: start;
	}

	.notes-stack {
		display: grid;
		gap: var(--dry-space-1_5);
	}

	.note-card {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-2);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-sunken);
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

		.worker-strip {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
			gap: var(--dry-space-3);
		}

		.prompt-actions {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
		}

		.header-actions {
			grid-auto-flow: column;
			grid-auto-columns: max-content;
		}

		.notes-head {
			grid-template-columns: max-content minmax(0, 1fr);
			align-items: center;
		}
	}

	@container feedback-submission (min-width: 42rem) {
		.header {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.header-actions {
			justify-content: end;
		}

		.body {
			grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
		}

		.media,
		.notes {
			grid-column: 1;
		}

		.prompt {
			grid-column: 2;
			grid-row: 1 / span 2;
		}
	}

	@container feedback-submission (min-width: 60rem) {
		.body {
			grid-template-columns: minmax(0, 18rem) minmax(12rem, 15rem) minmax(0, 1fr);
		}

		.media,
		.notes,
		.prompt {
			grid-column: auto;
			grid-row: auto;
		}
	}
</style>
