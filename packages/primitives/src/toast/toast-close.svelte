<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getToastCtx } from './context.svelte.js';
	import { toastStore } from './toast-store.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getToastCtx();
</script>

<button
	type="button"
	aria-label="Close notification"
	onclick={() => toastStore.remove(ctx.id)}
	{...rest}
>
	{@render children()}
</button>
