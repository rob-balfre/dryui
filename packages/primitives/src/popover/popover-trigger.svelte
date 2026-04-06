<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getPopoverCtx } from './context.svelte.js';
	import { getTriggerElement, setOptionalAttribute } from '../utils/trigger-element.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getPopoverCtx();

	let wrapperEl = $state<HTMLDivElement>();

	$effect(() => {
		const triggerEl = getTriggerElement(wrapperEl);
		if (!triggerEl) return;

		const handleClick = () => ctx.toggle();

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;
		setOptionalAttribute(triggerEl, 'aria-controls', ctx.contentId);
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		triggerEl.addEventListener('click', handleClick);

		return () => {
			triggerEl.removeEventListener('click', handleClick);
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<div bind:this={wrapperEl} class="popover-trigger-wrapper" {...rest}>
	{@render children()}
</div>

<style>
	.popover-trigger-wrapper {
		display: contents;
	}
</style>
