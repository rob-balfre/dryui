<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getPaginationCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getPaginationCtx();
</script>

<button
	type="button"
	disabled={!ctx.canNext}
	onclick={() => ctx.next()}
	aria-label="Go to next page"
	{...rest}
>
	{@render children()}
</button>
