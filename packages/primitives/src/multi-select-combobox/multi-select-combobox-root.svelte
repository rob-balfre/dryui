<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string[];
		query?: string;
		open?: boolean;
		disabled?: boolean;
		name?: string;
		maxSelections?: number;
		onvaluechange?: (value: string[]) => void;
		onquerychange?: (query: string) => void;
		children: Snippet;
	}

	let {
		value = $bindable([]),
		query = $bindable(''),
		open = $bindable(false),
		disabled = false,
		name,
		maxSelections = 0,
		onvaluechange,
		onquerychange,
		children,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const inputId = `multi-select-combobox-input-${uid}`;
	const contentId = `multi-select-combobox-content-${uid}`;

	let rootEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let activeItemId = $state('');
	let itemIds = $state<string[]>([]);

	function setQueryValue(nextQuery: string, notify = true) {
		query = nextQuery;
		if (notify) {
			onquerychange?.(nextQuery);
		}
	}

	function setSelectedValues(nextValue: string[]) {
		value = nextValue;
		onvaluechange?.(nextValue);
	}

	function focusInput() {
		inputEl?.focus();
	}

	function canSelectValue(itemValue: string) {
		return value.includes(itemValue) || maxSelections === 0 || value.length < maxSelections;
	}

	function getEnabledItems() {
		const contentEl = document.getElementById(contentId);
		if (!(contentEl instanceof HTMLElement)) {
			return [];
		}

		return Array.from(
			contentEl.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])')
		);
	}

	function show() {
		if (!disabled) {
			open = true;
		}
	}

	function close() {
		open = false;
		activeItemId = '';
	}

	function selectValue(itemValue: string) {
		if (disabled || !canSelectValue(itemValue)) {
			return false;
		}

		if (value.includes(itemValue)) {
			setSelectedValues(value.filter((entry) => entry !== itemValue));
		} else {
			setSelectedValues([...value, itemValue]);
		}

		setQueryValue('');
		activeItemId = '';
		focusInput();
		return true;
	}

	function removeValue(itemValue: string) {
		if (!value.includes(itemValue)) {
			return;
		}

		setSelectedValues(value.filter((entry) => entry !== itemValue));
	}

	function removeLastValue() {
		const lastValue = value[value.length - 1];
		if (lastValue) {
			removeValue(lastValue);
		}
	}

	function attachRoot(node: HTMLDivElement) {
		rootEl = node;

		function handlePointerDown(event: PointerEvent) {
			if (event.button !== 0) {
				return;
			}

			const target = event.target;
			if (!(target instanceof HTMLElement)) {
				return;
			}

			if (target.closest('button, a, input, textarea, select, label')) {
				return;
			}

			event.preventDefault();
			focusInput();
			show();
		}

		node.addEventListener('pointerdown', handlePointerDown);
		return () => {
			node.removeEventListener('pointerdown', handlePointerDown);
			if (rootEl === node) {
				rootEl = null;
			}
		};
	}

	setMultiSelectComboboxCtx({
		get open() {
			return open;
		},
		get query() {
			return query;
		},
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get maxSelections() {
			return maxSelections;
		},
		get activeItemId() {
			return activeItemId;
		},
		get itemCount() {
			return itemIds.length;
		},
		get inputId() {
			return inputId;
		},
		get contentId() {
			return contentId;
		},
		get anchorEl() {
			return rootEl ?? null;
		},
		get inputEl() {
			return inputEl;
		},
		set inputEl(element: HTMLInputElement | null) {
			inputEl = element;
		},
		show,
		close,
		setQuery(value, notify = true) {
			setQueryValue(value, notify);
		},
		setActiveItem(id: string) {
			activeItemId = id;
		},
		registerItem(id: string) {
			untrack(() => {
				if (!itemIds.includes(id)) {
					itemIds = [...itemIds, id];
				}
			});
		},
		unregisterItem(id: string) {
			untrack(() => {
				itemIds = itemIds.filter((itemId) => itemId !== id);
				if (activeItemId === id) {
					activeItemId = '';
				}
			});
		},
		getEnabledItems,
		isSelected(itemValue: string) {
			return value.includes(itemValue);
		},
		canSelect(itemValue: string) {
			return canSelectValue(itemValue);
		},
		selectValue,
		removeValue,
		removeLastValue,
		focusInput
	});
</script>

<div
	{@attach attachRoot}
	role="group"
	data-state={open ? 'open' : 'closed'}
	data-disabled={disabled || undefined}
	{...rest}
>
	{@render children()}

	{#if name}
		{#each value as selectedValue (selectedValue)}
			<input type="hidden" {name} value={selectedValue} disabled={disabled || undefined} />
		{/each}
	{/if}
</div>
