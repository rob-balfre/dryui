<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSplitterCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		index?: number;
		children?: Snippet | undefined;
	}

	let { index: indexProp, children, ...rest }: Props = $props();

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
	data-orientation={ctx.orientation}
	onpointerdown={(e) => ctx.startResize(index, e)}
	onkeydown={handleKeyDown}
	{...rest}
>
	{#if children}{@render children()}{/if}
</div>
