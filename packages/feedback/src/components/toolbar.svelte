<script lang="ts">
	import {
		Check,
		Pencil,
		Eraser,
		GripVertical,
		MoveUpRight,
		Type,
		FilePlus,
		LayoutTemplate,
		Move,
		PanelTop,
		Send
	} from 'lucide-svelte';
	import { Dialog } from '@dryui/ui';
	import { type SubmitStatus, type Tool } from '../types.js';

	export type LayoutAction = 'update-current-page' | 'add-new-page';

	interface Props {
		active: boolean;
		tool: Tool;
		hasDrawings: boolean;
		hidden: boolean;
		submitStatus: SubmitStatus;
		sent: boolean;
		inspectingLayout?: boolean;
		ontoggle: () => void;
		ontoolchange: (tool: Tool) => void;
		onsubmit: () => void;
		onlayoutaction?: (action: LayoutAction) => void;
	}

	let {
		active,
		tool,
		hasDrawings,
		hidden,
		submitStatus,
		sent,
		inspectingLayout = false,
		ontoggle,
		ontoolchange,
		onsubmit,
		onlayoutaction
	}: Props = $props();

	const SUBMIT_COPY: Record<SubmitStatus, { label: string; aria: string }> = {
		idle: { label: 'Send feedback', aria: 'Send feedback' },
		'waiting-for-capture': {
			label: 'Share tab',
			aria: 'Choose this tab to capture feedback'
		},
		capturing: { label: 'Capturing...', aria: 'Capturing screenshot' },
		uploading: { label: 'Sending...', aria: 'Sending feedback' }
	};
	const SENT_COPY = { label: 'Sent!', aria: 'Sent!' } as const;

	let dragging = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let pendingDrag = $state<{ id: number; x: number; y: number } | null>(null);
	let layoutDialogOpen = $state(false);

	const DRAG_THRESHOLD_PX = 4;
	const submitting = $derived(submitStatus !== 'idle');
	const showMoveTool = $derived(hasDrawings || (active && tool === 'move'));
	const showEraserTool = $derived(hasDrawings || (active && tool === 'eraser'));
	const showSubmitButton = $derived(hasDrawings || submitting || sent);
	const submitCopy = $derived(sent ? SENT_COPY : SUBMIT_COPY[submitStatus]);

	let toolbarEl = $state<HTMLDivElement | null>(null);
	let pillPosition = $state<'above' | 'below'>('above');
	const PILL_CLEARANCE = 56;

	function updatePillPosition() {
		if (!toolbarEl) return;
		const rect = toolbarEl.getBoundingClientRect();
		pillPosition = rect.top < PILL_CLEARANCE ? 'below' : 'above';
	}

	$effect(() => {
		if (!inspectingLayout) return;
		updatePillPosition();
		window.addEventListener('resize', updatePillPosition);
		window.addEventListener('scroll', updatePillPosition, true);
		return () => {
			window.removeEventListener('resize', updatePillPosition);
			window.removeEventListener('scroll', updatePillPosition, true);
		};
	});

	function handleHandlePointerDown(e: PointerEvent) {
		pendingDrag = { id: e.pointerId, x: e.clientX, y: e.clientY };
	}

	function handleHandlePointerMove(e: PointerEvent) {
		if (!pendingDrag || !toolbarEl) return;
		const handle = e.currentTarget as HTMLButtonElement;

		if (!dragging) {
			const dx = e.clientX - pendingDrag.x;
			const dy = e.clientY - pendingDrag.y;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
			const rect = toolbarEl.getBoundingClientRect();
			dragOffset = { x: pendingDrag.x - rect.left, y: pendingDrag.y - rect.top };
			handle.setPointerCapture(pendingDrag.id);
			dragging = true;
		}

		const x = Math.max(
			0,
			Math.min(window.innerWidth - toolbarEl.offsetWidth, e.clientX - dragOffset.x)
		);
		const y = Math.max(
			0,
			Math.min(window.innerHeight - toolbarEl.offsetHeight, e.clientY - dragOffset.y)
		);
		toolbarEl.style.left = `${x}px`;
		toolbarEl.style.top = `${y}px`;
		toolbarEl.style.right = 'auto';
		toolbarEl.style.bottom = 'auto';
		if (inspectingLayout) updatePillPosition();
	}

	function handleHandlePointerUp() {
		pendingDrag = null;
		dragging = false;
	}

	function handleToolClick(t: Tool) {
		if (!active || tool !== t) {
			ontoolchange(t);
			if (!active) ontoggle();
		} else {
			ontoggle();
		}
	}

	function handleLayoutChoice(choice: LayoutAction) {
		layoutDialogOpen = false;
		onlayoutaction?.(choice);
	}
