<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { class: className, ...rest }: Props = $props();
</script>

<span aria-hidden="true" data-pagination-ellipsis class={className} {...rest}>&hellip;</span>

<style>
	[data-pagination-ellipsis] {
		display: inline-grid;
		grid-template-columns: var(--dry-space-10);
		place-items: center;
		height: var(--dry-space-10);
		color: var(--dry-color-text-disabled);
	}
</style>
