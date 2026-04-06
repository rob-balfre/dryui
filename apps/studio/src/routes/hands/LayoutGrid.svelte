<script lang="ts">
	import { onMount } from 'svelte';
	import { getHandTrackingContext } from '@dryui/hand-tracking';
	import type { HandLandmarks } from '@dryui/hand-tracking';

	let {
		canvasWidth,
		canvasHeight,
		cols = $bindable([]),
		rows = $bindable([])
	}: {
		canvasWidth: number;
		canvasHeight: number;
		cols: number[];
		rows: number[];
	} = $props();

	const ctx = getHandTrackingContext();

	const PINCH_THRESHOLD = 0.18;
	const PINCH_RELEASE_THRESHOLD = 0.24;
	const PINCH_CONFIRM_FRAMES = 2;
	const RELEASE_CONFIRM_FRAMES = 4;
	const SMOOTHING = 0.3;
	const GRAB_DISTANCE = 28;
	const TAP_MAX_FRAMES = 12;
	const MIN_FRAC = 0.04;
	const MAX_FRAC = 0.96;

	type LineRef = { axis: 'col' | 'row'; index: number };
	type HitResult = { line: LineRef; seg: number };

	// Segment visibility per line.
	// colSegs[i] has rows.length+1 booleans (segments between row boundaries)
	// rowSegs[i] has cols.length+1 booleans (segments between col boundaries)
	let colSegs = $state<boolean[][]>([]);
	let rowSegs = $state<boolean[][]>([]);

	let hoveredHit = $state<HitResult | null>(null);
	let grabbedHit = $state<HitResult | null>(null);
	let isDragging = $state(false);

	let holdFrames = 0;
	let smoothValue = 0;
	let lastColCount = -1;
	let lastRowCount = -1;

	function syncSegments() {
		const nc = cols.length;
		const nr = rows.length;
		if (nc !== lastColCount || nr !== lastRowCount) {
			colSegs = Array.from({ length: nc }, () => Array(nr + 1).fill(true));
			rowSegs = Array.from({ length: nr }, () => Array(nc + 1).fill(true));
			lastColCount = nc;
			lastRowCount = nr;
		}
	}

	function segmentIndex(ref: LineRef, cx: number, cy: number): number {
		if (ref.axis === 'col') {
			for (let i = 0; i < rows.length; i++) {
				if (cy < rows[i]! * canvasHeight) return i;
			}
			return rows.length;
		}
		for (let i = 0; i < cols.length; i++) {
			if (cx < cols[i]! * canvasWidth) return i;
		}
		return cols.length;
	}

	function pinchDistance(hand: HandLandmarks): number {
		const thumb = hand.points[4];
		const index = hand.points[8];
		if (!thumb || !index) return Infinity;
		return (
			Math.hypot(thumb.x - index.x, thumb.y - index.y) /
			Math.max(hand.boundingBox.width, hand.boundingBox.height, 1)
		);
	}

	function closestHand(): HandLandmarks | null {
		let best: HandLandmarks | null = null;
		let bestD = Infinity;
		for (const h of ctx.hands) {
			const d = pinchDistance(h);
			if (d < bestD) {
				bestD = d;
				best = h;
			}
		}
		return best;
	}

	function cursorPos(hand: HandLandmarks): { x: number; y: number } | null {
		const t = hand.points[4];
		const idx = hand.points[8];
		if (!t || !idx) return null;
		const fw = ctx.debug.frameWidth || 320;
		const fh = ctx.debug.frameHeight || 240;
		return {
			x: (1 - (t.x + idx.x) / 2 / fw) * canvasWidth,
			y: ((t.y + idx.y) / 2 / fh) * canvasHeight
		};
	}

	function hitTest(cx: number, cy: number): HitResult | null {
		let bestDist = GRAB_DISTANCE;
		let best: HitResult | null = null;
		for (let i = 0; i < cols.length; i++) {
			const d = Math.abs(cx - cols[i]! * canvasWidth);
			if (d < bestDist) {
				const seg = segmentIndex({ axis: 'col', index: i }, cx, cy);
				if (colSegs[i]?.[seg]) {
					bestDist = d;
					best = { line: { axis: 'col', index: i }, seg };
				}
			}
		}
		for (let i = 0; i < rows.length; i++) {
			const d = Math.abs(cy - rows[i]! * canvasHeight);
			if (d < bestDist) {
				const seg = segmentIndex({ axis: 'row', index: i }, cx, cy);
				if (rowSegs[i]?.[seg]) {
					bestDist = d;
					best = { line: { axis: 'row', index: i }, seg };
				}
			}
		}
		return best;
	}

	function ema(cur: number, tgt: number, f: number): number {
		return cur + (tgt - cur) * (1 - f);
	}

	function clamp(v: number, lo: number, hi: number): number {
		return Math.max(lo, Math.min(hi, v));
	}

	function removeSegment(hit: HitResult) {
		const { line, seg } = hit;
		const isCol = line.axis === 'col';
		const segs = isCol ? colSegs : rowSegs;

		// Build updated segment array for this line (full reassignment for reactivity)
		const updated = segs[line.index]!.map((v: boolean, i: number) => (i === seg ? false : v));

		if (updated.every((s: boolean) => !s)) {
			// All segments gone — remove the entire line
			if (isCol) {
				cols = cols.filter((_, i) => i !== line.index);
				colSegs = colSegs.filter((_, i) => i !== line.index);
				rowSegs = rowSegs.map((s) => {
					const next = [...s];
					const merged = next[line.index] || next[line.index + 1] || false;
					next.splice(line.index, 2, merged);
					return next;
				});
			} else {
				rows = rows.filter((_, i) => i !== line.index);
				rowSegs = rowSegs.filter((_, i) => i !== line.index);
				colSegs = colSegs.map((s) => {
					const next = [...s];
					const merged = next[line.index] || next[line.index + 1] || false;
					next.splice(line.index, 2, merged);
					return next;
				});
			}
			lastColCount = cols.length;
			lastRowCount = rows.length;
		} else {
			// Only this segment removed — reassign entire array to trigger reactivity
			if (isCol) {
				colSegs = colSegs.map((arr, i) => (i === line.index ? updated : arr));
			} else {
				rowSegs = rowSegs.map((arr, i) => (i === line.index ? updated : arr));
			}
		}
	}

	function segMatch(hit: HitResult | null, axis: 'col' | 'row', li: number, si: number): boolean {
		return hit !== null && hit.line.axis === axis && hit.line.index === li && hit.seg === si;
	}

	function lineMatch(hit: HitResult | null, axis: 'col' | 'row', li: number): boolean {
		return hit !== null && hit.line.axis === axis && hit.line.index === li;
	}

	onMount(() => {
		let frame = 0;
		let stable = false;
		let prev = false;
		let pFrames = 0;
		let rFrames = 0;

		const tick = () => {
			syncSegments();

			const hand = closestHand();
			const rawP = hand ? pinchDistance(hand) < PINCH_THRESHOLD : false;
			const rawR = !hand || pinchDistance(hand) > PINCH_RELEASE_THRESHOLD;

			if (rawP) {
				pFrames++;
				rFrames = 0;
			} else if (rawR) {
				rFrames++;
				pFrames = 0;
			}

			if (!stable && pFrames >= PINCH_CONFIRM_FRAMES) stable = true;
			else if (stable && rFrames >= RELEASE_CONFIRM_FRAMES) stable = false;

			const started = stable && !prev;
			const ended = !stable && prev;
			prev = stable;

			const cur = hand ? cursorPos(hand) : null;

			if (!grabbedHit) {
				hoveredHit = cur ? hitTest(cur.x, cur.y) : null;

				if (started && cur) {
					const hit = hitTest(cur.x, cur.y);
					if (hit) {
						grabbedHit = hit;
						isDragging = false;
						holdFrames = 0;
						smoothValue = hit.line.axis === 'col' ? cols[hit.line.index]! : rows[hit.line.index]!;
					}
				}
			} else {
				holdFrames++;

				if (!isDragging && holdFrames > TAP_MAX_FRAMES) {
					isDragging = true;
				}

				if (rawP && cur && isDragging) {
					const raw = grabbedHit.line.axis === 'col' ? cur.x / canvasWidth : cur.y / canvasHeight;
					smoothValue = ema(smoothValue, clamp(raw, MIN_FRAC, MAX_FRAC), SMOOTHING);
					if (grabbedHit.line.axis === 'col') cols[grabbedHit.line.index] = smoothValue;
					else rows[grabbedHit.line.index] = smoothValue;
				}

				if (ended) {
					if (!isDragging) removeSegment(grabbedHit);
					grabbedHit = null;
					isDragging = false;
				}

				if (!rawP && !stable) {
					grabbedHit = null;
					isDragging = false;
				}
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

<!-- Grid cells -->
{#each rows as _r, ri}
	{#each cols as _c, ci}
		{@const left = ci === 0 ? 0 : (cols[ci - 1] ?? 0) * canvasWidth}
		{@const right = (cols[ci] ?? 0) * canvasWidth}
		{@const top = ri === 0 ? 0 : (rows[ri - 1] ?? 0) * canvasHeight}
		{@const bottom = (rows[ri] ?? 0) * canvasHeight}
		<div
			class="grid-cell"
			style="left:{left}px;top:{top}px;width:{right - left}px;height:{bottom - top}px"
		></div>
	{/each}
	{@const left = cols.length > 0 ? (cols[cols.length - 1] ?? 0) * canvasWidth : 0}
	{@const top = ri === 0 ? 0 : (rows[ri - 1] ?? 0) * canvasHeight}
	{@const bottom = (rows[ri] ?? 0) * canvasHeight}
	<div
		class="grid-cell"
		style="left:{left}px;top:{top}px;width:{canvasWidth - left}px;height:{bottom - top}px"
	></div>
{/each}
{#if rows.length > 0}
	{#each cols as _c, ci}
		{@const left = ci === 0 ? 0 : (cols[ci - 1] ?? 0) * canvasWidth}
		{@const right = (cols[ci] ?? 0) * canvasWidth}
		{@const top = (rows[rows.length - 1] ?? 0) * canvasHeight}
		<div
			class="grid-cell"
			style="left:{left}px;top:{top}px;width:{right - left}px;height:{canvasHeight - top}px"
		></div>
	{/each}
	{@const left = cols.length > 0 ? (cols[cols.length - 1] ?? 0) * canvasWidth : 0}
	{@const top = (rows[rows.length - 1] ?? 0) * canvasHeight}
	<div
		class="grid-cell"
		style="left:{left}px;top:{top}px;width:{canvasWidth - left}px;height:{canvasHeight - top}px"
	></div>
{/if}

<!-- Column segments -->
{#each cols as frac, ci}
	{#each Array.from({ length: rows.length + 1 }) as _, si}
		{#if colSegs[ci]?.[si]}
			{@const x = frac * canvasWidth}
			{@const segTop = si === 0 ? 0 : (rows[si - 1] ?? 0) * canvasHeight}
			{@const segBot = si >= rows.length ? canvasHeight : (rows[si] ?? 0) * canvasHeight}
			<div
				class="grid-line v"
				class:hovered={segMatch(hoveredHit, 'col', ci, si) && !grabbedHit}
				class:pending={segMatch(grabbedHit, 'col', ci, si) && !isDragging}
				class:dragging={lineMatch(grabbedHit, 'col', ci) && isDragging}
				style="left:{x}px;top:{segTop}px;height:{segBot - segTop}px"
			></div>
		{/if}
	{/each}
{/each}

<!-- Row segments -->
{#each rows as frac, ri}
	{#each Array.from({ length: cols.length + 1 }) as _, si}
		{#if rowSegs[ri]?.[si]}
			{@const y = frac * canvasHeight}
			{@const segLeft = si === 0 ? 0 : (cols[si - 1] ?? 0) * canvasWidth}
			{@const segRight = si >= cols.length ? canvasWidth : (cols[si] ?? 0) * canvasWidth}
			<div
				class="grid-line h"
				class:hovered={segMatch(hoveredHit, 'row', ri, si) && !grabbedHit}
				class:pending={segMatch(grabbedHit, 'row', ri, si) && !isDragging}
				class:dragging={lineMatch(grabbedHit, 'row', ri) && isDragging}
				style="top:{y}px;left:{segLeft}px;width:{segRight - segLeft}px"
			></div>
		{/if}
	{/each}
{/each}

<style>
	.grid-cell {
		position: absolute;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 2px;
		pointer-events: none;
	}

	.grid-line {
		position: absolute;
		pointer-events: none;
		z-index: 2;
		transition:
			background 0.1s ease,
			box-shadow 0.1s ease;
	}

	.grid-line.v {
		width: 1px;
		background: rgba(255, 255, 255, 0.18);
		transform: translateX(-0.5px);
	}

	.grid-line.h {
		height: 1px;
		background: rgba(255, 255, 255, 0.18);
		transform: translateY(-0.5px);
	}

	/* Hover = red (delete affordance) */
	.grid-line.hovered {
		background: rgba(255, 80, 60, 0.7);
	}

	.grid-line.v.hovered {
		width: 3px;
		transform: translateX(-1.5px);
		box-shadow: 0 0 10px rgba(255, 80, 60, 0.35);
	}

	.grid-line.h.hovered {
		height: 3px;
		transform: translateY(-1.5px);
		box-shadow: 0 0 10px rgba(255, 80, 60, 0.35);
	}

	/* Pending = bright red (pinched, will delete on release) */
	.grid-line.pending {
		background: rgba(255, 60, 40, 1);
	}

	.grid-line.v.pending {
		width: 3px;
		transform: translateX(-1.5px);
		box-shadow: 0 0 16px rgba(255, 60, 40, 0.6);
	}

	.grid-line.h.pending {
		height: 3px;
		transform: translateY(-1.5px);
		box-shadow: 0 0 16px rgba(255, 60, 40, 0.6);
	}

	/* Dragging = blue (repositioning entire line) */
	.grid-line.dragging {
		background: rgba(100, 220, 255, 1);
	}

	.grid-line.v.dragging {
		width: 3px;
		transform: translateX(-1.5px);
		box-shadow: 0 0 16px rgba(100, 180, 255, 0.6);
	}

	.grid-line.h.dragging {
		height: 3px;
		transform: translateY(-1.5px);
		box-shadow: 0 0 16px rgba(100, 180, 255, 0.6);
	}
</style>