</script>

<div
	bind:this={toolbarEl}
	class="toolbar"
	data-hidden={hidden || undefined}
	data-dragging={dragging || undefined}
	role="toolbar"
	tabindex="-1"
	aria-hidden={hidden}
	aria-label="Feedback drawing tools"
>
	<button
		class="tool-btn"
		data-active={(active && tool === 'pencil') || undefined}
		onclick={() => handleToolClick('pencil')}
		aria-label={active && tool === 'pencil' ? 'Stop drawing' : 'Draw'}
	>
		<Pencil size={18} />
	</button>

	<button
		class="tool-btn"
		data-active={(active && tool === 'arrow') || undefined}
		onclick={() => handleToolClick('arrow')}
		aria-label={active && tool === 'arrow' ? 'Stop arrows' : 'Arrow'}
	>
		<MoveUpRight size={18} />
	</button>

	<button
		class="tool-btn"
		data-active={(active && tool === 'text') || undefined}
		onclick={() => handleToolClick('text')}
		aria-label={active && tool === 'text' ? 'Stop text' : 'Text'}
	>
		<Type size={18} />
	</button>

	<Dialog.Root bind:open={layoutDialogOpen}>
		<Dialog.Trigger>
			<button class="tool-btn" type="button" aria-label="Build page layouts">
				<LayoutTemplate size={18} />
			</button>
		</Dialog.Trigger>

		<div class="layout-dialog-scope">
			<Dialog.Content>
				<Dialog.Header>
					<h2 class="layout-dialog-title">
						<LayoutTemplate size={12} aria-hidden="true" />
						Layouts
					</h2>
				</Dialog.Header>

				<Dialog.Body>
					<div class="layout-actions" role="menu" aria-label="Layout actions">
						<button
							class="layout-action"
							type="button"
							role="menuitem"
							onclick={() => handleLayoutChoice('update-current-page')}
						>
							<PanelTop size={16} aria-hidden="true" />
							<span class="layout-action-label">Update current page</span>
							<span class="layout-action-hint">Apply changes to this route</span>
						</button>

						<button
							class="layout-action"
							type="button"
							role="menuitem"
							onclick={() => handleLayoutChoice('add-new-page')}
						>
							<FilePlus size={16} aria-hidden="true" />
							<span class="layout-action-label">Add new page</span>
							<span class="layout-action-hint">Pick a layout, create a route</span>
						</button>
					</div>
				</Dialog.Body>
			</Dialog.Content>
		</div>
	</Dialog.Root>

	{#if showMoveTool}
		<button
			class="tool-btn"
			data-active={(active && tool === 'move') || undefined}
			onclick={() => handleToolClick('move')}
			aria-label={active && tool === 'move' ? 'Stop moving' : 'Move'}
		>
			<Move size={18} />
		</button>
	{/if}

	{#if showEraserTool}
		<button
			class="tool-btn"
			data-active={(active && tool === 'eraser') || undefined}
			onclick={() => handleToolClick('eraser')}
			aria-label={active && tool === 'eraser' ? 'Stop erasing' : 'Erase'}
		>
			<Eraser size={18} />
		</button>
	{/if}

	{#if showSubmitButton}
		<button
			class="tool-btn submit-btn"
			data-submitting={submitting || undefined}
			data-sent={sent || undefined}
			onclick={onsubmit}
			aria-label={submitCopy.aria}
		>
			{#if sent}
				<Check size={16} />
			{:else}
				<Send size={16} />
			{/if}
			<span class="submit-label">{submitCopy.label}</span>
		</button>
	{/if}

	<button
		class="drag-handle"
		type="button"
		aria-label="Drag toolbar"
		onpointerdown={handleHandlePointerDown}
		onpointermove={handleHandlePointerMove}
		onpointerup={handleHandlePointerUp}
		onpointercancel={handleHandlePointerUp}
	>
		<GripVertical size={14} aria-hidden="true" />
	</button>

	{#if inspectingLayout}
		<div class="inspect-pill" data-position={pillPosition} role="status">
			<span class="inspect-pill-dot" aria-hidden="true"></span>
			<span class="inspect-pill-label">Inspecting layout</span>
			<kbd class="inspect-pill-kbd">ESC</kbd>
		</div>
	{/if}
</div>

<style>
	.toolbar {
		--accent: hsl(25 100% 55%);

		position: absolute;
		right: 24px;
		bottom: 24px;
		z-index: 10000;
		display: grid;
		grid-auto-flow: column;
		gap: 2px;
		padding: 4px;
		border-radius: 12px;
		background: hsl(225 15% 15% / 0.95);
		backdrop-filter: blur(8px);
		box-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
		user-select: none;
		touch-action: none;
	}

	.toolbar[data-dragging] {
		cursor: grabbing;
	}

	.toolbar[data-hidden] {
		visibility: hidden;
		pointer-events: none;
	}

	.toolbar :global([data-dialog-trigger='true']) {
		display: contents;
	}

	.drag-handle {
		display: grid;
		place-items: center;
		padding: 8px 4px;
		margin-inline-start: 2px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: hsl(220 10% 45%);
		cursor: grab;
		touch-action: none;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.drag-handle:hover {
		background: hsl(225 15% 22%);
		color: hsl(220 10% 80%);
	}

	.drag-handle:focus-visible {
		outline: 2px solid hsl(25 100% 55%);
		outline-offset: 1px;
	}

	.toolbar[data-dragging] .drag-handle {
		cursor: grabbing;
		color: hsl(25 100% 67%);
	}

	.inspect-pill {
		position: absolute;
		inset-inline-start: 50%;
		transform: translateX(-50%);
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 8px;
		background: hsl(225 15% 15% / 0.95);
		backdrop-filter: blur(8px);
		color: hsl(220 10% 92%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.04em;
		box-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
		white-space: nowrap;
		pointer-events: none;
	}

	.inspect-pill[data-position='above'] {
		inset-block-end: calc(100% + 8px);
	}

	.inspect-pill[data-position='below'] {
		inset-block-start: calc(100% + 8px);
	}

	.inspect-pill-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: hsl(25 100% 55%);
		box-shadow: 0 0 8px hsl(25 100% 55% / 0.6);
	}

	.inspect-pill-kbd {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		background: hsl(225 15% 22%);
		color: hsl(220 10% 80%);
	}

	.tool-btn {
		display: grid;
		place-items: center;
		padding: 8px;
		border: 2px solid transparent;
		border-radius: 8px;
		background: transparent;
		color: hsl(220 10% 70%);
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s,
			color 0.15s;
	}

	.tool-btn:hover {
		background: hsl(225 15% 22%);
		color: hsl(220 10% 90%);
	}

	.tool-btn[data-active] {
		background: var(--accent);
		border-color: white;
		color: black;
		box-shadow:
			0 0 0 1px black,
			0 4px 12px hsl(0 0% 0% / 0.35);
	}

	.tool-btn[data-active]:hover {
		background: hsl(25 100% 62%);
		color: black;
	}

	.submit-btn {
		grid-template-columns: auto auto;
		gap: 4px;
		padding-inline-end: 10px;
		color: hsl(145 70% 50%);
	}

	.submit-btn:hover {
		background: hsl(145 70% 25%);
		color: hsl(145 70% 70%);
	}

	.submit-btn[data-submitting] {
		opacity: 0.5;
	}

	.submit-btn[data-sent] {
		background: hsl(145 70% 25%);
		color: hsl(145 70% 70%);
	}

	.submit-label {
		font-size: 12px;
		font-weight: 600;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		white-space: nowrap;
	}

	.layout-dialog-scope {
		--dry-dialog-max-width: 19rem;
		display: contents;
	}

	.layout-dialog-scope :global([data-dialog-header]),
	.layout-dialog-scope :global([data-dialog-body]) {
		--dry-section-padding: 14px 16px;
	}

	.layout-dialog-title {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: hsl(25 100% 67%);
	}

	.layout-actions {
		display: grid;
		gap: 2px;
	}

	.layout-action {
		display: grid;
		grid-template-columns: 16px 1fr;
		column-gap: 12px;
		row-gap: 2px;
		align-items: center;
		padding: 10px 12px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		color: var(--dry-color-text-strong, hsl(220 10% 92%));
		cursor: pointer;
		text-align: start;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.layout-action :global(svg) {
		grid-row: 1 / span 2;
		color: hsl(25 100% 67%);
	}

	.layout-action-label {
		grid-column: 2;
		grid-row: 1;
		font-size: 13px;
		font-weight: 600;
		line-height: 1.2;
	}

	.layout-action-hint {
		grid-column: 2;
		grid-row: 2;
		font-size: 11px;
		font-weight: 400;
		line-height: 1.3;
		color: var(--dry-color-text-weak, hsl(220 10% 58%));
	}

	.layout-action:hover,
	.layout-action:focus-visible {
		background: hsl(25 100% 55% / 0.08);
		border-color: hsl(25 100% 55% / 0.35);
		outline: none;
	}

	.layout-action:active {
		background: hsl(25 100% 55% / 0.18);
		border-color: hsl(25 100% 55%);
	}
</style>
