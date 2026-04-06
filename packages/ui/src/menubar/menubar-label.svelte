<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div role="presentation" data-menubar-label class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-menubar-label] {
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		color: var(--dry-color-text-weak);
		font-weight: 500;
	}
</style>
