<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
	const ctx = getFileSelectCtx();
</script>

<button
	type="button"
	onclick={ctx.request}
	disabled={ctx.disabled || ctx.loading || undefined}
	data-loading={ctx.loading || undefined}
	data-disabled={ctx.disabled || undefined}
	{...rest}
>
	{@render children()}
</button>
