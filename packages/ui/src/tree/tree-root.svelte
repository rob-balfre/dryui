<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
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

	// svelte-ignore state_referenced_locally
	let expandedItems = $state(new Set<string>(defaultExpanded));

	setTreeCtx({
		get expandedItems() {
			return expandedItems;
		},
		get selectedItem() {
			return selectedItem;
		},
		toggleItem(id) {
			const newSet = new Set(expandedItems);
			if (newSet.has(id)) newSet.delete(id);
			else newSet.add(id);
			expandedItems = newSet;
		},
		expandItem(id) {
			expandedItems = new Set([...expandedItems, id]);
		},
		collapseItem(id) {
			const s = new Set(expandedItems);
			s.delete(id);
			expandedItems = s;
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
						const newSet = new Set(expandedItems);
						newSet.add(itemId);
						expandedItems = newSet;
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
					const s = new Set(expandedItems);
					s.delete(itemId);
					expandedItems = s;
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
		--dry-tree-item-radius: var(--dry-radius-md);
		--dry-tree-item-hover-bg: var(--dry-color-fill);
		--dry-tree-item-selected-bg: var(--dry-color-fill-brand-weak);
		--dry-tree-item-selected-color: var(--dry-color-text-brand);
		--dry-tree-item-selected-indicator: var(--dry-color-stroke-selected);
		--dry-tree-icon-size: 1rem;
	}
</style>
