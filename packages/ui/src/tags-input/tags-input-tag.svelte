<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTagsInputCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		index: number;
		value: string;
		children?: Snippet;
	}

	let { index, value, class: className, children, ...rest }: Props = $props();

	const ctx = getTagsInputCtx();
</script>

<span
	data-part="tag"
	data-disabled={ctx.disabled || undefined}
	data-index={index}
	class={className}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		{value}
	{/if}
</span>

<style>
	[data-part='tag'] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		vertical-align: middle;
		align-items: center;
		padding-block: var(--dry-space-1);
		padding-inline-start: var(--dry-tags-input-tag-padding-x, var(--dry-space-2));
		padding-inline-end: 0;
		margin-inline-end: var(--dry-tags-input-gap, var(--dry-space-1_5));
		margin-block: calc(var(--dry-tags-input-gap, var(--dry-space-1_5)) / 2);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 15%, transparent);
		color: var(--dry-color-fill-brand);
		border-radius: var(--dry-tags-input-tag-radius, var(--dry-radius-md));
		overflow: hidden;
		font-size: var(
			--dry-tags-input-tag-font-size,
			var(--dry-type-tiny-size, var(--dry-text-xs-size))
		);
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.5;
		white-space: nowrap;
		user-select: none;
		--dry-btn-radius: 0;
		--dry-btn-padding-x: var(--dry-tags-input-tag-padding-x, var(--dry-space-2));
		--dry-btn-padding-y: 0;
		--dry-btn-font-size: inherit;
	}
</style>
