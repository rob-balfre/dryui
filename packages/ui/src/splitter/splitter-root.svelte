<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSplitterCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		sizes?: number[];
		children: Snippet;
	}

	let {
		orientation = 'horizontal',
		sizes = $bindable([50, 50]),
		class: className,
		children,
		...rest
	}: Props = $props();

	let resizingIndex = $state(-1);
	let startPos = 0;
	let startSizes: number[] = [];

	const trackTemplate = $derived.by(() =>
		sizes
			.map((size, index) => {
				const track = `minmax(0, ${Math.max(size, 0.01)}fr)`;
				return index < sizes.length - 1 ? `${track} max-content` : track;
			})
			.join(' ')
	);

	function applyGridTemplate(node: HTMLElement) {
		$effect(() => {
			if (orientation === 'vertical') {
				node.style.removeProperty('--_splitter-columns');
				node.style.setProperty('--_splitter-rows', trackTemplate);
			} else {
				node.style.removeProperty('--_splitter-rows');
				node.style.setProperty('--_splitter-columns', trackTemplate);
			}
		});
	}

	function startResize(index: number, event: PointerEvent) {
		resizingIndex = index;
		startPos = orientation === 'horizontal' ? event.clientX : event.clientY;
		startSizes = [...sizes];
		(event.target as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (resizingIndex < 0) return;
		const rootEl = event.currentTarget as HTMLElement;
		const rect = rootEl.getBoundingClientRect();
		const totalSize = orientation === 'horizontal' ? rect.width : rect.height;
		const currentPos = orientation === 'horizontal' ? event.clientX : event.clientY;
		const delta = currentPos - startPos;
		const deltaPercent = (delta / totalSize) * 100;

		const newSizes = [...startSizes];
		const minSize = 10;
		const newLeft = (startSizes[resizingIndex] ?? 0) + deltaPercent;
		const newRight = (startSizes[resizingIndex + 1] ?? 0) - deltaPercent;

		if (newLeft >= minSize && newRight >= minSize) {
			newSizes[resizingIndex] = newLeft;
			newSizes[resizingIndex + 1] = newRight;
			sizes = newSizes;
		}
	}

	function onPointerUp() {
		resizingIndex = -1;
	}

	let panelCount = 0;
	let handleCount = 0;

	setSplitterCtx({
		get orientation() {
			return orientation;
		},
		get sizes() {
			return sizes;
		},
		setSizes(newSizes: number[]) {
			sizes = newSizes;
		},
		startResize,
		nextPanelIndex() {
			return panelCount++;
		},
		nextHandleIndex() {
			return handleCount++;
		}
	});
</script>

<div
	{@attach applyGridTemplate}
	data-part="root"
	data-orientation={orientation}
	class={className}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: var(--_splitter-columns, 1fr max-content 1fr);
		height: 100%;
		min-height: 0;
		align-items: stretch;
	}

	[data-part='root'][data-orientation='vertical'] {
		grid-auto-flow: row;
		grid-template-columns: initial;
		grid-template-rows: var(--_splitter-rows, 1fr max-content 1fr);
	}
</style>
