<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
</script>

<div role="separator" data-dropdown-menu-separator class={className} {...rest}></div>

<style>
	[data-dropdown-menu-separator] {
		height: 1px;
		background: var(--dry-color-stroke-weak);
		margin: var(--dry-space-1) 0;
	}
</style>
