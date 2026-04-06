<script lang="ts">
	import { onMount } from 'svelte';
	import { Badge } from '@dryui/ui/badge';
	import { Button } from '@dryui/ui/button';
	import { Card } from '@dryui/ui/card';
	import { Collapsible } from '@dryui/ui/collapsible';
	import { Field } from '@dryui/ui/field';
	import { Input } from '@dryui/ui/input';
	import { Label } from '@dryui/ui/label';
	import { RadioGroup } from '@dryui/ui/radio-group';
	import { RelativeTime } from '@dryui/ui/relative-time';
	import { Text } from '@dryui/ui/text';
	import { Textarea } from '@dryui/ui/textarea';
	import { ANNOTATION_COLOR_OPTIONS, DEFAULT_SETTINGS } from '../constants.js';
	import type { Annotation } from '../types.js';

	interface Props {
		element: string;
		initialValue?: string;
		selectedText?: string;
		computedStyles?: string;
		color?: Annotation['color'];
		status?: Annotation['status'];
		thread?: Annotation['thread'];
		resolvedAt?: Annotation['resolvedAt'];
		resolvedBy?: Annotation['resolvedBy'];
		resolutionNote?: Annotation['resolutionNote'];
		showDelete?: boolean;
		showStatusActions?: boolean;
		fieldLabel?: string;
		helperText?: string;
		placeholder?: string;
		position: { x: number; y: number };
		submitLabel?: string;
		oncolorchange?: (color: Annotation['color']) => void;
		onsubmit: (text: string, meta?: { resolutionNote?: string }) => void;
		oncancel: () => void;
		ondelete?: () => void;
		onacknowledge?: (meta?: { resolutionNote?: string }) => void;
		onresolve?: (meta?: { resolutionNote?: string }) => void;
		ondismiss?: (meta?: { resolutionNote?: string }) => void;
		onreply?: (text: string) => void;
	}

	const EXIT_DURATION_MS = 150;
	const SHAKE_DURATION_MS = 250;

	let {
		element,
		initialValue = '',
		selectedText,
		computedStyles,
		color = DEFAULT_SETTINGS.annotationColor,
		status = 'pending',
		thread = [],
		resolvedAt,
		resolvedBy,
		resolutionNote,
		showDelete = false,
		showStatusActions = false,
		fieldLabel = 'Feedback',
		helperText = 'Enter submits. Shift+Enter inserts a new line.',
		placeholder = 'Add feedback...',
		position,
		submitLabel,
		oncolorchange,
		onsubmit,
		oncancel,
		ondelete,
		onacknowledge,
		onresolve,
		ondismiss,
		onreply
	}: Props = $props();

	let comment = $state('');
	let replyText = $state('');
	let resolutionNoteText = $state('');
	let stylesExpanded = $state(false);
	let phase = $state<'enter' | 'entered' | 'exit'>('enter');
	let shaking = $state(false);
	let surface = $state<HTMLDivElement>();
	let textarea = $state<HTMLTextAreaElement>();
	let popupOpen = $state(true);
	let surfaceVersion = $state(0);

	let closing = false;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	let shakeTimer: ReturnType<typeof setTimeout> | undefined;

	const computedStyleEntries = $derived(
		computedStyles
			? computedStyles
					.split(';')
					.map((entry) => entry.trim())
					.filter(Boolean)
			: []
	);
	const threadMessages = $derived(thread ?? []);
	const statusLabel = $derived(
		status === 'acknowledged'
			? 'Acknowledged'
			: status === 'resolved'
				? 'Resolved'
				: status === 'dismissed'
					? 'Dismissed'
					: status === 'failed'
						? 'Failed'
						: 'Pending'
	);
	const statusColor = $derived(
		status === 'acknowledged'
			? 'yellow'
			: status === 'resolved'
				? 'green'
				: status === 'dismissed'
					? 'gray'
					: status === 'failed'
						? 'red'
						: 'blue'
	);
	const showLifecycleBlock = $derived(
		showStatusActions ||
			threadMessages.length > 0 ||
			Boolean(resolvedAt) ||
			Boolean(resolvedBy) ||
			Boolean(resolutionNote)
	);
	const showResolutionField = $derived(showStatusActions || Boolean(resolutionNote));

	function focusTextarea() {
		if (!textarea) return;
		textarea.focus();
		const end = textarea.value.length;
		textarea.setSelectionRange(end, end);
	}

	function attachTextarea(node: HTMLTextAreaElement) {
		textarea = node;
		return () => {
			if (textarea === node) {
				textarea = undefined;
			}
		};
	}

	function getResolvedPosition() {
		const measuredWidth =
			surface?.offsetWidth ||
			surface?.getBoundingClientRect().width ||
			Math.min(392, window.innerWidth - 24);
		const measuredHeight = surface?.offsetHeight || surface?.getBoundingClientRect().height || 0;
		const width = measuredWidth + 16;
		const height = measuredHeight + 16;
		const padding = 12;

		return {
			x: Math.max(padding, Math.min(position.x, window.innerWidth - width - padding)),
			y: Math.max(padding, Math.min(position.y, window.innerHeight - height - padding))
		};
	}

	const resolvedPosition = $derived.by(() => {
		surfaceVersion;
		return getResolvedPosition();
	});

	function attachSurface(node: HTMLDivElement) {
		surface = node;

		const update = () => {
			requestAnimationFrame(() => {
				if (surface === node) {
					surfaceVersion += 1;
				}
			});
		};

		const resizeObserver =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;

		resizeObserver?.observe(node);
		window.addEventListener('resize', update);
		update();

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', update);
			if (surface === node) {
				surface = undefined;
			}
		};
	}

	function scheduleCancel() {
		if (closing) return;
		closing = true;
		phase = 'exit';
		closeTimer = setTimeout(() => {
			popupOpen = false;
			oncancel();
		}, EXIT_DURATION_MS);
	}

	function handleDismiss() {
		scheduleCancel();
	}

	function shake() {
		if (shakeTimer) clearTimeout(shakeTimer);
		shaking = true;
		shakeTimer = setTimeout(() => {
			shaking = false;
			focusTextarea();
		}, SHAKE_DURATION_MS);
	}

	function handleSubmit() {
		const trimmed = comment.trim();
		if (!trimmed) {
			shake();
			return;
		}

		onsubmit(trimmed, currentMeta());
	}

	function currentMeta(): { resolutionNote?: string } | undefined {
		const nextResolutionNote = resolutionNoteText.trim();
		return nextResolutionNote ? { resolutionNote: nextResolutionNote } : undefined;
	}

	function handleAcknowledge() {
		onacknowledge?.(currentMeta());
	}

	function handleResolve() {
		onresolve?.(currentMeta());
	}

	function handleDismissStatus() {
		ondismiss?.(currentMeta());
	}

	function handleReply() {
		const trimmed = replyText.trim();
		if (!trimmed) {
			return;
		}

		onreply?.(trimmed);
		replyText = '';
	}

	function formatThreadTimestamp(timestamp: number): string {
		return new Intl.DateTimeFormat(undefined, {
			hour: 'numeric',
			minute: '2-digit'
		}).format(timestamp);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			if (event.target !== textarea) {
				return;
			}

			event.preventDefault();
			handleSubmit();
		}
	}

	function applyPopupPosition(node: HTMLElement, pos: { x: number; y: number }) {
		node.style.setProperty('left', `${pos.x}px`);
		node.style.setProperty('top', `${pos.y}px`);
		return {
			update(p: { x: number; y: number }) {
				node.style.setProperty('left', `${p.x}px`);
				node.style.setProperty('top', `${p.y}px`);
			}
		};
	}

	function applySwatch(node: HTMLElement, swatch: string) {
		node.style.setProperty('--swatch', swatch);
		return {
			update(s: string) {
				node.style.setProperty('--swatch', s);
			}
		};
	}

	onMount(() => {
		comment = initialValue;
		resolutionNoteText = resolutionNote ?? '';
		const focusTimer = setTimeout(() => {
			focusTextarea();
			phase = 'entered';
		}, 40);

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target as Node;
			if (target instanceof Element && target.closest('[data-feedback-popup]')) {
				return;
			}

			handleDismiss();
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			handleDismiss();
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleEscape, true);

		return () => {
			clearTimeout(focusTimer);
			if (closeTimer) clearTimeout(closeTimer);
			if (shakeTimer) clearTimeout(shakeTimer);
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleEscape, true);
		};
	});
