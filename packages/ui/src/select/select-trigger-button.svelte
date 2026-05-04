<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';
	import { getSelectCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { size = 'md', children, ...rest }: Props = $props();

	const ctx = getSelectCtx();

	let triggerEl = $state<HTMLButtonElement>();

	$effect(() => {
		if (!triggerEl) return;
		ctx.triggerEl = triggerEl;
		return () => {
			if (ctx.triggerEl === triggerEl) ctx.triggerEl = null;
		};
	});
</script>

<span class="wrapper">
	<button
		bind:this={triggerEl}
		type="button"
		id={ctx.triggerId}
		popovertarget={ctx.contentId}
		aria-haspopup="listbox"
		aria-expanded={ctx.open}
		aria-controls={ctx.open ? ctx.contentId : undefined}
		data-state={ctx.open ? 'open' : 'closed'}
		data-select-trigger
		disabled={ctx.disabled}
		data-disabled={ctx.disabled || undefined}
		{...variantAttrs({ size })}
		{...rest}
	>
		<span data-content>{@render children()}</span>
		<svg
			data-indicator
			data-state={ctx.open ? 'open' : 'closed'}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
		>
	</button>
</span>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	[data-select-trigger] {
		/* Form-control surface. Derives from the shared --dry-form-control-*
		   family so the trigger always matches a sibling <Input>, regardless
		   of ambient --dry-btn-* overrides from a surrounding container's nested radius. */
		--_st-bg: var(--dry-select-trigger-bg, var(--dry-form-control-bg));
		--_st-border: var(--dry-select-trigger-border, var(--dry-form-control-border));
		--_st-color: var(--dry-select-trigger-color, var(--dry-form-control-color));
		--_st-radius: var(--dry-select-trigger-radius, var(--dry-form-control-radius));
		--_st-padding-x: var(--dry-select-trigger-padding-x, var(--dry-form-control-padding-inline));
		--_st-padding-y: var(--dry-select-trigger-padding-y, var(--dry-form-control-padding-block));
		--_st-font-size: var(--dry-select-trigger-font-size, var(--dry-form-control-font-size));

		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding-block: var(--_st-padding-y);
		padding-inline: var(--_st-padding-x);
		font-size: var(--_st-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--_st-color);
		background: var(--_st-bg);
		border: 1px solid var(--_st-border);
		border-radius: var(--_st-radius);
		box-sizing: border-box;
		appearance: none;
		text-align: start;
		cursor: pointer;
		user-select: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-select-trigger] [data-content] {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-select-trigger]:hover:not([data-disabled]) {
		border-color: var(--dry-form-control-border-hover);
	}

	[data-select-trigger]:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-stroke-focus);
		box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
	}

	[data-select-trigger][data-disabled] {
		--dry-select-trigger-bg: var(--dry-color-bg-sunken);
		--dry-select-trigger-border: var(--dry-color-stroke-disabled);
		--dry-select-trigger-color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-select-trigger][aria-invalid='true'] {
		--dry-select-trigger-bg: color-mix(
			in srgb,
			var(--dry-color-fill-error-weak) 70%,
			var(--dry-color-bg-raised)
		);
		--dry-select-trigger-border: var(--dry-color-stroke-error);
	}

	[data-select-trigger][aria-invalid='true']:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-error-strong);
	}

	[data-select-trigger][aria-invalid='true']:focus-visible {
		outline-color: var(--dry-color-fill-error);
		border-color: var(--dry-color-stroke-error);
	}

	[data-select-trigger][data-size='sm'] {
		--dry-select-trigger-padding-x: var(--dry-space-2);
		--dry-select-trigger-padding-y: var(--dry-space-1);
		--dry-select-trigger-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-select-trigger][data-size='md'] {
		--dry-select-trigger-padding-x: var(--dry-space-3);
		--dry-select-trigger-padding-y: var(--dry-space-2);
		--dry-select-trigger-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-select-trigger][data-size='lg'] {
		--dry-select-trigger-padding-x: var(--dry-space-4);
		--dry-select-trigger-padding-y: var(--dry-space-2_5);
		--dry-select-trigger-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	svg[data-indicator] {
		height: 1em;
		aspect-ratio: 1;
		place-self: center;
		opacity: 0.5;
		transform-origin: center;
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-spring-snappy),
			transform var(--dry-duration-fast) var(--dry-ease-spring-snappy);
	}

	svg[data-indicator][data-state='open'] {
		opacity: 1;
		transform: scale(1.05);
	}

	@media (prefers-reduced-motion: reduce) {
		svg[data-indicator] {
			transition: none;
		}
	}
</style>
