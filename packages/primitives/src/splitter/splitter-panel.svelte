<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSplitterCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		index?: number;
		children: Snippet;
	}

	let { index: indexProp, children, ...rest }: Props = $props();

	const ctx = getSplitterCtx();
	const autoIndex = ctx.nextPanelIndex();
	const index = $derived(indexProp ?? autoIndex);

	const size = $derived(ctx.sizes[index]);

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('flex-basis', `${size}%`);
			node.style.setProperty('flex-grow', '0');
			node.style.setProperty('flex-shrink', '0');
			node.style.setProperty('overflow', 'auto');
		});
	}
</script>

<div data-panel={index} use:applyStyles {...rest}>
	{@render children()}
</div>