</script>

{#if popupOpen}
	<div
		data-feedback-popup
		data-dryui-feedback
		role="dialog"
		aria-label="Annotation form"
		class="popup-shell"
		tabindex="-1"
		use:applyPopupPosition={resolvedPosition}
		onkeydown={handleKeydown}
		onclick={(event) => event.stopPropagation()}
	>
		<div
			{@attach attachSurface}
			class="popup-surface"
			class:enter={phase === 'enter'}
			class:entered={phase === 'entered'}
			class:exit={phase === 'exit'}
			class:shake={shaking}
		>
			<Card.Root variant="elevated" size="sm" data-popup-card>
				<Card.Header>
					<div class="vstack-sm">
						<Text size="sm" color="secondary">Annotation target</Text>
						<Text size="md">{element}</Text>
					</div>
				</Card.Header>

				<Card.Content>
					<div class="vstack-md">
						{#if selectedText}
							<div class="vstack-sm">
								<Text size="sm" color="secondary">Selected text</Text>
								<div class="quote-block">
									<Text size="sm">"{selectedText}"</Text>
								</div>
							</div>
						{/if}

						{#if showLifecycleBlock}
							<div class="vstack-sm">
								<div class="hstack-sm">
									<Text size="sm" color="secondary">Annotation status</Text>
									<Badge
										variant="soft"
										color={statusColor}
										size="sm"
										data-testid="popup-status-badge"
									>
										{statusLabel}
									</Badge>
								</div>

								{#if resolvedBy || resolvedAt}
									<div class="hstack-sm">
										<Text size="sm" color="secondary">
											{statusLabel}
											{#if resolvedBy}
												by {resolvedBy}
											{/if}
										</Text>
										{#if resolvedAt}
											<Text size="sm" color="secondary">
												<RelativeTime date={resolvedAt} />
											</Text>
										{/if}
									</div>
								{/if}

								{#if threadMessages.length > 0}
									<div class="vstack-sm">
										<div class="hstack-sm">
											<Text size="sm" color="secondary">Thread</Text>
											<Badge
												variant="outline"
												color="gray"
												size="sm"
												data-testid="popup-thread-count"
											>
												{threadMessages.length}
											</Badge>
										</div>

										<div class="thread-block">
											<div class="vstack-sm" data-testid="popup-thread">
												{#each threadMessages as message (message.id)}
													<div
														class="chat-message"
														data-variant={message.role === 'human' ? 'sent' : 'received'}
														role={message.role === 'human' ? 'user' : 'assistant'}
													>
														<div class="chat-message-header">
															<span class="chat-message-name">{message.role === 'human' ? 'You' : 'Agent'}</span>
															<span class="chat-message-timestamp">{formatThreadTimestamp(message.timestamp)}</span>
														</div>
														<div class="chat-message-body">{message.content}</div>
													</div>
												{/each}
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}

						<Field.Root>
							<Label>Marker color</Label>
							<div class="color-grid">
								<RadioGroup.Root
									orientation="horizontal"
									value={color}
									aria-label="Marker color"
									data-color-radio
								>
									{#each ANNOTATION_COLOR_OPTIONS as option (option.value)}
										<RadioGroup.Item
											value={option.value}
											onclick={() => {
												oncolorchange?.(option.value);
											}}
										>
											<span
												class="color-option"
												data-testid={`popup-color-${option.value}`}
												use:applySwatch={option.swatch}
											>
												<span class="swatch" aria-hidden="true"></span>
												{option.label}
											</span>
										</RadioGroup.Item>
									{/each}
								</RadioGroup.Root>
							</div>
						</Field.Root>

						<Field.Root>
							<Label>{fieldLabel}</Label>
							<Textarea
								{@attach attachTextarea}
								bind:value={comment}
								size="md"
								{placeholder}
								data-popup-textarea
							/>
						</Field.Root>

						{#if showResolutionField}
							<Field.Root>
								<Label>Resolution note</Label>
								<Input
									bind:value={resolutionNoteText}
									size="md"
									placeholder="Summarize what changed or why the note was dismissed"
									data-testid="resolution-note-input"
								/>
							</Field.Root>
						{/if}

						{#if onreply}
							<Field.Root>
								<Label>Reply</Label>
								<div class="hstack-sm-end">
									<Input
										bind:value={replyText}
										size="md"
										placeholder="Reply in the thread"
										data-testid="reply-input"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										data-testid="reply-btn"
										onclick={handleReply}
									>
										Add reply
									</Button>
								</div>
							</Field.Root>
						{/if}

						<Text size="sm" color="secondary">
							{helperText}
						</Text>

						{#if computedStyleEntries.length > 0}
							<Collapsible.Root open={stylesExpanded}>
								<Collapsible.Trigger
									type="button"
									data-testid="popup-computed-styles"
									data-styles-trigger
									onclick={() => {
										stylesExpanded = !stylesExpanded;
									}}
								>
									<span>Computed styles</span>
									<span aria-hidden="true">{stylesExpanded ? '-' : '+'}</span>
								</Collapsible.Trigger>
								<Collapsible.Content>
									<div class="styles-block">
										{#each computedStyleEntries as entry (entry)}
											<Text size="sm" data-mono-text>
												{entry}
											</Text>
										{/each}
									</div>
								</Collapsible.Content>
							</Collapsible.Root>
						{/if}
					</div>
				</Card.Content>

				<Card.Footer>
					<div class="vstack-sm">
						{#if showStatusActions}
							<div class="flex-wrap-sm">
								{#if onacknowledge && status !== 'acknowledged'}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										data-testid="acknowledge-btn"
										onclick={handleAcknowledge}
									>
										Acknowledge feedback
									</Button>
								{/if}

								{#if onresolve && status !== 'resolved'}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										data-testid="resolve-btn"
										onclick={handleResolve}
									>
										Resolve feedback
									</Button>
								{/if}

								{#if ondismiss && status !== 'dismissed'}
									<Button
										type="button"
										variant="ghost"
										color="danger"
										size="sm"
										data-testid="dismiss-btn"
										onclick={handleDismissStatus}
									>
										Dismiss feedback
									</Button>
								{/if}
							</div>
						{/if}

						<div class="hstack-sm">
							<Button
								type="button"
								variant="solid"
								size="sm"
								data-testid="submit-btn"
								onclick={handleSubmit}
							>
								{submitLabel ?? (initialValue ? 'Save' : 'Add')}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								data-testid="cancel-btn"
								onclick={handleDismiss}
							>
								Cancel
							</Button>
							{#if showDelete && ondelete}
								<Button
									type="button"
									variant="ghost"
									color="danger"
									size="sm"
									data-testid="delete-btn"
									onclick={ondelete}
								>
									Delete
								</Button>
							{/if}
						</div>
					</div>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
{/if}

<style>
	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.vstack-md {
		display: grid;
		gap: var(--dry-space-4, 1rem);
	}

	.hstack-sm {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: center;
	}

	.hstack-sm-end {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: end;
	}

	.flex-wrap-sm {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, max-content));
		gap: var(--dry-space-2, 0.5rem);
	}

	.popup-shell {
		position: fixed;
		inset: unset;
		margin: 0;
		z-index: 10001;
		display: grid;
		grid-template-columns: minmax(0, min(344px, calc(100vw - 24px)));
	}

	.popup-surface {
		max-height: calc(100vh - 24px);
		overflow: auto;
		pointer-events: auto;
		transform-origin: top left;
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.popup-surface.enter,
	.popup-surface.entered {
		opacity: 1;
		transform: scale(1);
	}

	.popup-surface.enter {
		opacity: 0;
		transform: scale(0.96);
	}

	.popup-surface.exit {
		opacity: 0;
		transform: scale(0.96);
	}

	.popup-surface.shake {
		animation: popup-shake 0.25s ease;
	}

	.quote-block {
		padding: 0.75rem;
		border-radius: var(--dry-radius-md, 12px);
		background: var(--dry-color-bg-subtle, rgba(148, 163, 184, 0.14));
		border: 1px solid var(--dry-color-stroke-weak, rgba(148, 163, 184, 0.28));
	}

	.color-grid {
		gap: 0.75rem;
	}

	.color-option {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
	}

	.swatch {
		aspect-ratio: 1;
		height: 0.875rem;
		border-radius: 9999px;
		background: var(--swatch);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
	}

	.styles-block {
		display: grid;
		gap: 0.35rem;
		margin-top: 0.5rem;
		padding: 0.75rem;
		border-radius: var(--dry-radius-md, 12px);
		background: var(--dry-color-bg-subtle, rgba(148, 163, 184, 0.14));
		border: 1px solid var(--dry-color-stroke-weak, rgba(148, 163, 184, 0.28));
	}

	.thread-block {
		max-height: 13rem;
		padding: 0.5rem;
		border-radius: var(--dry-radius-md, 12px);
		background: var(--dry-color-bg-subtle, rgba(148, 163, 184, 0.14));
		border: 1px solid var(--dry-color-stroke-weak, rgba(148, 163, 184, 0.28));
	}

	.chat-message {
		display: grid;
		gap: var(--dry-space-1, 0.25rem);
		max-width: 85%;
		padding: 0.5rem 0.625rem;
		border-radius: var(--dry-radius-md, 12px);
	}

	.chat-message[data-variant='sent'] {
		justify-self: end;
		border-bottom-right-radius: var(--dry-radius-xs, 4px);
		background: var(--dry-color-fill-brand, #6366f1);
		color: #fff;
	}

	.chat-message[data-variant='received'] {
		justify-self: start;
		border-bottom-left-radius: var(--dry-radius-xs, 4px);
		background: var(--dry-color-bg-raised, rgba(148, 163, 184, 0.12));
		color: var(--dry-color-text-strong, inherit);
	}

	.chat-message-header {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: baseline;
	}

	.chat-message-name {
		font-size: var(--dry-text-xs, 0.6875rem);
		font-weight: 600;
		opacity: 0.85;
	}

	.chat-message-timestamp {
		font-size: var(--dry-text-xs, 0.6875rem);
		opacity: 0.6;
	}

	.chat-message-body {
		font-size: var(--dry-text-sm, 0.8125rem);
		line-height: 1.45;
		word-break: break-word;
	}

	.popup-surface [data-popup-card] {
	}

	.popup-shell [data-color-radio] {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.popup-shell [data-popup-textarea] {
		min-height: 7rem;
	}

	.popup-shell [data-styles-trigger] {
		display: grid;
		grid-template-columns: 1fr max-content;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-radius: var(--dry-radius-md, 12px);
		border: 1px solid var(--dry-color-stroke-weak, rgba(148, 163, 184, 0.28));
		background: var(--dry-color-bg-base, rgba(15, 23, 42, 0.02));
		color: inherit;
		font: inherit;
	}

	.popup-shell [data-mono-text] {
		font-family: var(--dry-font-mono, 'SFMono-Regular', 'Consolas', monospace);
	}

	@keyframes popup-shake {
		0%,
		100% {
			transform: translateX(0);
		}

		25% {
			transform: translateX(-6px);
		}

		75% {
			transform: translateX(6px);
		}
	}
</style>
