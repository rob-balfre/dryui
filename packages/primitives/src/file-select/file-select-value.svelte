<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		placeholder?: string;
	}

	let { placeholder = 'No file selected', ...rest }: Props = $props();
	const ctx = getFileSelectCtx();
</script>

<span data-placeholder={!ctx.value || undefined} data-loading={ctx.loading || undefined} {...rest}>
	{#if ctx.loading}
		Selecting…
	{:else}
		{ctx.value ?? placeholder}
	{/if}
</span>
