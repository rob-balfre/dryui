<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();
</script>

<button
	type="button"
	aria-expanded={ctx.open}
	data-state={ctx.open ? 'open' : 'closed'}
	onclick={() => ctx.toggle()}
	{...rest}
>
	{@render children()}
</button>
