<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getMenubarCtx, setMenubarMenuCtx } from './context.svelte.js';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const uid = $props.id();
	const menuId = `menubar-menu-${uid}`;
	const ctx = getMenubarCtx();

	$effect(() => {
		ctx.registerMenu(menuId);
		return () => ctx.unregisterMenu(menuId);
	});

	const open = $derived(ctx.activeMenu === menuId);

	setMenubarMenuCtx({
		get menuId() {
			return menuId;
		},
		get open() {
			return open;
		}
	});
</script>

{@render children()}
