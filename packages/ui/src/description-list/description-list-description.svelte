<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<dd data-description-list-dd class={className} {...rest}>
	{@render children()}
</dd>

<style>
	[data-description-list-dd] {
		margin: 0;
		font-size: var(--dry-description-list-description-size, var(--dry-type-small-size));
		line-height: 1.6;
		color: var(--dry-description-list-description-color, var(--dry-color-text-strong));
	}
</style>
