<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div role="img" data-layer-diagram class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-layer-diagram] {
		--dry-layer-radius: var(--dry-radius-2xl);
		--dry-layer-padding: var(--dry-space-6);
		--dry-layer-label-size: var(--dry-type-ui-caption-size, 0.75rem);
		--dry-layer-border-style: solid;

		display: grid;
		color: var(--dry-color-text-strong);
	}
</style>
