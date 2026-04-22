<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span data-chip-group-label class={className} {...rest}>
	{@render children()}
</span>

<style>
	[data-chip-group-label] {
		display: inline-block;
		font-size: var(--dry-chip-group-label-size, var(--dry-type-tiny-size, var(--dry-text-xs-size)));
		font-weight: var(--dry-chip-group-label-weight, 600);
		letter-spacing: var(--dry-chip-group-label-tracking, 0.1em);
		line-height: var(--dry-chip-group-label-leading, 1.2);
		text-transform: uppercase;
		color: var(--dry-chip-group-label-color, var(--dry-color-text-weak));
	}
</style>
