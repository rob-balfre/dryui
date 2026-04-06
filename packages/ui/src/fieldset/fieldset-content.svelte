<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-fieldset-content class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-fieldset-content] {
		display: grid;
		gap: var(--dry-fieldset-content-gap, var(--dry-space-4));
	}
</style>
