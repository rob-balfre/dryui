<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDropdownMenuCtx } from './context.svelte.js';

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

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDropdownMenuCtx();

	let wrapperEl = $state<HTMLDivElement>();

	function getTriggerElement(wrapper: HTMLElement | null | undefined): HTMLElement | null {
		if (!wrapper) return null;
		if (wrapper.matches(TRIGGER_SELECTOR)) return wrapper;
		return wrapper.querySelector<HTMLElement>(TRIGGER_SELECTOR);
	}

	$effect(() => {
		const triggerEl = getTriggerElement(wrapperEl);
		if (!triggerEl) return;

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;
		triggerEl.setAttribute('popovertarget', ctx.contentId);
		triggerEl.setAttribute('aria-haspopup', 'menu');
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		if (ctx.open) {
			triggerEl.setAttribute('aria-controls', ctx.contentId);
		} else {
			triggerEl.removeAttribute('aria-controls');
		}
		triggerEl.setAttribute('data-state', ctx.open ? 'open' : 'closed');

		return () => {
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<div bind:this={wrapperEl} data-dropdown-trigger-wrap {...rest}>
	{@render children()}
</div>

<style>
	[data-dropdown-trigger-wrap] {
		display: contents;
	}
</style>
