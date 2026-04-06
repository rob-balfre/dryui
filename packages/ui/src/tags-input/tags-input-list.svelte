<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div data-part="list" class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='list'] {
		display: contents;
	}
</style>
