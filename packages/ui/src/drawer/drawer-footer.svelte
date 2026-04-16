<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-drawer-footer class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-drawer-footer] {
		grid-row: 3;
		padding: var(--dry-space-6) var(--dry-space-8);
		border-top: 1px solid var(--dry-drawer-border);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}
</style>
