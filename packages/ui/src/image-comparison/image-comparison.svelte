<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		position?: number;
		orientation?: 'horizontal' | 'vertical';
		before: Snippet;
		after: Snippet;
		handle?: Snippet;
	}

	let {
		position = $bindable(50),
		orientation = 'horizontal',
		before,
		after,
		handle,
		class: className,
		style,
		...rest
	}: Props = $props();

	let dragging = $state(false);
	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		el.style.cssText = style || '';
		el.style.setProperty('--dry-image-comparison-position', `${position}%`);
	});

	function updatePosition(clientX: number, clientY: number, containerEl: HTMLElement) {
		const rect = containerEl.getBoundingClientRect();
		let pct: number;
		if (orientation === 'horizontal') {
			pct = ((clientX - rect.left) / rect.width) * 100;
		} else {
			pct = ((clientY - rect.top) / rect.height) * 100;
		}
		position = Math.min(Math.max(pct, 0), 100);
	}

	function onPointerDown(e: PointerEvent) {
		dragging = true;
		const handleEl = e.currentTarget as HTMLElement;
		handleEl.setPointerCapture(e.pointerId);
		const containerEl = handleEl.closest<HTMLElement>('[data-image-comparison]');
		if (!containerEl) return;
		updatePosition(e.clientX, e.clientY, containerEl);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		updatePosition(e.clientX, e.clientY, e.currentTarget as HTMLElement);
	}

	function onPointerUp() {
		dragging = false;
	}

	function onKeyDown(e: KeyboardEvent) {
		const step = e.shiftKey ? 10 : 1;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			position = Math.max(position - step, 0);
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			position = Math.min(position + step, 100);
		}
	}
</script>

