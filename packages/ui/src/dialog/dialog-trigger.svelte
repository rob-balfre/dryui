<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogCtx } from './context.svelte.js';

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

	const ctx = getDialogCtx();

	let wrapperEl = $state<HTMLDivElement>();

	function findTriggerElement(wrapper: HTMLElement | null | undefined): HTMLElement | null {
		if (!wrapper) return null;
		if (wrapper.matches(TRIGGER_SELECTOR)) return wrapper;
		return wrapper.querySelector<HTMLElement>(TRIGGER_SELECTOR);
	}

	$effect(() => {
		const triggerEl = findTriggerElement(wrapperEl);
		if (!triggerEl) return;

		const handleClick = () => ctx.show();
		triggerEl.setAttribute('aria-haspopup', 'dialog');
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		triggerEl.addEventListener('click', handleClick);

		return () => {
			triggerEl.removeEventListener('click', handleClick);
		};
	});
</script>

<div bind:this={wrapperEl} data-dialog-trigger {...rest}>
	{@render children()}
</div>

<style>
	[data-dialog-trigger] {
		display: contents;
	}
</style>
