<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDListElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<dl data-description-list class={className} {...rest}>
	{@render children()}
</dl>

<style>
	[data-description-list] {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-description-list-gap, var(--dry-space-4));
	}
</style>
