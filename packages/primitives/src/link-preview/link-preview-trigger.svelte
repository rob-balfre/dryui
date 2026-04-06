<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { getLinkPreviewCtx } from './context.svelte.js';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getLinkPreviewCtx();

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
	aria-describedby={ctx.open ? ctx.contentId : undefined}
	onmouseenter={() => ctx.show()}
	onmouseleave={() => ctx.close()}
	onfocusin={() => ctx.showImmediate()}
	onfocusout={() => ctx.closeImmediate()}
	{...rest}
>
	{@render children()}
</a>
