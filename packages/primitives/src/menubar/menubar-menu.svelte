<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { getMenubarCtx, setMenubarMenuCtx } from './context.svelte.js';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const menuId = generateFormId('menubar-menu');
	const ctx = getMenubarCtx();

	onMount(() => {
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
