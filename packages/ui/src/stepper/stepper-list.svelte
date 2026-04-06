<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStepperCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLOListElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getStepperCtx();
</script>

<ol role="list" data-part="list" data-orientation={ctx.orientation} class={className} {...rest}>
	{@render children()}
</ol>

<style>
	[data-part='list'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	[data-part='list'][data-orientation='vertical'] {
		grid-auto-flow: row;
		grid-auto-rows: auto;
		grid-auto-columns: unset;
		align-items: stretch;
	}
</style>
