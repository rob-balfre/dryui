<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTooltipCtx } from './context.svelte.js';

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

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getTooltipCtx();

	let spanEl = $state<HTMLSpanElement>();

	function getTriggerElement(wrapper: HTMLElement | null | undefined): HTMLElement | null {
		if (!wrapper) return null;
		if (wrapper.matches(TRIGGER_SELECTOR)) return wrapper;
		return wrapper.querySelector<HTMLElement>(TRIGGER_SELECTOR);
	}

	$effect(() => {
		const triggerEl = getTriggerElement(spanEl) ?? spanEl ?? null;

		if (!triggerEl) {
			return;
		}

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;

		if (ctx.open) {
			triggerEl.setAttribute('aria-describedby', ctx.contentId);
		} else {
			triggerEl.removeAttribute('aria-describedby');
		}

		return () => {
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<span
	bind:this={spanEl}
	data-tooltip-trigger
	class={className}
	onmouseenter={() => ctx.show()}
	onmouseleave={() => ctx.close()}
	onfocusin={() => ctx.showImmediate()}
	onfocusout={() => ctx.closeImmediate()}
	{...rest}
>
	{@render children()}
</span>

<style>
	[data-tooltip-trigger] {
		display: inline-grid;
	}
</style>
