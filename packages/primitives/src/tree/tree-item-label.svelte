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

<div
	role="button"
	tabindex={0}
	data-tree-label
	data-selected={ctx.isSelected(itemCtx.itemId) || undefined}
	class={className}
	onclick={() => {
		ctx.selectItem(itemCtx.itemId);
		ctx.toggleItem(itemCtx.itemId);
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			ctx.selectItem(itemCtx.itemId);
			ctx.toggleItem(itemCtx.itemId);
		}
	}}
	{...rest}
>
	{@render children()}
</div>
