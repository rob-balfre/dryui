<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { setCycleDiagramCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGSVGElement> {
		phaseCount: number;
		label?: string;
		children: Snippet;
	}

	let {
		phaseCount,
		label,
		class: className,
		children,
		...rest
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let observedSize = $state(320);

	$effect(() => {
		if (!containerEl) return;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				const s = Math.min(Math.round(cr.width) || 320, Math.round(cr.height) || 320);
				observedSize = s;
			}
		});

		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	const size = $derived(observedSize);
	const center = $derived(size / 2);
	const outerRadius = $derived(size * 0.35);

	let nextIndex = 0;

	setCycleDiagramCtx({
		get width() {
			return size;
		},
		get height() {
			return size;
		},
		get centerX() {
			return center;
		},
		get centerY() {
			return center;
		},
		get radius() {
			return outerRadius;
		},
		get phaseCount() {
			return phaseCount;
		},
		registerPhase() {
			return nextIndex++;
		}
	});

	/* Arc arrows between phases */
	const arcs = $derived.by(() => {
		const paths: string[] = [];
		const arrowR = outerRadius + 14;
		const angleStep = (2 * Math.PI) / phaseCount;

		for (let i = 0; i < phaseCount; i++) {
			const gap = 0.35;
			const startAngle = angleStep * i + gap - Math.PI / 2;
			const endAngle = angleStep * (i + 1) - gap - Math.PI / 2;

			const x1 = center + arrowR * Math.cos(startAngle);
			const y1 = center + arrowR * Math.sin(startAngle);
			const x2 = center + arrowR * Math.cos(endAngle);
			const y2 = center + arrowR * Math.sin(endAngle);

			paths.push(`M ${x1} ${y1} A ${arrowR} ${arrowR} 0 0 1 ${x2} ${y2}`);
		}
		return paths;
	});

	const arrowheads = $derived.by(() => {
		const heads: Array<{ x: number; y: number; angle: number }> = [];
		const arrowR = outerRadius + 14;
		const angleStep = (2 * Math.PI) / phaseCount;

		for (let i = 0; i < phaseCount; i++) {
			const gap = 0.35;
			const endAngle = angleStep * (i + 1) - gap - Math.PI / 2;
			const x = center + arrowR * Math.cos(endAngle);
			const y = center + arrowR * Math.sin(endAngle);
			const angle = (endAngle * 180) / Math.PI + 90;
			heads.push({ x, y, angle });
		}
		return heads;
	});
</script>

<div bind:this={containerEl} data-cycle-container>
	<svg
		viewBox="0 0 {size} {size}"
		role="img"
		aria-label={label ?? 'Cycle diagram'}
		data-cycle-diagram
		class={className}
		{...rest}
	>
		<!-- Arc arrows -->
		{#each arcs as d}
			<path {d} data-part="arc" />
		{/each}

		<!-- Arrowheads -->
		{#each arrowheads as head}
			<polygon
				points="-4,-3 0,4 4,-3"
				transform="translate({head.x},{head.y}) rotate({head.angle})"
				data-part="arrowhead"
			/>
		{/each}

		<!-- Center label -->
		{#if label}
			<text
				x={center}
				y={center}
				text-anchor="middle"
				dominant-baseline="central"
				data-part="center-label"
			>
				{label}
			</text>
		{/if}

		{@render children()}
	</svg>
</div>

<style>
	[data-cycle-container] {
		display: grid;
		aspect-ratio: 1;
	}

	[data-cycle-diagram] {
		--dry-cycle-bg: transparent;
		--dry-cycle-arc-color: var(--dry-color-stroke-strong);
		--dry-cycle-label-color: var(--dry-color-text-weak);
		--dry-cycle-node-bg: var(--dry-color-bg-raised);
		--dry-cycle-node-border: var(--dry-color-stroke-weak);
		--dry-cycle-node-color: var(--dry-color-text-strong);

		display: block;
		overflow: visible;
		background: var(--dry-cycle-bg);
	}

	[data-part='arc'] {
		fill: none;
		stroke: var(--dry-cycle-arc-color);
		stroke-width: 1.5;
	}

	[data-part='arrowhead'] {
		fill: var(--dry-cycle-arc-color);
	}

	[data-part='center-label'] {
		font-size: 12px;
		font-weight: 500;
		fill: var(--dry-cycle-label-color);
	}
</style>
