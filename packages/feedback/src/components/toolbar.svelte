<script lang="ts">
	import {
		AlignVerticalJustifyCenter,
		ArrowLeft,
		Check,
		Eraser,
		GripVertical,
		LayoutTemplate,
		Maximize,
		Move,
		MoveUpRight,
		Pencil,
		RotateCcw,
		Send,
		Type
	} from 'lucide-svelte';
	import { type SubmitStatus, type Tool } from '../types.js';

	export type LayoutTransform = 'fill' | 'center' | 'reset';
	export type Mode = 'annotate' | 'layout';

	interface Props {
		active: boolean;
		tool: Tool;
		mode: Mode;
		hidden: boolean;
		submitStatus: SubmitStatus;
		sent: boolean;
		hasSelection?: boolean;
		ontoggle: () => void;
		ontoolchange: (tool: Tool) => void;
		onsubmit: () => void;
		onmodechange: (mode: Mode) => void;
		onlayouttransform?: (transform: LayoutTransform) => void;
		ondeselect?: () => void;
	}

	let {
		active,
		tool,
		mode,
		hidden,
		submitStatus,
		sent,
		hasSelection = false,
		ontoggle,
		ontoolchange,
		onsubmit,
		onmodechange,
		onlayouttransform,
		ondeselect
	}: Props = $props();

	const inspecting = $derived(mode === 'layout');
	const showLayoutOptions = $derived(inspecting && hasSelection);
	const showAnnotationTools = $derived(mode === 'annotate');
	const showToolPill = $derived(showAnnotationTools || showLayoutOptions);

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

	const DRAG_THRESHOLD_PX = 4;
	const submitting = $derived(submitStatus !== 'idle');
	const submitCopy = $derived(sent ? SENT_COPY : SUBMIT_COPY[submitStatus]);

	let toolbarEl = $state<HTMLDivElement | null>(null);
	let pillPosition = $state<'above' | 'below'>('above');
	const PILL_CLEARANCE = 56;

	function updatePillPosition() {
		if (!toolbarEl) return;
		const rect = toolbarEl.getBoundingClientRect();
		const next = rect.top < PILL_CLEARANCE ? 'below' : 'above';
		if (next !== pillPosition) pillPosition = next;
	}

	let pillFrame = 0;
	function schedulePillUpdate() {
		if (pillFrame) return;
		pillFrame = requestAnimationFrame(() => {
			pillFrame = 0;
			updatePillPosition();
		});
	}

	$effect(() => {
		if (!inspecting) return;
		updatePillPosition();
		window.addEventListener('resize', schedulePillUpdate);
		window.addEventListener('scroll', schedulePillUpdate, true);
		return () => {
			if (pillFrame) cancelAnimationFrame(pillFrame);
			window.removeEventListener('resize', schedulePillUpdate);
			window.removeEventListener('scroll', schedulePillUpdate, true);
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
		if (inspecting) updatePillPosition();
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
</script>

<div
	bind:this={toolbarEl}
	class="toolbar"
	data-hidden={hidden || undefined}
	data-dragging={dragging || undefined}
	role="toolbar"
	tabindex="-1"
	aria-hidden={hidden}
	aria-label="Feedback toolbar"
>
	<div class="mode-pill" role="tablist" aria-label="Feedback mode">
		<button
			class="mode-btn"
			type="button"
			role="tab"
			aria-selected={mode === 'annotate'}
			data-active={mode === 'annotate' || undefined}
			onclick={() => onmodechange('annotate')}
		>
			<Pencil size={12} aria-hidden="true" />
			<span>Annotate</span>
		</button>

		<button
			class="mode-btn"
			type="button"
			role="tab"
			aria-selected={mode === 'layout'}
			data-active={mode === 'layout' || undefined}
			onclick={() => onmodechange('layout')}
		>
			<LayoutTemplate size={12} aria-hidden="true" />
			<span>Layout</span>
		</button>

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
	</div>

	{#if showToolPill}
		<div
			class="tool-pill"
			role="group"
			aria-label={showLayoutOptions ? 'Layout tools' : 'Annotation tools'}
		>
			{#if showLayoutOptions}
				<button
					class="tool-btn"
					type="button"
					onclick={() => ondeselect?.()}
					aria-label="Back to inspector"
				>
					<ArrowLeft size={18} />
				</button>

				<button
					class="tool-btn"
					type="button"
					onclick={() => onlayouttransform?.('fill')}
					aria-label="Fill available space"
				>
					<Maximize size={18} />
				</button>

				<button
					class="tool-btn"
					type="button"
					onclick={() => onlayouttransform?.('center')}
					aria-label="Center content"
				>
					<AlignVerticalJustifyCenter size={18} />
				</button>

				<button
					class="tool-btn"
					type="button"
					onclick={() => onlayouttransform?.('reset')}
					aria-label="Reset layout overrides"
				>
					<RotateCcw size={18} />
				</button>
			{:else}
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

				<button
					class="tool-btn"
					data-active={(active && tool === 'move') || undefined}
					onclick={() => handleToolClick('move')}
					aria-label={active && tool === 'move' ? 'Stop moving' : 'Move'}
				>
					<Move size={18} />
				</button>

				<button
					class="tool-btn"
					data-active={(active && tool === 'eraser') || undefined}
					onclick={() => handleToolClick('eraser')}
					aria-label={active && tool === 'eraser' ? 'Stop erasing' : 'Erase'}
				>
					<Eraser size={18} />
				</button>

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
		</div>
	{/if}

	{#if inspecting}
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
		--pill-bg: hsl(225 15% 15% / 0.95);
		--pill-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
		--tool-slot-height: 46px;

		position: absolute;
		right: 24px;
		bottom: 24px;
		z-index: 10000;
		display: grid;
		grid-template-rows: auto var(--tool-slot-height);
		justify-items: end;
		gap: 6px;
		user-select: none;
		touch-action: none;
	}

	.tool-pill {
		grid-row: 2;
		align-self: end;
	}

	.toolbar[data-dragging] {
		cursor: grabbing;
	}

	.toolbar[data-hidden] {
		visibility: hidden;
		pointer-events: none;
	}

	.mode-pill,
	.tool-pill {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 2px;
		border-radius: 12px;
		background: var(--pill-bg);
		backdrop-filter: blur(8px);
		box-shadow: var(--pill-shadow);
	}

	.mode-pill {
		padding: 3px;
	}

	.tool-pill {
		padding: 4px;
	}

	.mode-btn {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: hsl(220 10% 60%);
		cursor: pointer;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.mode-btn:hover:not([data-active]) {
		color: hsl(220 10% 88%);
	}

	.mode-btn[data-active] {
		background: hsl(25 100% 55% / 0.18);
		color: hsl(25 100% 80%);
	}

	.mode-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.drag-handle {
		display: grid;
		place-items: center;
		padding: 6px 4px;
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
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.toolbar[data-dragging] .drag-handle {
		cursor: grabbing;
		color: hsl(25 100% 67%);
	}

	.inspect-pill {
		position: absolute;
		inset-inline-end: 0;
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 8px;
		background: var(--pill-bg);
		backdrop-filter: blur(8px);
		color: hsl(220 10% 92%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.04em;
		box-shadow: var(--pill-shadow);
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
</style>
