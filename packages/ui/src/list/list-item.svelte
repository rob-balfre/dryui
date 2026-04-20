<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getListCtx } from './context.svelte.js';

	interface Props extends Omit<
		HTMLAttributes<HTMLLIElement>,
		'children' | 'class' | 'onclick' | 'onkeydown' | 'aria-label' | 'aria-labelledby' | 'title'
	> {
		interactive?: boolean;
		disabled?: boolean;
		class?: ClassValue;
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
	data-list-item
	data-interactive={interactive || undefined}
	data-disabled={disabled || undefined}
	data-dense={ctx.dense || undefined}
	class={className}
	{...rest}
>
	{#if interactive}
		<Button
			variant="secondary"
			{disabled}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			{title}
			{onclick}
			{onkeydown}
		>
			<span data-list-item-surface>
				{@render children()}
			</span>
		</Button>
	{:else}
		<div data-list-item-surface>
			{@render children()}
		</div>
	{/if}
</li>

<style>
	[data-list-item] {
		display: grid;
		list-style: none;
	}

	[data-list-item-surface] {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-list-item-gap);
		padding: var(--dry-list-item-padding);
		border: 0;
		border-radius: var(--dry-list-item-radius);
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-list-item][data-interactive='true'] {
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: inherit;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-min-height: 0;
		--dry-btn-accent: var(--dry-list-item-active-bg);
		--dry-btn-accent-fg: inherit;
		--dry-btn-accent-stroke: transparent;
		--dry-btn-accent-weak: var(--dry-list-item-hover-bg);
		--dry-btn-on-accent: inherit;
		--dry-btn-radius: var(--dry-list-item-radius);
		box-shadow: none;
		cursor: pointer;
	}

	[data-list-item][data-disabled='true'] {
		opacity: var(--dry-state-disabled-opacity);
	}

	[data-list-item][data-dense='true'] {
		--dry-list-item-padding: var(--dry-space-1_5) var(--dry-space-2);
	}
</style>
