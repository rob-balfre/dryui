<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span aria-hidden="true" data-alert-icon class={className} {...rest}>
	{@render children()}
</span>

<style>
	[data-alert-icon] {
		grid-column: 1;
		grid-row: 1 / 3;
		color: var(--dry-alert-icon-color);
		display: grid;
		align-items: center;
		margin-top: var(--dry-space-0_5);
	}
</style>
