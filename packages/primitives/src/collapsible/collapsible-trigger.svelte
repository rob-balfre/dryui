<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getCollapsibleCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getCollapsibleCtx();
</script>

<button
	type="button"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={ctx.disabled || undefined}
	disabled={ctx.disabled}
	onclick={() => ctx.toggle()}
	{...rest}
>
	{@render children()}
</button>
