<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		heading?: string;
		children: Snippet;
	}

	let { heading, class: className, children, ...rest }: Props = $props();
</script>

<div role="group" data-command-palette-group aria-label={heading} class={className} {...rest}>
	{#if heading}
		<div role="presentation" data-command-palette-group-heading>{heading}</div>
	{/if}
	{@render children()}
</div>

<style>
	[data-command-palette-group]:not(:first-child) {
		border-top: 1px solid var(--dry-cmd-border);
		margin-top: var(--dry-space-1);
		padding-top: var(--dry-space-1);
	}

	[data-command-palette-group]:not(:has([role='option'])) {
		display: none;
	}

	[data-command-palette-group-heading] {
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		color: var(--dry-color-text-weak);
		font-weight: 500;
	}
</style>
