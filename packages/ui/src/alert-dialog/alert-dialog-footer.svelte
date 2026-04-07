<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-alert-dialog-footer class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-alert-dialog-footer] {
		--dry-section-padding: var(--dry-dialog-padding);
		--dry-section-border: var(--dry-dialog-border);
		padding: var(--dry-section-padding);
		border-top: 1px solid var(--dry-section-border);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-4);
		justify-content: start;
		justify-items: start;
	}
</style>
