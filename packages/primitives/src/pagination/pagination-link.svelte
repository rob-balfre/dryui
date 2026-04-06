<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getPaginationCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		page: number;
		children: Snippet;
	}

	let { page, children, ...rest }: Props = $props();

	const ctx = getPaginationCtx();
</script>

<button
	type="button"
	aria-label="Go to page {page}"
	aria-current={ctx.page === page ? 'page' : undefined}
	data-state={ctx.page === page ? 'active' : 'inactive'}
	onclick={() => ctx.goto(page)}
	{...rest}
>
	{@render children()}
</button>
