<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTooltipCtx } from './context.svelte.js';
	import { getTriggerElement, setOptionalAttribute } from '../utils/trigger-element.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getTooltipCtx();

	let spanEl = $state<HTMLSpanElement>();

	$effect(() => {
		const triggerEl = getTriggerElement(spanEl) ?? spanEl ?? null;

		if (!triggerEl) {
			return;
		}

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;
		setOptionalAttribute(triggerEl, 'aria-describedby', ctx.open ? ctx.contentId : undefined);

		return () => {
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<span
	bind:this={spanEl}
	onmouseenter={() => ctx.show()}
	onmouseleave={() => ctx.close()}
	onfocusin={() => ctx.showImmediate()}
	onfocusout={() => ctx.closeImmediate()}
	{...rest}
>
	{@render children()}
</span>
