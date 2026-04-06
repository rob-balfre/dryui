<script lang="ts">
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

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('display', 'grid');
			node.style.setProperty('grid-template-rows', open ? '1fr' : '0fr');
		});
	}
</script>

<div
	role="group"
	aria-hidden={!open}
	data-state={open ? 'open' : 'closed'}
	class={className}
	{...rest}
	use:applyStyles
>
	<div class="tree-item-inner">
		{@render children()}
	</div>
</div>

<style>
	.tree-item-inner {
		overflow: hidden;
	}
</style>
