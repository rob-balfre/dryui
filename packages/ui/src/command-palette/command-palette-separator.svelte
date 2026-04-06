<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
</script>

<div role="separator" data-command-palette-separator class={className} {...rest}></div>

<style>
	[data-command-palette-separator] {
		height: 1px;
		background: var(--dry-cmd-border);
		margin: var(--dry-space-1) 0;
	}
</style>
