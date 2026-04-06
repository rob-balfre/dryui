<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateFormId } from '@dryui/primitives';
	import { getMegaMenuCtx, setMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getMegaMenuCtx();
	const itemId = generateFormId('mm-item');
	const triggerId = generateFormId('mm-trigger');

	setMegaMenuItemCtx({
		itemId,
		triggerId,
		get open() {
			return ctx.activeItem === itemId;
		}
	});

	function handlePointerEnter() {
		ctx.openItem(itemId);
	}

	function handlePointerLeave() {
		ctx.closeItem();
	}
</script>

<div
	data-mega-menu-item
	data-state={ctx.activeItem === itemId ? 'open' : 'closed'}
	class={className}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-mega-menu-item] {
		position: relative;
	}
</style>
