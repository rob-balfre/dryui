<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSplitterCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		index?: number;
		children: Snippet;
	}

	let { index: indexProp, class: className, children, ...rest }: Props = $props();

	const ctx = getSplitterCtx();
	const autoIndex = ctx.nextPanelIndex();
	const index = $derived(indexProp ?? autoIndex);
</script>

<div data-part="panel" data-panel={index} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='panel'] {
		overflow: auto;
		min-height: 0;
		height: 100%;
	}
</style>
