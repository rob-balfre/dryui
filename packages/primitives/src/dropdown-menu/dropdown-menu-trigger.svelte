<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDropdownMenuCtx } from './context.svelte.js';
	import { getTriggerElement, setOptionalAttribute } from '../utils/trigger-element.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDropdownMenuCtx();

	let wrapperEl = $state<HTMLDivElement>();

	$effect(() => {
		const triggerEl = getTriggerElement(wrapperEl);
		if (!triggerEl) return;

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;
		triggerEl.setAttribute('popovertarget', ctx.contentId);
		triggerEl.setAttribute('aria-haspopup', 'menu');
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		setOptionalAttribute(triggerEl, 'aria-controls', ctx.contentId);
		triggerEl.setAttribute('data-state', ctx.open ? 'open' : 'closed');

		return () => {
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<div bind:this={wrapperEl} class="trigger-wrap" {...rest}>
	{@render children()}
</div>

<style>
	.trigger-wrap {
		display: contents;
	}
</style>
