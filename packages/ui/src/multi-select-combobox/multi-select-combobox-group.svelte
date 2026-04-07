<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		children: Snippet;
	}

	let { class: className, label, children, ...rest }: Props = $props();
</script>

<div data-multi-select-group data-part="group" class={className} {...rest}>
	<div data-part="group-label">{label}</div>
	{@render children()}
</div>

<style>
	[data-multi-select-group] [data-part='group-label'] {
		padding: var(--dry-space-1_5) var(--dry-space-2);
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		font-weight: 600;
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	[data-multi-select-group]:not(:first-of-type) {
		border-top: 1px solid var(--dry-color-stroke-weak);
		margin-top: var(--dry-space-1);
		padding-top: var(--dry-space-1);
	}
</style>
