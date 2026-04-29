<script lang="ts">
	import './area-grid-root.css';

	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type AreaGridMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		maxWidth?: AreaGridMaxWidth;
		fill?: boolean;
		debug?: boolean;
		seams?: boolean;
		children: Snippet;
	}

	let {
		maxWidth = 'xl',
		fill = false,
		debug = false,
		seams = false,
		children,
		class: className,
		...rest
	}: Props = $props();

	let gridEl = $state<HTMLElement | undefined>();
	let seamLayer = $state<HTMLDivElement | undefined>();

	function parseTracks(value: string): number[] {
		const trimmed = value.trim();
		if (!trimmed || trimmed === 'none') return [];
		const tracks: number[] = [];
		let depth = 0;
		let buf = '';
		for (const ch of trimmed) {
			if (ch === '(') depth++;
			else if (ch === ')') depth--;
			if ((ch === ' ' || ch === '\t') && depth === 0) {
				if (buf) {
					const n = parseFloat(buf);
					if (Number.isFinite(n)) tracks.push(n);
					buf = '';
				}
				continue;
			}
			buf += ch;
		}
		if (buf) {
			const n = parseFloat(buf);
			if (Number.isFinite(n)) tracks.push(n);
		}
		return tracks;
	}

	function parseAreas(value: string): string[][] {
		const trimmed = value.trim();
		if (!trimmed || trimmed === 'none') return [];
		const rows: string[][] = [];
		const re = /"([^"]*)"/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(trimmed)) !== null) {
			rows.push(m[1]!.trim().split(/\s+/));
		}
		return rows;
	}

	type Seam = { axis: 'col' | 'row'; x: number; y: number; w: number; h: number };

	function computeSeams(grid: HTMLElement): Seam[] {
		const cs = getComputedStyle(grid);
		const cols = parseTracks(cs.gridTemplateColumns);
		const rows = parseTracks(cs.gridTemplateRows);
		const areas = parseAreas(cs.gridTemplateAreas);
		const out: Seam[] = [];
		const fullHeight = rows.reduce((a, b) => a + b, 0);
		const fullWidth = cols.reduce((a, b) => a + b, 0);

		let cursorX = 0;
		for (let i = 0; i < cols.length - 1; i++) {
			cursorX += cols[i]!;
			const seamX = cursorX;
			if (areas.length === 0) {
				out.push({ axis: 'col', x: seamX, y: 0, w: 1, h: fullHeight });
				continue;
			}
			let segStart: number | null = null;
			let cursorY = 0;
			for (let r = 0; r < areas.length; r++) {
				const seamReal = areas[r]![i] !== areas[r]![i + 1];
				if (seamReal && segStart === null) segStart = cursorY;
				if (!seamReal && segStart !== null) {
					out.push({ axis: 'col', x: seamX, y: segStart, w: 1, h: cursorY - segStart });
					segStart = null;
				}
				cursorY += rows[r] ?? 0;
			}
			if (segStart !== null) {
				out.push({ axis: 'col', x: seamX, y: segStart, w: 1, h: cursorY - segStart });
			}
		}

		let cursorY = 0;
		for (let i = 0; i < rows.length - 1; i++) {
			cursorY += rows[i]!;
			const seamY = cursorY;
			if (areas.length === 0) {
				out.push({ axis: 'row', x: 0, y: seamY, w: fullWidth, h: 1 });
				continue;
			}
			const above = areas[i];
			const below = areas[i + 1];
			if (!above || !below) continue;
			let segStart: number | null = null;
			let cursorX2 = 0;
			const cc = Math.max(above.length, below.length);
			for (let c = 0; c < cc; c++) {
				const seamReal = above[c] !== below[c];
				if (seamReal && segStart === null) segStart = cursorX2;
				if (!seamReal && segStart !== null) {
					out.push({ axis: 'row', x: segStart, y: seamY, w: cursorX2 - segStart, h: 1 });
					segStart = null;
				}
				cursorX2 += cols[c] ?? 0;
			}
			if (segStart !== null) {
				out.push({ axis: 'row', x: segStart, y: seamY, w: cursorX2 - segStart, h: 1 });
			}
		}

		return out;
	}

	function syncSeams() {
		if (!gridEl || !seamLayer) return;
		const segs = computeSeams(gridEl);
		seamLayer.replaceChildren();
		for (const s of segs) {
			const el = document.createElement('div');
			el.dataset.areaGridSeam = '';
			el.dataset.axis = s.axis;
			el.style.setProperty('position', 'absolute');
			el.style.setProperty('left', `${s.x}px`);
			el.style.setProperty('top', `${s.y}px`);
			el.style.setProperty('width', `${s.w}px`);
			el.style.setProperty('height', `${s.h}px`);
			el.style.setProperty(
				'background',
				'var(--dry-area-grid-seam-color, var(--dry-color-stroke-weak))'
			);
			seamLayer.appendChild(el);
		}
	}

	let raf = 0;
	function scheduleSync() {
		if (raf) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			syncSeams();
		});
	}

	$effect(() => {
		if (!seams || !gridEl || !seamLayer) return;
		syncSeams();
		const ro = new ResizeObserver(scheduleSync);
		const mo = new MutationObserver(scheduleSync);
		ro.observe(gridEl);
		mo.observe(gridEl, { attributes: true, childList: true, subtree: true });
		return () => {
			if (raf) cancelAnimationFrame(raf);
			ro.disconnect();
			mo.disconnect();
		};
	});
</script>

<section
	data-area-grid-shell
	data-max-width={maxWidth}
	data-fill={fill || undefined}
	class={className}
	{...rest}
