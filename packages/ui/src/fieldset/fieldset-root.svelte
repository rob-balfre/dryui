<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLFieldSetElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<fieldset data-fieldset class={className} {...rest}>
	{@render children()}
</fieldset>

<style>
	[data-fieldset] {
		display: grid;
		gap: var(--dry-fieldset-gap, var(--dry-space-4));
		margin: 0;
		padding: var(--dry-fieldset-padding, var(--dry-space-5));
		border: 1px solid
			var(--dry-fieldset-border, var(--dry-surface-border, var(--dry-color-stroke-weak)));
		border-radius: var(--dry-fieldset-radius, var(--dry-surface-radius, var(--dry-radius-lg)));
		background: var(--dry-fieldset-bg, var(--dry-surface-bg, var(--dry-color-bg-raised)));
	}
</style>
