<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
</script>

<div role="list" data-empty={ctx.value.length === 0 || undefined} {...rest}>
	{@render children()}
</div>
