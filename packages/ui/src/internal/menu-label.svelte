<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		className?: HTMLAttributes<HTMLDivElement>['class'];
		children: Snippet;
	}

	let { className, children, ...rest }: Props = $props();
</script>

<div role="presentation" class={className} {...rest}>
	{@render children()}
</div>

<style>
	div {
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		color: var(--dry-color-text-weak);
		font-weight: 500;
	}
</style>
