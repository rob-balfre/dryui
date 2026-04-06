<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface ProgressSegment {
		value: number;
		color: string;
		label?: string;
	}

	interface ProgressThreshold {
		value: number;
		color?: string;
	}

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: number;
		max?: number;
		size?: 'sm' | 'md' | 'lg';
		color?: 'blue' | 'green' | 'red' | 'yellow';
		segments?: ProgressSegment[];
		thresholds?: ProgressThreshold[];
		showLabel?: boolean | 'inside' | 'outside';
	}

	let {
		value,
		max = 100,
		size = 'md',
		color = 'blue',
		segments,
		thresholds,
		showLabel,
		class: className,
		...rest
	}: Props = $props();

	const segmentsTotal = $derived(segments ? segments.reduce((sum, s) => sum + s.value, 0) : 0);
	const effectiveValue = $derived(segments ? segmentsTotal : value);
	const percentage = $derived(
		effectiveValue != null && max > 0
			? Math.min(Math.max((effectiveValue / max) * 100, 0), 100)
			: effectiveValue != null
				? 0
				: undefined
	);

	const labelPosition = $derived(
		showLabel === true
			? 'outside'
			: showLabel === 'inside'
				? 'inside'
				: showLabel === 'outside'
					? 'outside'
					: undefined
	);

	const labelText = $derived(percentage != null ? `${Math.round(percentage)}%` : undefined);

	function applySegmentStyles(node: HTMLElement, getSegment: () => ProgressSegment) {
		$effect(() => {
			const segment = getSegment();
			const widthPct = max > 0 ? Math.min(Math.max((segment.value / max) * 100, 0), 100) : 0;
			node.style.setProperty('width', `${widthPct}%`);
			node.style.setProperty('background-color', segment.color);
		});
	}

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--dry-progress-value', percentage != null ? `${percentage}%` : '');
		});
	}

	function applyThresholdStyles(node: HTMLElement, getThreshold: () => ProgressThreshold) {
		$effect(() => {
			const threshold = getThreshold();
			const leftPct = max > 0 ? Math.min(Math.max((threshold.value / max) * 100, 0), 100) : 0;
			node.style.setProperty('left', `${leftPct}%`);
			if (threshold.color) {
				node.style.setProperty('border-inline-start-color', threshold.color);
			}
		});
	}
</script>

<div
	use:applyRootStyles
	class={className}
	role="progressbar"
	aria-valuenow={effectiveValue}
	aria-valuemin={0}
	aria-valuemax={max}
	data-state={effectiveValue != null ? 'determinate' : 'indeterminate'}
	data-value={effectiveValue}
	data-max={max}
	data-segmented={segments ? '' : undefined}
	data-has-label={showLabel ? labelPosition : undefined}
	data-size={size}
	data-color={color}
	data-with-label={showLabel ? '' : undefined}
	{...rest}
