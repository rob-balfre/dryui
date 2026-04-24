<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setToolbarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let { orientation = 'horizontal', class: className, children, ...rest }: Props = $props();

	setToolbarCtx({
		get orientation() {
			return orientation;
		}
	});

	let toolbarEl: HTMLDivElement;

	$effect(() => {
		if (!toolbarEl) return;
		const items = getFocusableItems(toolbarEl);
		if (items.length > 0 && !items.some((el) => el.getAttribute('tabindex') === '0')) {
			items[0]!.setAttribute('tabindex', '0');
		}
	});

	function getFocusableItems(toolbar: HTMLElement): HTMLElement[] {
		return Array.from(
			toolbar.querySelectorAll<HTMLElement>(
				'[role="button"]:not([disabled]), button:not([disabled]), [role="link"]'
			)
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		const toolbar = event.currentTarget as HTMLElement;
		const items = getFocusableItems(toolbar);
		if (items.length === 0) return;

		const currentIndex = items.indexOf(event.target as HTMLElement);
		if (currentIndex === -1) return;

		const isHorizontal = orientation === 'horizontal';
		const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
		const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

		let nextIndex: number | null = null;

		if (event.key === prevKey) {
			nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
		} else if (event.key === nextKey) {
			nextIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = items.length - 1;
		}

		if (nextIndex !== null) {
			event.preventDefault();
			items[currentIndex]?.setAttribute('tabindex', '-1');
			items[nextIndex]?.setAttribute('tabindex', '0');
			items[nextIndex]?.focus();
		}
	}
</script>

<div
	bind:this={toolbarEl}
	role="toolbar"
	aria-orientation={orientation}
	data-part="root"
	data-orientation={orientation}
	class={className}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		padding: var(--dry-space-1);
		background: var(--dry-color-bg-overlay);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
	}

	[data-part='root'][data-orientation='vertical'] {
		grid-auto-flow: row;
		grid-auto-columns: initial;
	}
</style>
