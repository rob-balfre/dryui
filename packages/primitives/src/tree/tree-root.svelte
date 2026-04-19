<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SvelteSet } from 'svelte/reactivity';
	import { setTreeCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		defaultExpanded?: string[];
		selectedItem?: string | null;
		children: Snippet;
	}

	let {
		defaultExpanded = [],
		selectedItem = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	function createExpandedItems() {
		return new SvelteSet<string>(defaultExpanded);
	}

	let expandedItems = createExpandedItems();
	let branchItems = new SvelteSet<string>();
	let focusedItem = $state<string | null>(selectedItem);

	function toggleItem(id: string) {
		if (expandedItems.has(id)) expandedItems.delete(id);
		else expandedItems.add(id);
	}

	function expandItem(id: string) {
		expandedItems.add(id);
	}

	function collapseItem(id: string) {
		expandedItems.delete(id);
	}

	function selectItem(id: string) {
		selectedItem = id;
		focusedItem = id;
	}

	function setFocusedItem(id: string) {
		focusedItem = id;
	}

	function registerBranch(id: string) {
		branchItems.add(id);
	}

	function unregisterBranch(id: string) {
		branchItems.delete(id);
	}

	setTreeCtx({
		get expandedItems() {
			return expandedItems;
		},
		get selectedItem() {
			return selectedItem;
		},
		get focusedItem() {
			return focusedItem;
		},
		toggleItem,
		expandItem,
		collapseItem,
		selectItem,
		setFocusedItem,
		registerBranch,
		unregisterBranch,
		isExpanded(id) {
			return expandedItems.has(id);
		},
		isSelected(id) {
			return selectedItem === id;
		},
		isFocused(id) {
			return focusedItem === id;
		},
		hasChildren(id) {
			return branchItems.has(id);
		}
	});

	function initializeTree(node: HTMLElement) {
		if (focusedItem !== null) return;
		const itemId = node.querySelector<HTMLElement>('[role="treeitem"]')?.dataset.itemId;

		if (itemId) {
			focusedItem = itemId;
		}
	}

	function getVisibleItems(tree: HTMLElement) {
		const items = Array.from(tree.querySelectorAll('[role="treeitem"]')) as HTMLElement[];

		return items.filter((item) => {
			let parent = item.parentElement;

			while (parent && parent !== tree) {
				if (parent.getAttribute('role') === 'group') {
					const groupParent = parent.closest<HTMLElement>('[role="treeitem"]');
					if (groupParent?.getAttribute('aria-expanded') === 'false') {
						return false;
					}
				}

				parent = parent.parentElement;
			}

			return true;
		});
	}

	function getCurrentItem(tree: HTMLElement, visibleItems: HTMLElement[]) {
		const activeItem =
			document.activeElement instanceof HTMLElement
				? document.activeElement.closest<HTMLElement>('[role="treeitem"]')
				: null;

		if (activeItem && tree.contains(activeItem)) {
			return activeItem;
		}

		if (focusedItem !== null) {
			return visibleItems.find((item) => item.dataset.itemId === focusedItem) ?? null;
		}

		return visibleItems[0] ?? null;
	}

	function focusItem(item: HTMLElement | null | undefined) {
		if (!item) return;
		const itemId = item.dataset.itemId;
		if (itemId && itemId !== focusedItem) {
			focusedItem = itemId;
		}
		item.focus();
	}

	function handleFocusIn(e: FocusEvent) {
		const item =
			e.target instanceof HTMLElement ? e.target.closest<HTMLElement>('[role="treeitem"]') : null;
		const itemId = item?.dataset.itemId;

		if (itemId && itemId !== focusedItem) {
			focusedItem = itemId;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		const tree = e.currentTarget as HTMLElement;
		const visibleItems = getVisibleItems(tree);
		const currentItem = getCurrentItem(tree, visibleItems);
		if (!currentItem) return;

		const currentIndex = visibleItems.indexOf(currentItem);
		const itemId = currentItem.dataset.itemId;

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				focusItem(visibleItems[currentIndex + 1]);
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				focusItem(visibleItems[currentIndex - 1]);
				break;
			}
			case 'ArrowRight': {
				e.preventDefault();
				if (itemId && branchItems.has(itemId)) {
					if (!expandedItems.has(itemId)) {
						expandItem(itemId);
					} else {
						focusItem(currentItem.querySelector<HTMLElement>('[role="group"] [role="treeitem"]'));
					}
				}
				break;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				if (itemId && branchItems.has(itemId) && expandedItems.has(itemId)) {
					collapseItem(itemId);
				} else {
					focusItem(currentItem.parentElement?.closest<HTMLElement>('[role="treeitem"]'));
				}
				break;
			}
			case 'Home': {
				e.preventDefault();
				focusItem(visibleItems[0]);
				break;
			}
			case 'End': {
				e.preventDefault();
				focusItem(visibleItems[visibleItems.length - 1]);
				break;
			}
			case 'Enter':
			case ' ': {
				if (itemId) {
					e.preventDefault();
					selectItem(itemId);
				}
				break;
			}
		}
	}
</script>

<div
	role="tree"
	class={className}
	onfocusin={handleFocusIn}
	onkeydown={handleKeydown}
	{@attach initializeTree}
	{...rest}
>
	{@render children()}
</div>