>
	{#if segments}
		<div data-part="track">
			{#each segments as segment}
				<div data-part="segment" use:applySegmentStyles={() => segment} title={segment.label}></div>
			{/each}
		</div>
	{:else}
		<div data-part="indicator"></div>
	{/if}

	{#if thresholds}
		{#each thresholds as threshold}
			<div data-part="threshold" use:applyThresholdStyles={() => threshold}></div>
		{/each}
	{/if}

	{#if showLabel && labelText}
		<span data-part="label" data-position={labelPosition}>{labelText}</span>
	{/if}
</div>

<style>
	div[role='progressbar'] {
		/* Component tokens (Tier 3) */
		--dry-progress-radius: var(--dry-radius-full);
		--dry-progress-bar: var(--dry-color-fill-selected);

		display: grid;
		grid-template-columns: var(--dry-progress-value, 0%) 1fr;
		position: relative;
		box-sizing: border-box;
		height: var(--dry-progress-height, var(--dry-space-2));
		overflow: hidden;
		border-radius: var(--dry-progress-radius);
		background-color: var(--dry-progress-track, var(--dry-color-fill));
		border: 1px solid var(--dry-color-stroke-weak);
		box-shadow: var(--dry-shadow-sunken);
		transition: grid-template-columns var(--dry-duration-normal) var(--dry-ease-default);
	}

	div[role='progressbar'] > [data-part='indicator'] {
		height: 100%;
		border-radius: var(--dry-progress-radius);
		background-color: var(--dry-progress-bar);
	}

	/* ── Indeterminate state ──────────────────────────────────────────────────── */

	div[data-state='indeterminate'] {
		grid-template-columns: 100%;
	}

	div[data-state='indeterminate'] > [data-part='indicator'] {
		background-image: repeating-linear-gradient(
			-45deg,
			transparent,
			transparent 8px,
			color-mix(in srgb, var(--dry-progress-bar) 60%, transparent) 8px,
			color-mix(in srgb, var(--dry-progress-bar) 60%, transparent) 16px
		);
		background-size: 200% 100%;
		animation: progress-stripe 1s linear infinite;
	}

	@keyframes progress-stripe {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 32px 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		div[data-state='indeterminate'] > [data-part='indicator'] {
			animation: none;
			background-image: none;
			background-color: color-mix(in srgb, var(--dry-progress-bar) 50%, transparent);
		}

		div[role='progressbar'] {
			transition: none;
		}

		[data-part='segment'] {
			transition: none;
		}
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--dry-progress-height: var(--dry-space-1);
	}

	[data-size='md'] {
		--dry-progress-height: var(--dry-space-2);
	}

	[data-size='lg'] {
		--dry-progress-height: var(--dry-space-3);
	}

	/* ── Colors ────────────────────────────────────────────────────────────────── */

	[data-color='blue'] {
		--dry-progress-bar: var(--dry-color-fill-brand);
	}

	[data-color='green'] {
		--dry-progress-bar: var(--dry-color-fill-success);
		--dry-progress-label-inside: var(--dry-color-on-success);
	}

	[data-color='red'] {
		--dry-progress-bar: var(--dry-color-fill-error);
		--dry-progress-label-inside: var(--dry-color-on-error);
	}

	[data-color='yellow'] {
		--dry-progress-bar: var(--dry-color-fill-warning);
		--dry-progress-label-inside: var(--dry-color-on-warning);
	}

	/* ── Segments ─────────────────────────────────────────────────────────────── */

	[data-segmented] [data-part='track'] {
		display: grid;
		grid-auto-flow: column;
		grid-column: 1 / -1;
		overflow: hidden;
		height: 100%;
		border-radius: var(--dry-progress-radius);
	}

	[data-part='segment'] {
		height: 100%;
		transition: width var(--dry-duration-slow, 300ms) ease;
	}

	[data-part='segment']:first-child {
		border-radius: var(--dry-progress-radius, var(--dry-radius-full)) 0 0
			var(--dry-progress-radius, var(--dry-radius-full));
	}

	[data-part='segment']:last-child {
		border-radius: 0 var(--dry-progress-radius, var(--dry-radius-full))
			var(--dry-progress-radius, var(--dry-radius-full)) 0;
	}

	[data-part='segment']:only-child {
		border-radius: var(--dry-progress-radius, var(--dry-radius-full));
	}

	/* ── Thresholds ───────────────────────────────────────────────────────────── */

	[data-part='threshold'] {
		position: absolute;
		top: -4px;
		bottom: -4px;
		border-inline-start: 2px solid var(--dry-color-text-strong, #1a1a2e);
		opacity: 0.3;
		z-index: 1;
	}

	/* ── Labels ───────────────────────────────────────────────────────────────── */

	[data-part='label'] {
		font-size: var(--dry-type-ui-caption-size, var(--dry-text-xs-size, 0.75rem));
		color: var(--dry-color-text-weak, #64748b);
		white-space: nowrap;
	}

	[data-part='label'][data-position='inside'] {
		position: absolute;
		right: var(--dry-space-2, 0.5rem);
		top: 50%;
		transform: translateY(-50%);
		color: var(--dry-progress-label-inside, var(--dry-color-on-brand));
		font-weight: 600;
		z-index: 2;
	}

	[data-part='label'][data-position='outside'] {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-left: var(--dry-space-2, 0.5rem);
	}

	[data-with-label] {
		overflow: visible;
	}
</style>
