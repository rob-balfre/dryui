<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { getListCtx } from './context.svelte.js';

	interface Props extends Omit<
		HTMLAttributes<HTMLLIElement>,
		'children' | 'class' | 'onclick' | 'onkeydown' | 'aria-label' | 'aria-labelledby' | 'title'
	> {
		interactive?: boolean;
		disabled?: boolean;
		class?: HTMLAttributes<HTMLLIElement>['class'];
		children: Snippet;
		onclick?: HTMLButtonAttributes['onclick'];
		onkeydown?: HTMLButtonAttributes['onkeydown'];
		'aria-label'?: HTMLButtonAttributes['aria-label'];
		'aria-labelledby'?: HTMLButtonAttributes['aria-labelledby'];
		title?: string;
	}

	let {
		interactive = false,
		disabled = false,
		class: className,
		children,
		onclick,
		onkeydown,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		title,
		...rest
	}: Props = $props();

	const ctx = getListCtx();
</script>

<li
	data-interactive={interactive || undefined}
	data-disabled={disabled || undefined}
	data-dense={ctx.dense || undefined}
	class={className}
	{...rest}
>
	{#if interactive}
		<button
			type="button"
			data-list-item-surface
			{disabled}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			{title}
			{onclick}
			{onkeydown}
		>
			{@render children()}
		</button>
	{:else}
		<div data-list-item-surface>
			{@render children()}
		</div>
	{/if}
</li>

<style>
	[data-list-item-surface] {
		width: 100%;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-list-item-gap, 0);
		padding: var(--dry-list-item-padding, 0);
		border: 0;
		border-radius: var(--dry-list-item-radius, 0);
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		appearance: none;
	}

	[data-interactive='true'] > [data-list-item-surface] {
		cursor: pointer;
	}

	[data-disabled='true'] > [data-list-item-surface] {
		cursor: not-allowed;
	}
</style>
