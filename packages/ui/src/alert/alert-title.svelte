<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<h5 data-alert-title class={className} {...rest}>
	{@render children()}
</h5>

<style>
	[data-alert-title] {
		font-size: var(--dry-type-heading-4-size);
		font-weight: 600;
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-strong);
		margin: 0;
	}
</style>
