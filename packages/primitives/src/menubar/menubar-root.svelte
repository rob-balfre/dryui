<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMenubarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	let activeMenu = $state<string | null>(null);
	let menuIds: string[] = [];
	let rootEl = $state<HTMLDivElement>();

	function setRootElement(element: HTMLDivElement) {
		rootEl = element;

		return () => {
			if (rootEl === element) {
				rootEl = undefined;
			}
		};
	}

	setMenubarCtx({
		get activeMenu() {
			return activeMenu;
		},
		get hasOpenMenu() {
			return activeMenu !== null;
		},
		get rootElement() {
			return rootEl ?? null;
		},
		openMenu(id) {
			activeMenu = id;
		},
		closeMenu() {
			activeMenu = null;
		},
		registerMenu(id) {
			if (!menuIds.includes(id)) menuIds.push(id);
		},
		unregisterMenu(id) {
			menuIds = menuIds.filter((m) => m !== id);
		},
		getMenuIds() {
			return menuIds;
		},
		focusNextMenu(currentId) {
			const idx = menuIds.indexOf(currentId);
			const nextIdx = (idx + 1) % menuIds.length;
			const nextId = menuIds[nextIdx] ?? null;
			activeMenu = nextId;
			requestAnimationFrame(() => {
				rootEl?.querySelector<HTMLButtonElement>(`[data-menubar-trigger="${nextId}"]`)?.focus();
			});
		},
		focusPrevMenu(currentId) {
			const idx = menuIds.indexOf(currentId);
			const prevIdx = (idx - 1 + menuIds.length) % menuIds.length;
			const prevId = menuIds[prevIdx] ?? null;
			activeMenu = prevId;
			requestAnimationFrame(() => {
				rootEl?.querySelector<HTMLButtonElement>(`[data-menubar-trigger="${prevId}"]`)?.focus();
			});
		}
	});
</script>

<div role="menubar" class={className} {@attach setRootElement} {...rest}>
	{@render children()}
</div>
