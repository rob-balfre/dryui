<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTreeCtx, getTreeItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, style, ...rest }: Props = $props();

	const ctx = getTreeCtx();
	const itemCtx = getTreeItemCtx();
	const open = $derived(ctx.isExpanded(itemCtx.itemId));
	const branchItemId = itemCtx.itemId;
	const groupStyle = $derived(
		[style, `--_rows: ${open ? '1fr' : '0fr'}`].filter(Boolean).join('; ')
	);

	ctx.registerBranch(branchItemId);
	onDestroy(() => {
		ctx.unregisterBranch(branchItemId);
	});
</script>

<div
	role="group"
	aria-hidden={!open}
	data-state={open ? 'open' : 'closed'}
	class={className}
	style={groupStyle}
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

	[role='group'] {
		display: grid;
		grid-template-rows: var(--_rows, 0fr);
	}
</style>
