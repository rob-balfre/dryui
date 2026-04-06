<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<caption class={className} {...rest}>
	{@render children()}
</caption>

<style>
	caption {
		padding: var(--dry-table-padding-y) var(--dry-table-padding-x);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-weak);
		text-align: left;
		caption-side: bottom;
	}
</style>
