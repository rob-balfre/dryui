<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTreeCtx, getTreeItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getTreeCtx();
	const itemCtx = getTreeItemCtx();
	const open = $derived(ctx.isExpanded(itemCtx.itemId));
	const branchItemId = itemCtx.itemId;
	ctx.registerBranch(branchItemId);
	onDestroy(() => {
		ctx.unregisterBranch(branchItemId);
	});
</script>

<div
	role="group"
	aria-hidden={!open}
	data-part="children"
	data-state={open ? 'open' : 'closed'}
	class={className}
	{...rest}
>
	<div class="tree-item-inner">
		{@render children()}
	</div>
</div>

<style>
	.tree-item-inner {
		overflow: hidden;
	}

	[data-part='children'] {
		display: grid;
		grid-template-rows: 0fr;
		padding-left: var(--dry-tree-indent, var(--dry-space-4));
		transition: grid-template-rows var(--dry-duration-normal) var(--dry-ease-default);
	}

	[data-part='children'][data-state='open'] {
		grid-template-rows: 1fr;
	}
</style>
