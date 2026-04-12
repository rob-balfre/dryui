<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { markDirectChild } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<p data-alert-description {@attach markDirectChild} class={className} {...rest}>
	{@render children()}
</p>

<style>
	[data-alert-description][data-alert-direct-child] {
		grid-column: 2;
	}

	[data-alert-description] {
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-weak);
		margin: 0;
	}
</style>
