<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
</script>

<div
	role="list"
	data-multi-select-selection-list
	data-empty={ctx.value.length === 0 || undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-multi-select-selection-list] {
		display: contents;
	}
</style>
