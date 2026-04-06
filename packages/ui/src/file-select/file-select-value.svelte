<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		placeholder?: string;
	}

	let { placeholder = 'No file selected', class: className, ...rest }: Props = $props();
	const ctx = getFileSelectCtx();
</script>

<span
	data-fs-value
	data-placeholder={!ctx.value || undefined}
	data-loading={ctx.loading || undefined}
	{...rest}
	class={className}
>
	{#if ctx.loading}
		Selecting…
	{:else}
		{ctx.value ?? placeholder}
	{/if}
</span>

<style>
	[data-fs-value] {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--dry-type-small-size);
		color: var(--dry-color-text-strong);
	}

	[data-fs-value][data-placeholder] {
		color: var(--dry-color-text-weak);
	}

	[data-fs-value][data-loading] {
		color: var(--dry-color-text-weak);
	}
</style>
