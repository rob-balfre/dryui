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
	const selected = $derived(ctx.isSelected(itemId));

	setTreeItemCtx({
		get itemId() {
			return itemId;
		}
	});
</script>

<div
	role="treeitem"
	aria-expanded={expanded}
	aria-selected={selected}
	data-part="item"
	data-expanded={expanded || undefined}
	data-selected={selected || undefined}
	data-item-id={itemId}
	class={className}
	{...rest}
>
	{@render children()}
</div>
