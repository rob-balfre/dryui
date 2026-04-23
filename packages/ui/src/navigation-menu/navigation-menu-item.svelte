<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setNavigationMenuItemCtx, getNavigationMenuCtx } from './context.svelte.js';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const ctx = getNavigationMenuCtx();
	const uid = $props.id();
	const itemId = `nav-item-${uid}`;
	const triggerId = `nav-trigger-${uid}`;
	const contentId = `nav-content-${uid}`;

	setNavigationMenuItemCtx({
		itemId,
		triggerId,
		contentId,
		get open() {
			return ctx.activeItem === itemId;
		}
	});
</script>

<li>
	{@render children()}
</li>

<style>
	li {
		position: relative;
	}
</style>
