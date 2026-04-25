<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	type Box = {
		key: number;
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
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height,
				role: isGrid ? 'container' : 'cell'
			});
		}
		boxes = next;
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			onclose();
		}
	}

	onMount(() => {
		rebuild();
		const ro = new ResizeObserver(rebuild);
		ro.observe(document.body);
		window.addEventListener('scroll', rebuild, true);
		window.addEventListener('resize', rebuild);
		window.addEventListener('keydown', handleKey, true);

		return () => {
			ro.disconnect();
			window.removeEventListener('scroll', rebuild, true);
			window.removeEventListener('resize', rebuild);
			window.removeEventListener('keydown', handleKey, true);
		};
	});
</script>

<div class="layout-inspector" aria-hidden="true">
	{#each boxes as box (box.key)}
		<div
			class="layout-box"
			data-role={box.role}
			style:left="{box.x}px"
			style:top="{box.y}px"
			style:width="{box.w}px"
			style:height="{box.h}px"
		></div>
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
		pointer-events: none;
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
</style>
