<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<div data-alert-dialog-header id={ctx.headerId} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-alert-dialog-header] {
		--dry-section-padding: var(--dry-dialog-padding);
		--dry-section-border: var(--dry-dialog-border);
		padding: var(--dry-section-padding);
		border-bottom: 1px solid var(--dry-section-border);
	}
</style>
