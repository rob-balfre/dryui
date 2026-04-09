<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDatePickerCtx } from './context.svelte.js';
	import { formatDate } from '@dryui/primitives';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet | undefined;
	}

	let {
		placeholder = 'Select date',
		children,
		class: className,
		size = 'md',
		...rest
	}: Props = $props();

	const ctx = getDatePickerCtx();

	function bindTrigger(node: HTMLButtonElement) {
		ctx.triggerEl = node;

		return {
			destroy() {
				if (ctx.triggerEl === node) {
					ctx.triggerEl = null;
				}
			}
		};
	}

	const displayText = $derived(
		ctx.value
			? formatDate(ctx.value, ctx.locale, { year: 'numeric', month: 'long', day: 'numeric' })
			: ''
	);
</script>

<button
	{@attach bindTrigger}
	id={ctx.triggerId}
	type="button"
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={ctx.disabled ? '' : undefined}
	data-dp-trigger
	disabled={ctx.disabled}
	popovertarget={ctx.contentId}
	class={className}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-placeholder={!ctx.value ? '' : undefined}>
			{displayText || placeholder}
		</span>
	{/if}
	<svg
		data-indicator
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
		><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line
			x1="16"
			y1="2"
			x2="16"
			y2="6"
		/><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg
	>
</button>

<style>
	[data-dp-trigger] {
		--dry-dp-bg: var(--dry-color-bg-raised);
		--dry-dp-border: var(--dry-color-stroke-strong);
		--dry-dp-padding-x: var(--dry-space-3);
		--dry-dp-padding-y: var(--dry-space-2);
		--dry-dp-font-size: var(--dry-type-small-size);

		display: inline-grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
		min-height: var(--dry-space-12);
		padding: var(--dry-dp-padding-y) var(--dry-dp-padding-x);
		font-size: var(--dry-dp-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-dp-color, var(--dry-color-text-strong));
		background: var(--dry-dp-bg);
		border: 1px solid var(--dry-dp-border);
		border-radius: var(--dry-dp-radius, var(--dry-radius-md));
		cursor: pointer;
		text-align: left;
		box-sizing: border-box;
		appearance: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dp-trigger] [data-indicator] {
		height: 1rem;
		aspect-ratio: 1;
		opacity: 0.6;
	}

	[data-dp-trigger]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-dp-trigger]:active:not([data-disabled]) {
		transform: translateY(1px);
	}

	[data-dp-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-focus-ring);
	}

	[data-dp-trigger][data-disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	[data-dp-trigger] [data-placeholder] {
		color: var(--dry-color-text-weak);
	}

	[data-dp-trigger][aria-invalid='true'],
	[data-dp-trigger][data-invalid] {
		--dry-dp-bg: color-mix(in srgb, var(--dry-color-fill-error) 6%, var(--dry-color-bg-raised));
		--dry-dp-border: var(--dry-color-fill-error);
	}

	[data-dp-trigger][aria-invalid='true']:hover:not([data-disabled]),
	[data-dp-trigger][data-invalid]:hover:not([data-disabled]) {
		border-color: var(--dry-color-fill-error-hover);
	}

	[data-dp-trigger][aria-invalid='true']:focus-visible,
	[data-dp-trigger][data-invalid]:focus-visible {
		outline-color: var(--dry-color-fill-error);
		border-color: var(--dry-color-fill-error);
	}

	[data-dp-trigger][data-size='sm'] {
		--dry-dp-padding-x: var(--dry-space-2);
		--dry-dp-padding-y: var(--dry-space-1_5);
		--dry-dp-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-dp-trigger][data-size='md'] {
		--dry-dp-padding-x: var(--dry-space-3);
		--dry-dp-padding-y: var(--dry-space-2);
		--dry-dp-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-dp-trigger][data-size='lg'] {
		--dry-dp-padding-x: var(--dry-space-4);
		--dry-dp-padding-y: var(--dry-space-2_5);
		--dry-dp-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	@container (max-width: 240px) {
		[data-dp-trigger] {
			--dry-dp-padding-x: var(--dry-space-2);
		}
	}
</style>
