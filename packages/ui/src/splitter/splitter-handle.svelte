<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSplitterCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		index?: number;
		children?: Snippet;
	}

	let { index: indexProp, class: className, children, ...rest }: Props = $props();

	const ctx = getSplitterCtx();
	const autoIndex = ctx.nextHandleIndex();
	const index = $derived(indexProp ?? autoIndex);

	function handleKeyDown(e: KeyboardEvent) {
		const step = 1;
		const sizes = ctx.sizes;
		const minSize = 10;
		const isHorizontal = ctx.orientation === 'horizontal';
		const shrinkKeys = isHorizontal ? ['ArrowLeft'] : ['ArrowUp'];
		const growKeys = isHorizontal ? ['ArrowRight'] : ['ArrowDown'];

		const leftSize = sizes[index];
		const rightSize = sizes[index + 1];
		if (leftSize === undefined || rightSize === undefined) return;

		let newLeft = leftSize;
		let newRight = rightSize;

		if (shrinkKeys.includes(e.key)) {
			e.preventDefault();
			newLeft -= step;
			newRight += step;
		} else if (growKeys.includes(e.key)) {
			e.preventDefault();
			newLeft += step;
			newRight -= step;
		} else
			switch (e.key) {
				case 'Home': {
					e.preventDefault();
					const delta = newLeft - minSize;
					newLeft = minSize;
					newRight += delta;
					break;
				}
				case 'End': {
					e.preventDefault();
					const delta = newRight - minSize;
					newRight = minSize;
					newLeft += delta;
					break;
				}
				default:
					return;
			}

		if (newLeft >= minSize && newRight >= minSize) {
			const newSizes = [...sizes];
			newSizes[index] = newLeft;
			newSizes[index + 1] = newRight;
			ctx.setSizes(newSizes);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="separator"
	aria-orientation={ctx.orientation}
	tabindex={0}
	aria-valuenow={Math.round(ctx.sizes[index] ?? 0)}
	aria-valuemin={10}
	aria-valuemax={Math.round((ctx.sizes[index] ?? 0) + (ctx.sizes[index + 1] ?? 0) - 10)}
	data-part="handle"
	data-orientation={ctx.orientation}
	class={className}
	onpointerdown={(e) => ctx.startResize(index, e)}
	onkeydown={handleKeyDown}
	{...rest}
>
	{#if children}{@render children()}{/if}
</div>

<style>
	[data-part='handle'] {
		--dry-splitter-handle-z-index: 1;

		position: relative;
		display: grid;
		place-items: center;
		background: transparent;
		touch-action: none;
		user-select: none;
	}

	[data-part='handle'][data-orientation='horizontal'] {
		grid-template-columns: 8px;
		margin-inline: -3px;
		cursor: col-resize;
		z-index: var(--dry-splitter-handle-z-index);
	}

	[data-part='handle'][data-orientation='vertical'] {
		height: 8px;
		margin-block: -3px;
		cursor: row-resize;
		z-index: var(--dry-splitter-handle-z-index);
	}

	/* Visible thin line */
	[data-part='handle']::before {
		content: '';
		position: absolute;
		background: var(--dry-color-stroke-weak);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='handle'][data-orientation='horizontal']::before {
		inset-block: 0;
		inset-inline: calc(50% - 0.5px);
	}

	[data-part='handle'][data-orientation='vertical']::before {
		height: 1px;
		inset-inline: 0;
		top: 50%;
		transform: translateY(-50%);
	}

	[data-part='handle']:hover::before {
		background: var(--dry-color-fill-brand);
	}

	[data-part='handle']:active::before {
		background: var(--dry-color-fill-brand);
	}

	[data-part='handle']:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -2px;
	}

	/* Grip dot — always visible */
	[data-part='handle']::after {
		content: '';
		display: block;
		border-radius: var(--dry-radius-full);
		background: var(--dry-color-text-weak);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
		z-index: 1;
	}

	[data-part='handle'][data-orientation='horizontal']::after {
		display: grid;
		grid-template-columns: 4px;
		height: 20px;
	}

	[data-part='handle'][data-orientation='vertical']::after {
		display: grid;
		grid-template-columns: 20px;
		height: 4px;
	}

	[data-part='handle']:hover::after {
		background: var(--dry-color-fill-brand);
	}
</style>
