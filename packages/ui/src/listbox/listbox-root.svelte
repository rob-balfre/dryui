<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ListboxRootProps } from './index.js';
	import { setListboxCtx } from './context.svelte.js';

	let {
		value = $bindable(''),
		multiple = false,
		disabled = false,
		onvaluechange,
		class: className,
		children,
		...rest
	}: ListboxRootProps = $props();

	function select(itemValue: string) {
		if (disabled) return;
		if (multiple) {
			const arr = Array.isArray(value) ? value : [];
			const idx = arr.indexOf(itemValue);
			const next = idx >= 0 ? arr.filter((v) => v !== itemValue) : [...arr, itemValue];
			value = next;
			onvaluechange?.(next);
		} else {
			value = itemValue;
			onvaluechange?.(itemValue);
		}
	}

	function isSelected(itemValue: string): boolean {
		if (multiple) {
			return Array.isArray(value) ? value.includes(itemValue) : false;
		}
		return value === itemValue;
	}

	setListboxCtx({
		get disabled() {
			return disabled;
		},
		get multiple() {
			return multiple;
		},
		select,
		isSelected
	});

	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const root = e.currentTarget as HTMLElement;
		const items = Array.from(
			root.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
		);
		if (!items.length) return;

		const currentIndex = items.indexOf(target);
		let nextIndex = -1;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
				break;
			case 'ArrowUp':
				e.preventDefault();
				nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
				break;
			case 'Home':
				e.preventDefault();
				nextIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				nextIndex = items.length - 1;
				break;
			default:
				return;
		}

		if (nextIndex >= 0) {
			items[nextIndex]?.focus();
		}
	}
</script>

<div
	role="listbox"
	aria-multiselectable={multiple || undefined}
	aria-disabled={disabled || undefined}
	data-listbox-root
	data-disabled={disabled || undefined}
	class={className}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-listbox-root] {
		--dry-listbox-bg: var(--dry-color-bg-overlay);
		--dry-listbox-border: var(--dry-color-stroke-weak);
		--dry-listbox-radius: var(--dry-radius-lg);
		--dry-listbox-padding: var(--dry-space-1);

		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-listbox-padding);
		background: var(--dry-listbox-bg);
		border: 1px solid var(--dry-listbox-border);
		border-radius: var(--dry-listbox-radius);
		font-family: var(--dry-font-sans);
	}

	[data-listbox-root]:focus-within {
		border-color: var(--dry-color-stroke-focus);
		box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
	}
</style>
