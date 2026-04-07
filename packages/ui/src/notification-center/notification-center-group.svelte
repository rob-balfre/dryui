<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		children: Snippet;
	}

	let { label, class: className, children, ...rest }: Props = $props();
</script>

<div role="group" aria-label={label} data-notification-center-group class={className} {...rest}>
	<div role="presentation" data-part="group-header">
		{label}
	</div>
	{@render children()}
</div>

<style>
	[data-part='group-header'] {
		padding: var(--dry-space-2, 0.5rem) var(--dry-nc-item-padding, 0.75rem);
		font-size: var(--dry-type-ui-caption-size, var(--dry-text-xs-size, 0.75rem));
		font-weight: 600;
		color: var(--dry-color-text-weak, #64748b);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--dry-color-fill, #f8fafc);
	}
</style>
