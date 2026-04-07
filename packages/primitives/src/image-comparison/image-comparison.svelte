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

	function syncStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = `${style ? `${style}; ` : ''}--dry-image-comparison-position: ${position}%`;
		});
	}

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
		const containerEl = handleEl.closest<HTMLElement>('.root');
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

<div
	{@attach syncStyles}
	data-orientation={orientation}
	data-dragging={dragging || undefined}
	class={['root', className]}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	{...rest}
>
	<div data-part="after" class="layer">
		{@render after()}
	</div>
	<div data-part="before" class="layer before">
		{@render before()}
	</div>
	<div
		data-part="handle"
		class="handle"
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
			<div data-part="handle-default" class="handleDefault"></div>
		{/if}
	</div>
</div>

<style>
	.root {
		--dry-image-comparison-handle-z-index: 1;
		position: relative;
		display: grid;
		height: 100%;
		overflow: hidden;
		touch-action: none;
		user-select: none;
		--dry-image-comparison-handle-width: 2px;
		--dry-image-comparison-handle-color: var(--dry-color-bg-overlay, Canvas);
		--dry-image-comparison-handle-shadow: var(--dry-shadow-md);
		--dry-image-comparison-radius: var(--dry-radius-lg);
		border-radius: var(--dry-image-comparison-radius);
	}

	.layer {
		grid-area: 1 / 1;
		min-height: 0;
	}

	.root[data-orientation='horizontal'] .before {
		clip-path: inset(0 calc(100% - var(--dry-image-comparison-position)) 0 0);
	}

	.root[data-orientation='vertical'] .before {
		clip-path: inset(0 0 calc(100% - var(--dry-image-comparison-position)) 0);
	}

	.handle {
		position: absolute;
		display: grid;
		place-items: center;
		z-index: var(--dry-image-comparison-handle-z-index);
	}

	.root[data-orientation='horizontal'] .handle {
		top: 0;
		bottom: 0;
		left: var(--dry-image-comparison-position);
		width: 0;
		cursor: ew-resize;
	}

	.root[data-orientation='vertical'] .handle {
		left: 0;
		right: 0;
		top: var(--dry-image-comparison-position);
		height: 0;
		cursor: ns-resize;
	}

	.handleDefault {
		position: absolute;
		background: var(--dry-image-comparison-handle-color);
		box-shadow: var(--dry-image-comparison-handle-shadow);
		border-radius: var(--dry-radius-full, 9999px);
	}

	.root[data-orientation='horizontal'] .handleDefault {
		top: 0;
		bottom: 0;
		width: var(--dry-image-comparison-handle-width);
		transform: translateX(-50%);
	}

	.root[data-orientation='vertical'] .handleDefault {
		left: 0;
		right: 0;
		height: var(--dry-image-comparison-handle-width);
		transform: translateY(-50%);
	}
</style>
