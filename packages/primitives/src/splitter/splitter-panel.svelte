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
</script>

<div data-panel={index} {...rest}>
	{@render children()}
</div>
