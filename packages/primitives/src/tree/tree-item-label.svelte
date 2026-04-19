<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTreeCtx, getTreeItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getTreeCtx();
	const itemCtx = getTreeItemCtx();
</script>

<div data-selected={ctx.isSelected(itemCtx.itemId) || undefined} class={className} {...rest}>
	{@render children()}
</div>
