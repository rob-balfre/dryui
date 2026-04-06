<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div role="status" aria-live="polite" data-combobox-empty class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-combobox-empty] {
		padding: var(--dry-space-4) var(--dry-space-3);
		font-size: var(--dry-type-small-size);
		color: var(--dry-color-text-weak);
		text-align: center;
	}
</style>
