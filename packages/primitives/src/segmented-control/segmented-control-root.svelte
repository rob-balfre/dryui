<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSegmentedControlCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		value = $bindable(''),
		disabled = false,
		orientation = 'horizontal',
		children,
		onkeydown,
		...rest
	}: Props = $props();

	function getItems(rootEl: HTMLDivElement): HTMLButtonElement[] {
		return Array.from(
			rootEl.querySelectorAll<HTMLButtonElement>(
				'button[data-segmented-control-item]:not(:disabled)'
			)
		);
	}

	function selectByOffset(rootEl: HTMLDivElement, offset: number) {
		const items = getItems(rootEl);
		if (items.length === 0) return;

		const active =
			document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
		const selectedIndex = items.findIndex((item) => item.dataset.state === 'on');
		const currentIndex = active ? items.indexOf(active) : selectedIndex;
		const startIndex = currentIndex >= 0 ? currentIndex : 0;
		const nextIndex = (((startIndex + offset) % items.length) + items.length) % items.length;

		items[nextIndex]?.click();
		items[nextIndex]?.focus();
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
		const rootEl = event.currentTarget;

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				selectByOffset(rootEl, 1);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				selectByOffset(rootEl, -1);
				break;
			case 'Home': {
				const items = getItems(rootEl);
				if (items.length === 0) break;
				event.preventDefault();
				items[0]?.click();
				items[0]?.focus();
				break;
			}
			case 'End': {
				const items = getItems(rootEl);
				if (items.length === 0) break;
				event.preventDefault();
				items.at(-1)?.click();
				items.at(-1)?.focus();
				break;
			}
		}

		onkeydown?.(event);
	}

	setSegmentedControlCtx({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get orientation() {
			return orientation;
		},
		select(nextValue: string) {
			if (disabled) return;
			value = nextValue;
		}
	});
</script>

<div
	role="group"
	aria-disabled={disabled || undefined}
	data-disabled={disabled || undefined}
	data-orientation={orientation}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
