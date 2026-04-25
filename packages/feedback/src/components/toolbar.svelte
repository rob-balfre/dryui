<script lang="ts">
	import { Check, Pencil, Eraser, MoveUpRight, Type, Move, Send, LayoutGrid } from 'lucide-svelte';
	import { type SubmitStatus, type Tool } from '../types.js';
	import LayoutsMenu from './layouts-menu.svelte';

	interface Props {
		active: boolean;
		tool: Tool;
		hasDrawings: boolean;
		hidden: boolean;
		submitStatus: SubmitStatus;
		sent: boolean;
		ontoggle: () => void;
		ontoolchange: (tool: Tool) => void;
		onsubmit: () => void;
	}

	let {
		active,
		tool,
		hasDrawings,
		hidden,
		submitStatus,
		sent,
		ontoggle,
		ontoolchange,
		onsubmit
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
	let layoutsOpen = $state(false);
	let toolbarEl: HTMLDivElement | undefined = $state();
	const submitting = $derived(submitStatus !== 'idle');
	const showMoveTool = $derived(hasDrawings || (active && tool === 'move'));
	const showEraserTool = $derived(hasDrawings || (active && tool === 'eraser'));
	const showSubmitButton = $derived(hasDrawings || submitting || sent);
	const submitCopy = $derived(sent ? SENT_COPY : SUBMIT_COPY[submitStatus]);

	$effect(() => {
		if (!layoutsOpen) return;
		function handleDocPointer(e: PointerEvent) {
			if (toolbarEl && !toolbarEl.contains(e.target as Node)) {
				layoutsOpen = false;
			}
		}
		document.addEventListener('pointerdown', handleDocPointer, true);
		return () => document.removeEventListener('pointerdown', handleDocPointer, true);
	});

	function handlePointerDown(e: PointerEvent) {
		if (
			(e.target as HTMLElement).closest('button, [role="menu"], [role="menuitem"], [role="dialog"]')
		) {
			return;
		}
		const toolbar = e.currentTarget as HTMLDivElement;
		dragging = true;
		const rect = toolbar.getBoundingClientRect();
		dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		toolbar.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		const toolbar = e.currentTarget as HTMLDivElement;
		const x = Math.max(
			0,
			Math.min(window.innerWidth - toolbar.offsetWidth, e.clientX - dragOffset.x)
		);
		const y = Math.max(
			0,
			Math.min(window.innerHeight - toolbar.offsetHeight, e.clientY - dragOffset.y)
		);
		toolbar.style.left = `${x}px`;
		toolbar.style.top = `${y}px`;
		toolbar.style.right = 'auto';
		toolbar.style.bottom = 'auto';
	}

	function handlePointerUp() {
		dragging = false;
	}

	function handleToolClick(t: Tool) {
		layoutsOpen = false;
		if (!active || tool !== t) {
			ontoolchange(t);
			if (!active) ontoggle();
		} else {
			ontoggle();
		}
	}

	function toggleLayouts() {
		layoutsOpen = !layoutsOpen;
	}
</script>

<div
	bind:this={toolbarEl}
	class="toolbar"
	data-hidden={hidden || undefined}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
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

	<button
		class="tool-btn"
		data-active={layoutsOpen || undefined}
		onclick={toggleLayouts}
		aria-label={layoutsOpen ? 'Hide layout options' : 'Show layout options'}
		aria-haspopup="dialog"
		aria-expanded={layoutsOpen}
	>
		<LayoutGrid size={18} />
	</button>

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

	<LayoutsMenu open={layoutsOpen} onclose={() => (layoutsOpen = false)} />
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
		cursor: grab;
		user-select: none;
		touch-action: none;
	}

	.toolbar:active {
		cursor: grabbing;
	}

	.toolbar[data-hidden] {
		visibility: hidden;
		pointer-events: none;
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
