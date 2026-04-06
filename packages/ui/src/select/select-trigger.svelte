<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';

	const TRIGGER_SELECTOR = [
		'button',
		'[href]',
		'input:not([type="hidden"])',
		'select',
		'textarea',
		'[tabindex]:not([tabindex="-1"])',
		'[contenteditable="true"]',
		'summary'
	].join(', ');

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { class: className, size = 'md', children, ...rest }: Props = $props();

	const ctx = getSelectCtx();

	let wrapperEl = $state<HTMLDivElement>();

	function getTriggerElement(wrapper: HTMLElement | null | undefined): HTMLElement | null {
		if (!wrapper) return null;
		if (wrapper.matches(TRIGGER_SELECTOR)) return wrapper;
		return wrapper.querySelector<HTMLElement>(TRIGGER_SELECTOR);
	}

	function setDisabledState(triggerEl: HTMLElement, disabled: boolean) {
		if (disabled) {
			triggerEl.setAttribute('aria-disabled', 'true');
			triggerEl.setAttribute('data-disabled', '');
		} else {
			triggerEl.removeAttribute('aria-disabled');
			triggerEl.removeAttribute('data-disabled');
		}

		if (
			triggerEl instanceof HTMLButtonElement ||
			triggerEl instanceof HTMLInputElement ||
			triggerEl instanceof HTMLSelectElement ||
			triggerEl instanceof HTMLTextAreaElement
		) {
			triggerEl.disabled = disabled;
		}
	}

	$effect(() => {
		const triggerEl = getTriggerElement(wrapperEl);
		if (!triggerEl) return;

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;
		triggerEl.setAttribute('popovertarget', ctx.contentId);
		triggerEl.setAttribute('aria-haspopup', 'listbox');
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		if (ctx.open) {
			triggerEl.setAttribute('aria-controls', ctx.contentId);
		} else {
			triggerEl.removeAttribute('aria-controls');
		}
		triggerEl.setAttribute('data-state', ctx.open ? 'open' : 'closed');
		setDisabledState(triggerEl, ctx.disabled);

		return () => {
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<div bind:this={wrapperEl} data-select-trigger-wrap>
	<button type="button" data-select-trigger data-size={size} class={className} {...rest}>
		{@render children()}
	</button>
</div>

<style>
	[data-select-trigger-wrap] {
		display: contents;
	}

	[data-select-trigger] {
		--dry-select-bg: var(--dry-color-bg-raised);
		--dry-select-border: var(--dry-color-stroke-strong);
		--dry-select-color: var(--dry-color-text-strong);
		--dry-select-padding-x: var(--dry-space-4);
		--dry-select-padding-y: var(--dry-space-2);
		--dry-select-font-size: var(--dry-type-small-size);

		display: grid;
		grid-template-columns: 1fr 1.5rem;
		align-items: center;
		padding: var(--dry-select-padding-y) var(--dry-select-padding-x);
		font-size: var(--dry-select-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-select-color);
		background: var(--dry-select-bg);
		border: 1px solid var(--dry-select-border);
		border-radius: var(--dry-select-radius, var(--dry-radius-md));
		cursor: pointer;
		text-align: left;
		box-sizing: border-box;
		appearance: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-select-trigger]::after {
		content: '';
		height: 1em;
		aspect-ratio: 1;
		place-self: center;
		background: currentColor;
		mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		mask-size: contain;
		mask-repeat: no-repeat;
		mask-position: center;
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-select-trigger][data-state='open']::after {
		transform: rotate(180deg);
	}

	[data-select-trigger]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-select-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
		border-color: var(--dry-color-stroke-focus);
	}

	[data-select-trigger][data-disabled] {
		--dry-select-bg: var(--dry-color-bg-sunken);
		--dry-select-border: var(--dry-color-stroke-disabled);
		--dry-select-color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-select-trigger][aria-invalid='true'],
	[data-select-trigger][data-invalid] {
		--dry-select-bg: color-mix(
			in srgb,
			var(--dry-color-fill-error-weak) 70%,
			var(--dry-color-bg-raised)
		);
		--dry-select-border: var(--dry-color-stroke-error);
	}

	[data-select-trigger][aria-invalid='true']:hover:not([data-disabled]),
	[data-select-trigger][data-invalid]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-error-strong);
	}

	[data-select-trigger][aria-invalid='true']:focus-visible,
	[data-select-trigger][data-invalid]:focus-visible {
		outline-color: var(--dry-color-fill-error);
		border-color: var(--dry-color-stroke-error);
	}

	/* Size variants */
	[data-select-trigger][data-size='sm'] {
		--dry-select-padding-x: var(--dry-space-2);
		--dry-select-padding-y: var(--dry-space-1);
		--dry-select-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-select-trigger][data-size='md'] {
		--dry-select-padding-x: var(--dry-space-3);
		--dry-select-padding-y: var(--dry-space-2);
		--dry-select-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-select-trigger][data-size='lg'] {
		--dry-select-padding-x: var(--dry-space-4);
		--dry-select-padding-y: var(--dry-space-2_5);
		--dry-select-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	@container (max-width: 200px) {
		[data-select-trigger] {
			--dry-select-padding-x: var(--dry-space-2);
		}
	}
</style>
