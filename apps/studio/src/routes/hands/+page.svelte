<script lang="ts">
	import { HandTracking } from '@dryui/hand-tracking';
	import HandTrackingDebug from './HandTrackingDebug.svelte';
	import InteractiveBox from './InteractiveBox.svelte';
	import LayoutGrid from './LayoutGrid.svelte';

	type Viewport = { label: string; width: number; height: number; full?: boolean };

	const presets: Viewport[] = [
		{ label: 'Mobile', width: 375, height: 667 },
		{ label: 'Tablet', width: 768, height: 1024 },
		{ label: 'Laptop', width: 1280, height: 800 },
		{ label: 'Full Screen', width: 0, height: 0, full: true }
	];

	type GridPreset = { label: string; cols: number; rows: number };

	const grids: GridPreset[] = [
		{ label: '2×2', cols: 2, rows: 2 },
		{ label: '3×3', cols: 3, rows: 3 },
		{ label: '2×1', cols: 2, rows: 1 },
		{ label: '1×2', cols: 1, rows: 2 }
	];

	let selected = $state(2);
	let innerW = $state(0);
	let innerH = $state(0);
	let toolbarH = $state(0);
	let controlBarH = $state(0);
	let showDebug = $state(false);

	let colDividers = $state<number[]>([]);
	let rowDividers = $state<number[]>([]);
	let lastApplied = $state<string | null>(null);

	let hasGrid = $derived(colDividers.length > 0 || rowDividers.length > 0);

	let viewport = $derived.by(() => {
		const vp = presets[selected]!;
		if (vp.full)
			return { label: vp.label, width: innerW, height: innerH - toolbarH - controlBarH - 2 };
		return vp;
	});

	function applyGrid(preset: GridPreset) {
		if (lastApplied === preset.label && hasGrid) {
			colDividers = [];
			rowDividers = [];
			lastApplied = null;
			return;
		}
		const c: number[] = [];
		for (let i = 1; i < preset.cols; i++) c.push(i / preset.cols);
		const r: number[] = [];
		for (let i = 1; i < preset.rows; i++) r.push(i / preset.rows);
		colDividers = c;
		rowDividers = r;
		lastApplied = preset.label;
	}
</script>

<svelte:window bind:innerWidth={innerW} bind:innerHeight={innerH} />

<svelte:head>
	<title>dryui studio — layout</title>
</svelte:head>

<section class="layout-tool">
	<nav class="toolbar" bind:clientHeight={toolbarH}>
		{#each presets as vp, i}
			<button class="viewport-btn" class:active={selected === i} onclick={() => (selected = i)}>
				{vp.label}
				{#if !vp.full}
					<span class="viewport-size">{vp.width}&times;{vp.height}</span>
				{/if}
			</button>
		{/each}

		<div class="toolbar-spacer"></div>

		<button class="debug-toggle" onclick={() => (showDebug = !showDebug)}>
			{showDebug ? 'Hide' : 'Debug'}
		</button>
	</nav>

	<div class="canvas-area" class:full={presets[selected]?.full}>
		<div class="canvas" style="width: {viewport.width}px; height: {viewport.height}px;">
			<HandTracking.Root
				class="hands-overlay"
				autoStart={true}
				showVideo={false}
				showCalibrator={false}
				overlayWidth={320}
				overlayHeight={240}
			>
				{#if hasGrid}
					<LayoutGrid
						canvasWidth={viewport.width}
						canvasHeight={viewport.height}
						bind:cols={colDividers}
						bind:rows={rowDividers}
					/>
				{/if}
				<InteractiveBox canvasWidth={viewport.width} canvasHeight={viewport.height} />
				{#if showDebug}
					<HandTrackingDebug />
				{/if}
			</HandTracking.Root>
		</div>
	</div>

	<nav class="control-bar" bind:clientHeight={controlBarH}>
		{#each grids as g}
			<button
				class="grid-btn"
				class:active={lastApplied === g.label && hasGrid}
				onclick={() => applyGrid(g)}
			>
				<svg class="grid-icon" viewBox="0 0 32 32" width="32" height="32">
					<!-- Outer frame -->
					<rect
						x="1"
						y="1"
						width="30"
						height="30"
						rx="3"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					/>
					<!-- Column dividers -->
					{#each { length: g.cols - 1 } as _, ci}
						{@const x = ((ci + 1) / g.cols) * 30 + 1}
						<line x1={x} y1="1" x2={x} y2="31" stroke="currentColor" stroke-width="1" />
					{/each}
					<!-- Row dividers -->
					{#each { length: g.rows - 1 } as _, ri}
						{@const y = ((ri + 1) / g.rows) * 30 + 1}
						<line x1="1" y1={y} x2="31" y2={y} stroke="currentColor" stroke-width="1" />
					{/each}
				</svg>
				<span class="grid-label">{g.label}</span>
			</button>
		{/each}
	</nav>
</section>

<style>
	.layout-tool {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: #111;
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 8px 12px;
		background: #1a1a1a;
		border-bottom: 1px solid #333;
		flex-shrink: 0;
	}

	.toolbar-spacer {
		flex: 1;
	}

	.viewport-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 6px 16px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 4px;
		color: #888;
		font-size: 13px;
		cursor: pointer;
	}

	.viewport-btn:hover {
		color: #ccc;
		background: #222;
	}

	.viewport-btn.active {
		color: #fff;
		border-color: #555;
		background: #2a2a2a;
	}

	.viewport-size {
		font-size: 10px;
		opacity: 0.6;
	}

	.debug-toggle {
		padding: 4px 10px;
		background: transparent;
		border: 1px solid #444;
		border-radius: 4px;
		color: #888;
		font-size: 11px;
		cursor: pointer;
	}

	.debug-toggle:hover {
		color: #ccc;
		background: #222;
	}

	.canvas-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: auto;
		padding: 24px;
	}

	.canvas-area.full {
		padding: 0;
	}

	.canvas {
		position: relative;
		background: #1a1a2e;
		border: 1px solid #333;
		overflow: hidden;
		flex-shrink: 0;
	}

	.full .canvas {
		border: none;
	}

	.hands-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.hands-overlay canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		transform: scaleX(-1);
	}
</style>
