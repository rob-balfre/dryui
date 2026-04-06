<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTransferCtx, type TransferItem } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		sourceItems: TransferItem[];
		targetItems?: TransferItem[];
		onChange?: (source: TransferItem[], target: TransferItem[]) => void;
		children: Snippet;
	}

	let {
		sourceItems = $bindable([]),
		targetItems = $bindable([]),
		onChange,
		class: className,
		children,
		...rest
	}: Props = $props();

	let selectedSource: Set<string> = $state(new Set());
	let selectedTarget: Set<string> = $state(new Set());

	function emitChange(source: TransferItem[], target: TransferItem[]) {
		sourceItems = source;
		targetItems = target;
		onChange?.(source, target);
	}

	setTransferCtx({
		get sourceItems() {
			return sourceItems;
		},
		get targetItems() {
			return targetItems;
		},
		get selectedSource() {
			return selectedSource;
		},
		get selectedTarget() {
			return selectedTarget;
		},
		get sourceCount() {
			return sourceItems.length;
		},
		get targetCount() {
			return targetItems.length;
		},
		get selectedSourceCount() {
			return selectedSource.size;
		},
		get selectedTargetCount() {
			return selectedTarget.size;
		},
		toggleSourceSelection(key: string) {
			const item = sourceItems.find((i) => i.key === key);
			if (item?.disabled) return;
			const next = new Set(selectedSource);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			selectedSource = next;
		},
		toggleTargetSelection(key: string) {
			const item = targetItems.find((i) => i.key === key);
			if (item?.disabled) return;
			const next = new Set(selectedTarget);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			selectedTarget = next;
		},
		selectAllSource() {
			selectedSource = new Set(sourceItems.filter((i) => !i.disabled).map((i) => i.key));
		},
		selectAllTarget() {
			selectedTarget = new Set(targetItems.filter((i) => !i.disabled).map((i) => i.key));
		},
		deselectAllSource() {
			selectedSource = new Set();
		},
		deselectAllTarget() {
			selectedTarget = new Set();
		},
		moveToTarget() {
			const toMove = sourceItems.filter((i) => selectedSource.has(i.key));
			const remaining = sourceItems.filter((i) => !selectedSource.has(i.key));
			selectedSource = new Set();
			emitChange(remaining, [...targetItems, ...toMove]);
		},
		moveToSource() {
			const toMove = targetItems.filter((i) => selectedTarget.has(i.key));
			const remaining = targetItems.filter((i) => !selectedTarget.has(i.key));
			selectedTarget = new Set();
			emitChange([...sourceItems, ...toMove], remaining);
		},
		moveAllToTarget() {
			const movable = sourceItems.filter((i) => !i.disabled);
			const remaining = sourceItems.filter((i) => i.disabled);
			selectedSource = new Set();
			emitChange(remaining, [...targetItems, ...movable]);
		},
		moveAllToSource() {
			const movable = targetItems.filter((i) => !i.disabled);
			const remaining = targetItems.filter((i) => i.disabled);
			selectedTarget = new Set();
			emitChange([...sourceItems, ...movable], remaining);
		},
		isSourceAllSelected() {
			const selectable = sourceItems.filter((i) => !i.disabled);
			return selectable.length > 0 && selectable.every((i) => selectedSource.has(i.key));
		},
		isTargetAllSelected() {
			const selectable = targetItems.filter((i) => !i.disabled);
			return selectable.length > 0 && selectable.every((i) => selectedTarget.has(i.key));
		}
	});
</script>

<div data-part="root" data-transfer-root class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		--dry-transfer-border: var(--dry-color-stroke-weak);
		--dry-transfer-bg: var(--dry-color-bg-base);
		--dry-transfer-header-bg: var(--dry-color-bg-raised);
		--dry-transfer-item-hover: var(--dry-color-fill);
		--dry-transfer-item-selected: var(--dry-color-fill-brand-weak);
		--dry-transfer-padding: var(--dry-space-3);
		--dry-transfer-list-height: 280px;
		--dry-transfer-radius: var(--dry-radius-lg);
		--dry-transfer-actions-gap: var(--dry-space-2);

		container-type: inline-size;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		align-items: stretch;
		gap: var(--dry-space-3);
	}

	@container (max-width: 500px) {
		[data-part='root'] {
			grid-auto-flow: row;
			grid-auto-columns: initial;
		}
	}
</style>
