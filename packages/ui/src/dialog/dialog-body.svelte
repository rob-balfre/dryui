<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-dialog-body class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-dialog-body] {
		--dry-section-padding: var(--dry-dialog-padding);
		padding: var(--dry-section-padding);
		overflow-y: auto;
		min-height: 0;
	}
</style>
