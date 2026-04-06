<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLegendElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<legend data-fieldset-legend class={className} {...rest}>
	{@render children()}
</legend>

<style>
	[data-fieldset-legend] {
		padding-inline: var(--dry-space-2);
		font-size: var(
			--dry-fieldset-legend-size,
			var(--dry-type-small-size, var(--dry-type-small-size))
		);
		font-weight: 600;
		color: var(--dry-fieldset-legend-color, var(--dry-color-text-strong));
	}
</style>
