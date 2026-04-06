<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContextMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getContextMenuCtx();

	let triggerEl = $state<HTMLDivElement>();

	$effect(() => {
		if (triggerEl) {
			ctx.triggerEl = triggerEl;
		}
	});
</script>

<div
	bind:this={triggerEl}
	id={ctx.triggerId}
	data-state={ctx.open ? 'open' : 'closed'}
	oncontextmenu={(e) => {
		e.preventDefault();
		ctx.position = { x: e.clientX, y: e.clientY };
		ctx.show();
	}}
	{...rest}
>
	{@render children()}
</div>
