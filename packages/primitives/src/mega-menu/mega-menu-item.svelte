<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMegaMenuCtx, setMegaMenuItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getMegaMenuCtx();
	const uid = $props.id();
	const itemId = `mm-item-${uid}`;
	const triggerId = `mm-trigger-${uid}`;
	const panelId = `mm-panel-${uid}`;

	setMegaMenuItemCtx({
		itemId,
		triggerId,
		panelId,
		get open() {
			return ctx.activeItem === itemId;
		}
	});

	function handlePointerEnter() {
		ctx.openItem(itemId, triggerId);
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
