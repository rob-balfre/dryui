<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		selectedElement: HTMLElement | null;
		onselect: (el: HTMLElement | null) => void;
		onclose: () => void;
	}

	let { selectedElement, onselect, onclose }: Props = $props();

	type Box = {
		key: number;
		el: HTMLElement;
		x: number;
		y: number;
		w: number;
		h: number;
		role: 'container' | 'cell';
	};

	let boxes = $state<Box[]>([]);

	function isInsideFeedback(el: Element): boolean {
		return !!el.closest('[data-dryui-feedback]');
	}

	function isGridContainer(cs: CSSStyleDeclaration): boolean {
		return cs.display === 'grid' || cs.display === 'inline-grid';
	}

	function rebuild() {
		const all = document.querySelectorAll<HTMLElement>('body *');
		const next: Box[] = [];
		let key = 0;
		for (const el of all) {
			if (isInsideFeedback(el)) continue;
			const cs = getComputedStyle(el);
			if (cs.visibility === 'hidden' || cs.display === 'none') continue;

			const isGrid = isGridContainer(cs);
			const parent = el.parentElement;
			const parentIsGrid =
				parent && !isInsideFeedback(parent) && isGridContainer(getComputedStyle(parent));

			if (!isGrid && !parentIsGrid) continue;

			const rect = el.getBoundingClientRect();
			if (rect.width < 4 || rect.height < 4) continue;

			next.push({
				key: key++,
				el,
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height,
				role: isGrid ? 'container' : 'cell'
			});
		}

		if (!boxesEqual(boxes, next)) boxes = next;
	}

	function boxesEqual(a: Box[], b: Box[]): boolean {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			const x = a[i]!;
			const y = b[i]!;
			if (
				x.el !== y.el ||
				x.x !== y.x ||
				x.y !== y.y ||
				x.w !== y.w ||
				x.h !== y.h ||
				x.role !== y.role
			) {
				return false;
			}
		}
		return true;
	}

	let rebuildFrame = 0;
	function scheduleRebuild() {
		if (rebuildFrame) return;
		rebuildFrame = requestAnimationFrame(() => {
			rebuildFrame = 0;
			rebuild();
		});
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			if (selectedElement) onselect(null);
			else onclose();
		}
	}

	function handleSelect(e: MouseEvent, box: Box) {
		e.stopPropagation();
		onselect(box.el);
	}

	onMount(() => {
		rebuild();
		const ro = new ResizeObserver(scheduleRebuild);
		ro.observe(document.body);
		window.addEventListener('scroll', scheduleRebuild, true);
		window.addEventListener('resize', scheduleRebuild);
		window.addEventListener('keydown', handleKey, true);

		return () => {
			if (rebuildFrame) cancelAnimationFrame(rebuildFrame);
			ro.disconnect();
			window.removeEventListener('scroll', scheduleRebuild, true);
			window.removeEventListener('resize', scheduleRebuild);
			window.removeEventListener('keydown', handleKey, true);
		};
	});
</script>

<div class="layout-inspector">
	{#each boxes as box (box.key)}
		<button
			class="layout-box"
			type="button"
			data-role={box.role}
			data-selected={selectedElement === box.el || undefined}
			style:left="{box.x}px"
			style:top="{box.y}px"
			style:width="{box.w}px"
			style:height="{box.h}px"
			aria-label={`Select ${box.role} ${box.el.tagName.toLowerCase()}`}
			onclick={(e) => handleSelect(e, box)}
		></button>
	{/each}
</div>

<style>
	.layout-inspector {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
	}

	.layout-box {
		position: fixed;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		pointer-events: auto;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}

	.layout-box[data-role='container'] {
		outline: 2px solid hsl(25 100% 55%);
		outline-offset: -1px;
		background: hsl(25 100% 55% / 0.04);
	}

	.layout-box[data-role='cell'] {
		outline: 1px dashed hsl(25 100% 55% / 0.5);
		outline-offset: -0.5px;
	}

	.layout-box:hover {
		background: hsl(25 100% 55% / 0.1);
	}

	.layout-box[data-selected] {
		outline: 3px solid hsl(25 100% 55%);
		outline-offset: -1.5px;
		background: hsl(25 100% 55% / 0.16);
		box-shadow: 0 0 0 1px hsl(25 100% 55% / 0.4) inset;
	}

	.layout-box[data-selected][data-role='cell'] {
		outline-style: solid;
	}

	.layout-box:focus-visible {
		outline-color: hsl(25 100% 67%);
	}
</style>
