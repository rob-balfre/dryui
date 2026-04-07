<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-dialog-footer class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-dialog-footer] {
		--dry-section-padding: var(--dry-dialog-padding);
		--dry-section-border: var(--dry-dialog-border);
		padding: var(--dry-section-padding);
		border-top: 1px solid var(--dry-section-border);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-items: var(--dry-section-footer-justify, start);
		gap: var(--dry-section-footer-gap, var(--dry-space-4));
	}

	@container (max-width: 320px) {
		[data-dialog-footer] {
			grid-auto-flow: row;
			grid-auto-columns: auto;
		}
	}
</style>
