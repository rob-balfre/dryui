<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTreeCtx, setTreeItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		itemId: string;
		children: Snippet;
	}

	let { itemId, class: className, children, ...rest }: Props = $props();

	const ctx = getTreeCtx();
	const expanded = $derived(ctx.isExpanded(itemId));
	const focused = $derived(ctx.isFocused(itemId));
	const hasChildren = $derived(ctx.hasChildren(itemId));
	const selected = $derived(ctx.isSelected(itemId));

	setTreeItemCtx({
		get itemId() {
			return itemId;
		}
	});
</script>

<div
	role="treeitem"
	tabindex={focused ? 0 : -1}
	aria-expanded={hasChildren ? expanded : undefined}
	aria-selected={selected}
	data-branch={hasChildren || undefined}
	data-expanded={expanded || undefined}
	data-focused={focused || undefined}
	data-selected={selected || undefined}
	data-item-id={itemId}
	class={className}
	onclick={(e) => {
		(e.currentTarget as HTMLElement).focus();
		ctx.selectItem(itemId);
	}}
	ondblclick={() => {
		if (hasChildren) {
			ctx.toggleItem(itemId);
		}
	}}
	{...rest}
>
	{@render children()}
</div>
