<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		items: T[];
		itemHeight: number | ((index: number) => number);
		overscan?: number | undefined;
		children: Snippet<[{ item: T; index: number; style: string }]>;
	}

	let {
		items,
		itemHeight,
		overscan = 5,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let container: HTMLDivElement | undefined = $state(undefined);
	let scrollTop = $state(0);
	let containerHeight = $state(0);

	// Detect mode: fixed (number) vs variable (function)
	let isFixed = $derived(typeof itemHeight === 'number');

	// ─── Fixed-height mode helpers ──────────────────────────────────────────────

	let fixedHeight = $derived(isFixed ? (itemHeight as number) : 0);

	let fixedTotalHeight = $derived(isFixed ? items.length * fixedHeight : 0);

	let fixedStartIndex = $derived.by(() => {
		if (!isFixed) return 0;
		return Math.max(0, Math.floor(scrollTop / fixedHeight) - overscan);
	});

	let fixedEndIndex = $derived.by(() => {
		if (!isFixed) return 0;
		const visible = Math.ceil(containerHeight / fixedHeight);
		return Math.min(items.length, Math.floor(scrollTop / fixedHeight) + visible + overscan);
	});

	let fixedVisibleItems = $derived.by(() => {
		if (!isFixed) return [];
		const result: Array<{ item: T; index: number; style: string }> = [];
		for (let i = fixedStartIndex; i < fixedEndIndex; i++) {
			result.push({
				item: items[i]!,
				index: i,
				style: `position:absolute;top:${i * fixedHeight}px;width:100%;height:${fixedHeight}px;`
			});
		}
		return result;
	});

	// ─── Variable-height mode helpers ───────────────────────────────────────────

	// Pre-compute offsets from the height function
	let variableOffsets = $derived.by(() => {
		if (isFixed) return [];
		const heightFn = itemHeight as (index: number) => number;
		const offsets: number[] = new Array(items.length);
		let cumulative = 0;
		for (let i = 0; i < items.length; i++) {
			offsets[i] = cumulative;
			cumulative += heightFn(i);
		}
		return offsets;
	});

	let variableTotalHeight = $derived.by(() => {
		if (isFixed || items.length === 0) return 0;
		const heightFn = itemHeight as (index: number) => number;
		const lastIdx = items.length - 1;
		return variableOffsets[lastIdx]! + heightFn(lastIdx);
	});

	// Binary search to find the first item whose bottom edge is past scrollTop
	function binarySearchStart(offsets: number[], target: number): number {
		let lo = 0;
		let hi = offsets.length - 1;
		while (lo < hi) {
			const mid = (lo + hi) >>> 1;
			if (offsets[mid]! < target) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}
		return lo;
	}

	let variableStartIndex = $derived.by(() => {
		if (isFixed || items.length === 0) return 0;
		const raw = binarySearchStart(variableOffsets, scrollTop);
		// Step back to find the item that actually contains scrollTop
		const idx = raw > 0 ? raw - 1 : 0;
		return Math.max(0, idx - overscan);
	});

	let variableEndIndex = $derived.by(() => {
		if (isFixed || items.length === 0) return 0;
		const bottom = scrollTop + containerHeight;
		const raw = binarySearchStart(variableOffsets, bottom);
		return Math.min(items.length, raw + 1 + overscan);
	});

	let variableVisibleItems = $derived.by(() => {
		if (isFixed) return [];
		const heightFn = itemHeight as (index: number) => number;
		const result: Array<{ item: T; index: number; style: string }> = [];
		for (let i = variableStartIndex; i < variableEndIndex; i++) {
			const h = heightFn(i);
			result.push({
				item: items[i]!,
				index: i,
				style: `position:absolute;top:${variableOffsets[i]}px;width:100%;height:${h}px;`
			});
		}
		return result;
	});

	// ─── Combined derivations ──────────────────────────────────────────────────

	let totalHeight = $derived(isFixed ? fixedTotalHeight : variableTotalHeight);
	let visibleItems = $derived(isFixed ? fixedVisibleItems : variableVisibleItems);

	// ─── Scroll handling with RAF throttle ──────────────────────────────────────

	let rafId = 0;

	function handleScroll() {
		if (rafId) return;
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			if (container) {
				scrollTop = container.scrollTop;
				containerHeight = container.clientHeight;
			}
		});
	}

	function applyContainerStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('position', 'relative');
			node.style.setProperty('overflow-y', 'auto');
		});
	}

	function applyInnerStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('height', `${totalHeight}px`);
			node.style.setProperty('position', 'relative');
		});
	}

	// Measure container on mount and when it resizes
	$effect(() => {
		if (!container) return;

		containerHeight = container.clientHeight;
		scrollTop = container.scrollTop;

		const ro = new ResizeObserver(() => {
			if (container) {
				containerHeight = container.clientHeight;
			}
		});
		ro.observe(container);

		return () => {
			ro.disconnect();
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = 0;
			}
		};
	});
</script>

<div
	bind:this={container}
	class={className}
	use:applyContainerStyles
	onscroll={handleScroll}
	role="list"
	data-virtual-list
	{...rest}
>
	<div use:applyInnerStyles>
		{#each visibleItems as entry (entry.index)}
			{@render children(entry)}
		{/each}
	</div>
</div>

<style>
	[data-virtual-list] {
		height: 100%;
		--dry-virtual-list-scrollbar-width: 8px;
		--dry-virtual-list-scrollbar-track: var(--dry-color-bg-raised, transparent);
		--dry-virtual-list-scrollbar-thumb: color-mix(
			in srgb,
			var(--dry-color-text-strong) 16%,
			transparent
		);
		--dry-virtual-list-scrollbar-thumb-hover: color-mix(
			in srgb,
			var(--dry-color-text-strong) 24%,
			transparent
		);
		--dry-virtual-list-scrollbar-radius: var(--dry-radius-full, 9999px);

		scrollbar-width: thin;
		scrollbar-color: var(--dry-virtual-list-scrollbar-thumb) var(--dry-virtual-list-scrollbar-track);
	}

	[data-virtual-list]::-webkit-scrollbar-track {
		background: var(--dry-virtual-list-scrollbar-track);
		border-radius: var(--dry-virtual-list-scrollbar-radius);
	}

	[data-virtual-list]::-webkit-scrollbar-thumb {
		background: var(--dry-virtual-list-scrollbar-thumb);
		border-radius: var(--dry-virtual-list-scrollbar-radius);
	}

	[data-virtual-list]::-webkit-scrollbar-thumb:hover {
		background: var(--dry-virtual-list-scrollbar-thumb-hover);
	}
</style>