{#snippet defaultHandle()}
	<div data-ic-handle data-orientation={orientation}>
		<div data-ic-handle-line></div>
		<div data-ic-grip>
			<div data-ic-grip-arrows>
				<span data-ic-grip-arrow data-ic-grip-arrow-start></span>
				<span data-ic-grip-arrow data-ic-grip-arrow-end></span>
			</div>
		</div>
	</div>
{/snippet}

<div
	bind:this={el}
	class={className}
	data-image-comparison
	data-orientation={orientation}
	data-dragging={dragging || undefined}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	{...rest}
>
	<div data-part="after" data-ic-layer>
		{@render after()}
	</div>
	<div data-part="before" data-ic-layer data-ic-layer-before>
		{@render before()}
	</div>
	<div
		data-part="handle"
		data-ic-handle-wrapper
		role="slider"
		tabindex="0"
		aria-valuenow={Math.round(position)}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label="Comparison slider"
		onpointerdown={onPointerDown}
		onkeydown={onKeyDown}
	>
		{#if handle}
			{@render handle()}
		{:else}
			{@render defaultHandle()}
		{/if}
	</div>
</div>

<style>
	[data-image-comparison] {
		position: relative;
		display: grid;
		height: 100%;
		overflow: hidden;
		border-radius: var(--dry-image-comparison-radius, var(--dry-radius-lg));
		user-select: none;
		touch-action: none;
	}

	[data-ic-layer] {
		grid-area: 1 / 1;
		min-height: 0;
	}

	[data-image-comparison][data-orientation='horizontal'] [data-ic-layer-before] {
		clip-path: inset(0 calc(100% - var(--dry-image-comparison-position, 50%)) 0 0);
	}

	[data-image-comparison][data-orientation='vertical'] [data-ic-layer-before] {
		clip-path: inset(0 0 calc(100% - var(--dry-image-comparison-position, 50%)) 0);
	}

	[data-ic-handle-wrapper] {
		position: absolute;
		display: grid;
		place-items: center;
		z-index: var(--dry-image-comparison-handle-z-index, 1);
	}

	[data-image-comparison][data-orientation='horizontal'] [data-ic-handle-wrapper] {
		top: 0;
		bottom: 0;
		left: var(--dry-image-comparison-position, 50%);
		translate: -50% 0;
		cursor: ew-resize;
	}

	[data-image-comparison][data-orientation='vertical'] [data-ic-handle-wrapper] {
		left: 0;
		right: 0;
		top: var(--dry-image-comparison-position, 50%);
		translate: 0 -50%;
		cursor: ns-resize;
	}

	[data-ic-handle] {
		display: grid;
		place-items: center;
	}

	[data-ic-handle][data-orientation='horizontal'] {
		cursor: ew-resize;
	}

	[data-ic-handle][data-orientation='vertical'] {
		cursor: ns-resize;
	}

	/* Handle line */
	[data-ic-handle-line] {
		position: absolute;
		background: var(--dry-image-comparison-handle-color, var(--dry-color-bg-overlay));
		box-shadow: var(--dry-image-comparison-handle-shadow, var(--dry-shadow-md));
	}

	[data-ic-handle][data-orientation='horizontal'] [data-ic-handle-line] {
		left: calc(50% - calc(var(--dry-image-comparison-handle-width, 2px) / 2));
		right: calc(50% - calc(var(--dry-image-comparison-handle-width, 2px) / 2));
		top: 0;
		bottom: 0;
	}

	[data-ic-handle][data-orientation='vertical'] [data-ic-handle-line] {
		height: var(--dry-image-comparison-handle-width, 2px);
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
	}

	/* Grip indicator */
	[data-ic-grip] {
		position: relative;
		z-index: var(--dry-image-comparison-grip-z-index, 1);
		aspect-ratio: 1;
		height: var(--dry-space-12);
		border-radius: var(--dry-radius-full);
		background: var(--dry-image-comparison-handle-color, var(--dry-color-bg-overlay));
		box-shadow: var(--dry-image-comparison-handle-shadow, var(--dry-shadow-md));
		display: grid;
		place-items: center;
	}

	[data-ic-grip-arrows] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 0;
		align-items: center;
		gap: var(--dry-space-2);
		color: var(--dry-image-comparison-arrow-color, var(--dry-color-text-strong));
	}

	[data-ic-handle][data-orientation='vertical'] [data-ic-grip-arrows] {
		grid-auto-flow: row;
		grid-auto-columns: 0;
	}

	[data-ic-grip-arrow] {
		height: 0;
		border-style: solid;
	}

	/* Horizontal arrows (left/right) */
	[data-ic-handle][data-orientation='horizontal'] [data-ic-grip-arrow-start] {
		border-width: var(--dry-image-comparison-arrow-width, 5px)
			var(--dry-image-comparison-arrow-width-wide, 6px) var(--dry-image-comparison-arrow-width, 5px)
			0;
		border-color: transparent var(--dry-image-comparison-arrow-color, var(--dry-color-text-strong))
			transparent transparent;
	}

	[data-ic-handle][data-orientation='horizontal'] [data-ic-grip-arrow-end] {
		border-width: var(--dry-image-comparison-arrow-width, 5px) 0
			var(--dry-image-comparison-arrow-width, 5px) var(--dry-image-comparison-arrow-width-wide, 6px);
		border-color: transparent transparent transparent
			var(--dry-image-comparison-arrow-color, var(--dry-color-text-strong));
	}

	/* Vertical arrows (up/down) */
	[data-ic-handle][data-orientation='vertical'] [data-ic-grip-arrow-start] {
		border-width: 0 var(--dry-image-comparison-arrow-width, 5px)
			var(--dry-image-comparison-arrow-width-wide, 6px) var(--dry-image-comparison-arrow-width, 5px);
		border-color: transparent transparent
			var(--dry-image-comparison-arrow-color, var(--dry-color-text-strong)) transparent;
	}

	[data-ic-handle][data-orientation='vertical'] [data-ic-grip-arrow-end] {
		border-width: var(--dry-image-comparison-arrow-width-wide, 6px)
			var(--dry-image-comparison-arrow-width, 5px) 0 var(--dry-image-comparison-arrow-width, 5px);
		border-color: var(--dry-image-comparison-arrow-color, var(--dry-color-text-strong)) transparent
			transparent transparent;
	}

	/* Focus */
	[data-ic-handle-wrapper]:focus-visible [data-ic-grip] {
		outline: var(--dry-focus-ring);
		outline-offset: 2px;
	}
</style>
