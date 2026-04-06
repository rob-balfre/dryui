<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: number | undefined;
		max?: number;
		size?: number;
		strokeWidth?: number;
		color?: 'primary' | 'gray' | 'green' | 'red' | 'yellow';
		indeterminate?: boolean;
	}

	let {
		value,
		max = 100,
		size = 40,
		strokeWidth = 4,
		color = 'primary',
		indeterminate = false,
		class: className,
		...rest
	}: Props = $props();

	const resolvedValue = $derived(indeterminate ? undefined : value);
	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const percentage = $derived(
		resolvedValue != null && max > 0
			? Math.min(Math.max((resolvedValue / max) * 100, 0), 100)
			: undefined
	);
	const offset = $derived(
		percentage != null ? circumference - (percentage / 100) * circumference : undefined
	);
</script>

<div
	class={className}
	role="progressbar"
	aria-valuenow={resolvedValue}
	aria-valuemin={0}
	aria-valuemax={max}
	data-state={resolvedValue != null ? 'determinate' : 'indeterminate'}
	data-value={resolvedValue}
	data-max={max}
	data-color={color}
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

<style>
	div[role='progressbar'] {
		/* Component tokens (Tier 3) */
		--dry-progress-ring-indeterminate-speed: 1.4s;

		display: inline-grid;
		place-items: center;
	}

	div[role='progressbar'] [data-part='track'] {
		stroke: var(--dry-progress-ring-track-color, var(--dry-color-stroke-weak));
		opacity: 1;
	}

	div[role='progressbar'] [data-part='indicator'] {
		stroke: var(--dry-progress-ring-indicator-color, var(--dry-color-fill-brand));
		transition: stroke-dashoffset var(--dry-duration-normal) var(--dry-ease-default);
	}

	/* ── Indeterminate state ──────────────────────────────────────────────────── */

	div[data-state='indeterminate'] {
		animation: progress-ring-rotate var(--dry-progress-ring-indeterminate-speed) linear infinite;
	}

	div[data-state='indeterminate'] [data-part='indicator'] {
		stroke-dashoffset: 0;
		animation: progress-ring-dash var(--dry-progress-ring-indeterminate-speed) ease-in-out infinite;
	}

	@keyframes progress-ring-rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes progress-ring-dash {
		0% {
			stroke-dashoffset: 80%;
		}
		50% {
			stroke-dashoffset: 20%;
		}
		100% {
			stroke-dashoffset: 80%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		div[data-state='indeterminate'] {
			animation: progress-ring-pulse 2s ease-in-out infinite;
		}

		div[data-state='indeterminate'] [data-part='indicator'] {
			animation: none;
		}

		div[role='progressbar'] [data-part='indicator'] {
			transition: none;
		}
	}

	@keyframes progress-ring-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	/* ── Colors ────────────────────────────────────────────────────────────────── */

	[data-color='primary'] {
		--dry-progress-ring-indicator-color: var(--dry-color-fill-brand);
	}

	[data-color='gray'] {
		--dry-progress-ring-indicator-color: var(--dry-color-icon);
	}

	[data-color='green'] {
		--dry-progress-ring-indicator-color: var(--dry-color-fill-success);
	}

	[data-color='red'] {
		--dry-progress-ring-indicator-color: var(--dry-color-fill-error);
	}

	[data-color='yellow'] {
		--dry-progress-ring-indicator-color: var(--dry-color-fill-warning);
	}
</style>
