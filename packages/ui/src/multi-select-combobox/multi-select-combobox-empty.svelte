<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
</script>

{#if ctx.itemCount === 0}
	<div data-multi-select-empty class={className} {...rest}>
		{@render children()}
	</div>
{/if}

<style>
	[data-multi-select-empty] {
		padding: var(--dry-space-4) var(--dry-space-3);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-weak);
		text-align: center;
	}
</style>
