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
		value?: number | undefined;
		max?: number;
		segments?: ProgressSegment[];
		thresholds?: ProgressThreshold[];
		showLabel?: boolean | 'inside' | 'outside';
	}

	let { value, max = 100, segments, thresholds, showLabel, ...rest }: Props = $props();

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

	function applyIndicatorStyles(node: HTMLElement) {
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
				node.style.setProperty('background-color', threshold.color);
			}
		});
	}
</script>

<div
	role="progressbar"
	aria-valuenow={effectiveValue}
	aria-valuemin={0}
	aria-valuemax={max}
	data-state={effectiveValue != null ? 'determinate' : 'indeterminate'}
	data-value={effectiveValue}
	data-max={max}
	data-segmented={segments ? '' : undefined}
	data-has-label={showLabel ? labelPosition : undefined}
	{...rest}
>
	{#if segments}
		<div data-part="track">
			{#each segments as segment}
				<div data-part="segment" use:applySegmentStyles={() => segment} title={segment.label}></div>
			{/each}
		</div>
	{:else}
		<div data-part="indicator" use:applyIndicatorStyles></div>
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
