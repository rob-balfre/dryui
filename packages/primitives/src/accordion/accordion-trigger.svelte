<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAccordionCtx, getAccordionItemCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAccordionCtx();
	const itemCtx = getAccordionItemCtx();
</script>

<button
	type="button"
	aria-expanded={itemCtx.open}
	aria-controls={itemCtx.contentId}
	data-state={itemCtx.open ? 'open' : 'closed'}
	data-disabled={itemCtx.disabled || undefined}
	disabled={itemCtx.disabled}
	onclick={() => ctx.toggle(itemCtx.value)}
	{...rest}
>
	{@render children()}
</button>