>
	<section data-area-grid data-debug={debug || undefined} bind:this={gridEl}>
		{@render children()}
		{#if seams}
			<div data-area-grid-seam-layer bind:this={seamLayer} aria-hidden="true"></div>
		{/if}
	</section>
</section>

<style>
	[data-area-grid-shell] {
		--_dry-area-grid-max-inline-size: 80rem;
		--_dry-area-grid-shell-padding-block: var(
			--dry-area-grid-shell-padding-block,
			var(--dry-area-grid-shell-padding, 0)
		);
		--_dry-area-grid-shell-padding-inline: var(
			--dry-area-grid-shell-padding-inline,
			var(--dry-area-grid-shell-padding, 0)
		);

		box-sizing: border-box;
		container-type: inline-size;
		display: grid;
		inline-size: min(100% - 2rem, var(--_dry-area-grid-max-inline-size));
		margin-inline: auto;
		padding-block: var(--_dry-area-grid-shell-padding-block);
		padding-inline: var(--_dry-area-grid-shell-padding-inline);
	}

	[data-area-grid-shell][data-max-width='sm'] {
		--_dry-area-grid-max-inline-size: 40rem;
	}

	[data-area-grid-shell][data-max-width='md'] {
		--_dry-area-grid-max-inline-size: 48rem;
	}

	[data-area-grid-shell][data-max-width='lg'] {
		--_dry-area-grid-max-inline-size: 64rem;
	}

	[data-area-grid-shell][data-max-width='xl'] {
		--_dry-area-grid-max-inline-size: 80rem;
	}

	[data-area-grid-shell][data-max-width='2xl'] {
		--_dry-area-grid-max-inline-size: 96rem;
	}

	[data-area-grid-shell][data-max-width='full'] {
		inline-size: 100%;
	}

	[data-area-grid-shell][data-fill] {
		min-block-size: 100dvh;
	}

	[data-area-grid-shell][data-fill] > [data-area-grid] {
		min-block-size: 100%;
	}

	[data-area-grid] {
		--dry-grid-area-name: auto;
		--_dry-area-grid-columns: var(--dry-area-grid-template-columns, minmax(0, 1fr));
		--_dry-area-grid-rows: var(--dry-area-grid-template-rows, none);
		--_dry-area-grid-template: var(--dry-area-grid-template-areas, none);
		--_dry-area-grid-auto-flow: var(--dry-area-grid-auto-flow, row);
		--_dry-area-grid-auto-rows: var(--dry-area-grid-auto-rows, auto);
		--_dry-area-grid-align-items: var(--dry-area-grid-align-items, stretch);
		--_dry-area-grid-justify-items: var(--dry-area-grid-justify-items, stretch);
		--_dry-area-grid-padding-block: var(
			--dry-area-grid-padding-block,
			var(--dry-area-grid-padding, 0)
		);
		--_dry-area-grid-padding-inline: var(
			--dry-area-grid-padding-inline,
			var(--dry-area-grid-padding, 0)
		);

		position: relative;
		display: grid;
		box-sizing: border-box;
		grid-template-columns: var(--_dry-area-grid-columns);
		grid-template-rows: var(--_dry-area-grid-rows);
		grid-template-areas: var(--_dry-area-grid-template);
		grid-auto-flow: var(--_dry-area-grid-auto-flow);
		grid-auto-rows: var(--_dry-area-grid-auto-rows);
		align-items: var(--_dry-area-grid-align-items);
		justify-items: var(--_dry-area-grid-justify-items);
		padding-block: var(--_dry-area-grid-padding-block);
		padding-inline: var(--_dry-area-grid-padding-inline);
	}

	[data-area-grid-seam-layer] {
		position: absolute;
		inset: 0;
		grid-area: 1 / 1 / -1 / -1;
		pointer-events: none;
	}

	[data-area-grid][data-debug] {
		--dry-area-grid-area-display: grid;
		--dry-area-grid-area-gap: var(--dry-space-2);
		--dry-area-grid-area-padding: var(--dry-space-4);
		--dry-area-grid-area-border: 1px solid var(--dry-color-stroke-weak);
		--dry-area-grid-area-radius: var(--dry-radius-lg);
		--dry-area-grid-area-bg: var(--dry-color-bg-raised);
		--dry-area-grid-area-color: var(--dry-color-text-strong);
	}

	@container (min-width: 720px) {
		[data-area-grid] {
			--_dry-area-grid-columns-wide: var(
				--dry-area-grid-template-columns-wide,
				var(--_dry-area-grid-columns)
			);
			--_dry-area-grid-rows-wide: var(
				--dry-area-grid-template-rows-wide,
				var(--_dry-area-grid-rows)
			);
			--_dry-area-grid-template-wide: var(
				--dry-area-grid-template-areas-wide,
				var(--_dry-area-grid-template)
			);

			grid-template-columns: var(--_dry-area-grid-columns-wide);
			grid-template-rows: var(--_dry-area-grid-rows-wide);
			grid-template-areas: var(--_dry-area-grid-template-wide);
		}
	}

	@container (min-width: 1024px) {
		[data-area-grid] {
			--_dry-area-grid-columns-xl: var(
				--dry-area-grid-template-columns-xl,
				var(--_dry-area-grid-columns-wide)
			);
			--_dry-area-grid-rows-xl: var(
				--dry-area-grid-template-rows-xl,
				var(--_dry-area-grid-rows-wide)
			);
			--_dry-area-grid-template-xl: var(
				--dry-area-grid-template-areas-xl,
				var(--_dry-area-grid-template-wide)
			);

			grid-template-columns: var(--_dry-area-grid-columns-xl);
			grid-template-rows: var(--_dry-area-grid-rows-xl);
			grid-template-areas: var(--_dry-area-grid-template-xl);
		}
	}
</style>
