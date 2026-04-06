<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<table data-dg-table class={className} {...rest}>
	{@render children()}
</table>

<style>
	[data-dg-table] {
		border-collapse: collapse;
		border-spacing: 0;
	}
</style>
