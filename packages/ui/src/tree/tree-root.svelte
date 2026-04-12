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

	setTreeCtx({
		get expandedItems() {
			return expandedItems;
		},
		get selectedItem() {
			return selectedItem;
		},
		toggleItem(id) {
			if (expandedItems.has(id)) expandedItems.delete(id);
			else expandedItems.add(id);
		},
		expandItem(id) {
			expandedItems.add(id);
		},
		collapseItem(id) {
			expandedItems.delete(id);
		},
		selectItem(id) {
			selectedItem = id;
		},
		isExpanded(id) {
			return expandedItems.has(id);
		},
		isSelected(id) {
			return selectedItem === id;
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		const tree = e.currentTarget as HTMLElement;
		const items = Array.from(tree.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
		const visibleItems = items.filter((item) => {
			let parent = item.parentElement;
			while (parent && parent !== tree) {
				if (parent.getAttribute('role') === 'group') {
					const groupParent = parent.closest('[role="treeitem"]');
					if (groupParent && groupParent.getAttribute('aria-expanded') === 'false') {
						return false;
					}
				}
				parent = parent.parentElement;
			}
			return true;
		});

		const currentIndex = visibleItems.indexOf(
			document.activeElement?.closest('[role="treeitem"]') as HTMLElement
		);
		if (currentIndex === -1) return;

		const currentItem = visibleItems[currentIndex]!;
		const itemId = currentItem.dataset.itemId;

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				const next = visibleItems[currentIndex + 1];
				if (next) {
					const label = next.querySelector('[data-tree-label]') as HTMLElement;
					(label ?? next).focus();
				}
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				const prev = visibleItems[currentIndex - 1];
				if (prev) {
					const label = prev.querySelector('[data-tree-label]') as HTMLElement;
					(label ?? prev).focus();
				}
				break;
			}
			case 'ArrowRight': {
				e.preventDefault();
				if (itemId) {
					const hasChildren = currentItem.querySelector('[role="group"]');
					if (hasChildren && !expandedItems.has(itemId)) {
						expandedItems.add(itemId);
					} else if (hasChildren && expandedItems.has(itemId)) {
						const firstChild = currentItem.querySelector('[role="group"] > [role="treeitem"]');
						if (firstChild) {
							const label = firstChild.querySelector('[data-tree-label]') as HTMLElement;
							(label ?? (firstChild as HTMLElement)).focus();
						}
					}
				}
				break;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				if (itemId && expandedItems.has(itemId)) {
					expandedItems.delete(itemId);
				} else {
					const parentGroup = currentItem.parentElement?.closest('[role="treeitem"]');
					if (parentGroup) {
						const label = parentGroup.querySelector('[data-tree-label]') as HTMLElement;
						(label ?? (parentGroup as HTMLElement)).focus();
					}
				}
				break;
			}
			case 'Home': {
				e.preventDefault();
				const first = visibleItems[0];
				if (first) {
					const label = first.querySelector('[data-tree-label]') as HTMLElement;
					(label ?? first).focus();
				}
				break;
			}
			case 'End': {
				e.preventDefault();
				const last = visibleItems[visibleItems.length - 1];
				if (last) {
					const label = last.querySelector('[data-tree-label]') as HTMLElement;
					(label ?? last).focus();
				}
				break;
			}
		}
	}
</script>

<div role="tree" data-part="root" class={className} onkeydown={handleKeydown} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		--dry-tree-indent: var(--dry-space-4);
		--dry-tree-item-padding: var(--dry-space-1) var(--dry-space-2);
		--dry-tree-item-radius: min(
			var(--dry-control-radius, var(--dry-radius-md)),
			var(--dry-space-4)
		);
		--dry-tree-item-hover-bg: var(--dry-color-fill);
		--dry-tree-item-selected-bg: var(--dry-color-fill-brand-weak);
		--dry-tree-item-selected-color: var(--dry-color-text-brand);
		--dry-tree-item-selected-indicator: var(--dry-color-stroke-selected);
		--dry-tree-icon-size: 1rem;
	}
</style>
