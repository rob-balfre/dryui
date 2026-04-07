<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<li role="presentation" data-list-subheader class={className} {...rest}>
	{@render children()}
</li>

<style>
	[data-list-subheader] {
		padding: var(--dry-space-1_5) var(--dry-space-3) var(--dry-space-1);
		font-size: var(--dry-list-secondary-size);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--dry-list-subheader-color);
	}
</style>
