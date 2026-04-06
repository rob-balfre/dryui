<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateFormId } from '../utils/form-control.svelte.js';
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
	class={className}
	data-state={ctx.activeItem === itemId ? 'open' : 'closed'}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	{...rest}
>
	{@render children()}
</div>
