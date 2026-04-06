<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<dt data-description-list-term class={className} {...rest}>
	{@render children()}
</dt>

<style>
	[data-description-list-term] {
		margin: 0;
		font-size: var(--dry-description-list-term-size, var(--dry-type-small-size));
		font-weight: 600;
		color: var(--dry-description-list-term-color, var(--dry-color-text-weak));
	}
</style>
