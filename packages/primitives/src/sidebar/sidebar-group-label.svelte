<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSidebarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getSidebarCtx();
</script>

<div class={className} data-collapsed={ctx.collapsed || undefined} {...rest}>
	{@render children()}
</div>
