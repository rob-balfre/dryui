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
	data-state={ctx.open ? 'open' : 'closed'}
	tabindex={ctx.open ? 0 : -1}
	{...rest}
>
	{@render children()}
</button>
