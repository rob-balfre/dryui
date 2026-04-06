<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: number | undefined;
		max?: number;
		size?: number;
		strokeWidth?: number;
	}

	let { value, max = 100, size = 40, strokeWidth = 4, ...rest }: Props = $props();

	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const percentage = $derived(
		value != null && max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : undefined
	);
	const offset = $derived(
		percentage != null ? circumference - (percentage / 100) * circumference : undefined
	);
</script>

<div
	role="progressbar"
	aria-valuenow={value}
	aria-valuemin={0}
	aria-valuemax={max}
	data-state={value != null ? 'determinate' : 'indeterminate'}
	data-value={value}
	data-max={max}
	{...rest}
>
	<svg width={size} height={size} viewBox="0 0 {size} {size}" fill="none">
		<circle
			data-part="track"
			cx={size / 2}
			cy={size / 2}
			r={radius}
			stroke-width={strokeWidth}
			stroke="currentColor"
			opacity="0.2"
		/>
		<circle
			data-part="indicator"
			cx={size / 2}
			cy={size / 2}
			r={radius}
			stroke-width={strokeWidth}
			stroke="currentColor"
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={offset ?? circumference * 0.25}
			transform="rotate(-90 {size / 2} {size / 2})"
		/>
	</svg>
</div>
