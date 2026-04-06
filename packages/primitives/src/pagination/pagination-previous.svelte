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
	disabled={!ctx.canPrevious}
	onclick={() => ctx.previous()}
	aria-label="Go to previous page"
	{...rest}
>
	{@render children()}
</button>
