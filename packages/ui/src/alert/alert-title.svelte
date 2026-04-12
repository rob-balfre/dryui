<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { markDirectChild } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<h5 data-alert-title {@attach markDirectChild} class={className} {...rest}>
	{@render children()}
</h5>

<style>
	[data-alert-title][data-alert-direct-child] {
		grid-column: 2;
	}

	[data-alert-title] {
		font-size: var(--dry-type-heading-4-size);
		font-weight: 600;
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-strong);
		margin: 0;
	}
</style>
