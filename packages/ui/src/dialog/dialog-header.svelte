<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDialogCtx();
</script>

<div data-dialog-header id={ctx.headerId} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-dialog-header] {
		--dry-section-padding: var(--dry-dialog-padding);
		--dry-section-border: var(--dry-dialog-border);
		padding: var(--dry-section-padding);
		border-bottom: 1px solid var(--dry-section-border);
	}
</style>
