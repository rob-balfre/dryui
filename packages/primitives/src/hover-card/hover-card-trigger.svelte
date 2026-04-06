<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getHoverCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLAnchorElement> {
		href?: string;
		children: Snippet;
	}

	let { href, children, ...rest }: Props = $props();

	const ctx = getHoverCardCtx();

	let anchorEl = $state<HTMLAnchorElement>();

	$effect(() => {
		if (anchorEl) {
			ctx.triggerEl = anchorEl;
		}
	});
</script>

<a
	bind:this={anchorEl}
	id={ctx.triggerId}
	{href}
	aria-haspopup="true"
	aria-expanded={ctx.open}
	data-state={ctx.open ? 'open' : 'closed'}
	onpointerenter={() => ctx.show()}
	onpointerleave={() => ctx.close()}
	onfocus={() => ctx.show()}
	onblur={() => ctx.close()}
	{...rest}
>
	{@render children()}
</a>
