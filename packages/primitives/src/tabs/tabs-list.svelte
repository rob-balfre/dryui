<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTabsCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, onkeydown, ...rest }: Props = $props();

	const ctx = getTabsCtx();

	let el = $state<HTMLDivElement>();

	function getTabs(): HTMLElement[] {
		if (!el) return [];
		return Array.from(el.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'));
	}

	function focusTab(tabs: HTMLElement[], index: number) {
		if (tabs.length === 0) return;
		const clamped = ((index % tabs.length) + tabs.length) % tabs.length;
		tabs[clamped]!.focus();
	}

	function handleKeydown(e: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		const tabs = getTabs();
		const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);

		const nextKey = ctx.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
		const prevKey = ctx.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

		switch (e.key) {
			case nextKey: {
				e.preventDefault();
				focusTab(tabs, currentIndex + 1);
				break;
			}
			case prevKey: {
				e.preventDefault();
				focusTab(tabs, currentIndex - 1);
				break;
			}
			case 'Home': {
				e.preventDefault();
				focusTab(tabs, 0);
				break;
			}
			case 'End': {
				e.preventDefault();
				focusTab(tabs, tabs.length - 1);
				break;
			}
		}

		if (onkeydown) (onkeydown as (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => void)(e);
	}
</script>

<div
	bind:this={el}
	role="tablist"
	aria-orientation={ctx.orientation}
	data-orientation={ctx.orientation}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
