<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<p data-fieldset-description class={className} {...rest}>
	{@render children()}
</p>

<style>
	[data-fieldset-description] {
		margin: 0;
		font-size: var(
			--dry-fieldset-description-size,
			var(--dry-type-small-size, var(--dry-type-small-size))
		);
		line-height: 1.6;
		color: var(--dry-fieldset-description-color, var(--dry-color-text-weak));
	}
</style>
