<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getWeekStartDay, addMonths } from '@dryui/primitives';
	import { setRangeCalendarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		startDate?: Date | null;
		endDate?: Date | null;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		startDate = $bindable<Date | null>(null),
		endDate = $bindable<Date | null>(null),
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	const weekStartDay = $derived(getWeekStartDay(locale));

	let viewMonth = $state(startDate ? startDate.getMonth() : new Date().getMonth());
	let viewYear = $state(startDate ? startDate.getFullYear() : new Date().getFullYear());
	let focusedDate = $state<Date>(startDate ?? new Date());
	let hoveredDate = $state<Date | null>(null);

	let selecting = $state(false);

	setRangeCalendarCtx({
		get startDate() {
			return startDate;
		},
		get endDate() {
			return endDate;
		},
		get hoveredDate() {
			return hoveredDate;
		},
		get focusedDate() {
			return focusedDate;
		},
		get viewMonth() {
			return viewMonth;
		},
		get viewYear() {
			return viewYear;
		},
		get locale() {
			return locale;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get disabled() {
			return disabled;
		},
		get weekStartDay() {
			return weekStartDay;
		},
		selectDate(date: Date) {
			if (!selecting) {
				startDate = date;
				endDate = null;
				selecting = true;
			} else {
				if (date < startDate!) {
					endDate = startDate;
					startDate = date;
				} else {
					endDate = date;
				}
				selecting = false;
			}
			focusedDate = date;
		},
		setHoveredDate(date: Date | null) {
			hoveredDate = date;
		},
		nextMonth() {
			const next = addMonths(new Date(viewYear, viewMonth, 1), 1);
			viewMonth = next.getMonth();
			viewYear = next.getFullYear();
		},
		prevMonth() {
			const prev = addMonths(new Date(viewYear, viewMonth, 1), -1);
			viewMonth = prev.getMonth();
			viewYear = prev.getFullYear();
		},
		setFocusedDate(date: Date) {
			focusedDate = date;
			viewMonth = date.getMonth();
			viewYear = date.getFullYear();
		}
	});
</script>

<div data-range-calendar-root class={className} {...rest}>
	{@render children()}
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-range-calendar-root] {
		--dry-range-calendar-bg: var(--dry-color-bg-overlay);
		--dry-range-calendar-border: var(--dry-color-stroke-weak);
		--dry-range-calendar-radius: var(--dry-radius-lg);
		--dry-range-calendar-shadow: var(--dry-shadow-sm);
		--dry-range-calendar-padding: var(--dry-space-3);
		--dry-range-calendar-day-size: 2.25rem;
		--dry-range-calendar-day-radius: var(--dry-radius-md);
		--dry-range-calendar-day-hover-bg: var(--dry-color-bg-raised);
		--dry-range-calendar-selected-bg: var(--dry-color-fill-brand);
		--dry-range-calendar-selected-color: var(--dry-color-on-brand);
		--dry-range-calendar-selected-hover-bg: var(--dry-color-fill-brand-hover);
		--dry-range-calendar-range-bg: color-mix(in srgb, var(--dry-color-fill-brand) 15%, transparent);
		--dry-range-calendar-today-color: var(--dry-color-fill-brand);
		--dry-range-calendar-outside-color: var(--dry-color-text-weak);

		display: grid;
		box-sizing: border-box;
		padding: var(--dry-range-calendar-padding);
		background: var(--dry-range-calendar-bg);
		border: 1px solid var(--dry-range-calendar-border);
		border-radius: var(--dry-range-calendar-radius);
		box-shadow: var(--dry-range-calendar-shadow);
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}

	[data-range-calendar-grid] {
		display: grid;
		gap: var(--dry-space-2);

		[role='group'] {
			display: grid;
			gap: var(--dry-space-2);
		}

		[role='group'] > div:first-child {
			display: grid;
			grid-template-columns: auto 1fr auto;
			align-items: center;
			gap: var(--dry-space-2);
		}

		[role='group'] > div:first-child button {
			display: inline-grid;
			place-items: center;
			height: var(--dry-space-8);
			aspect-ratio: 1;
			border: 1px solid transparent;
			border-radius: var(--dry-range-calendar-day-radius);
			background: transparent;
			color: var(--dry-color-text-strong);
			cursor: pointer;
			transition:
				background var(--dry-duration-fast) var(--dry-ease-default),
				border-color var(--dry-duration-fast) var(--dry-ease-default);
		}

		[role='group'] > div:first-child button:hover:not([disabled]) {
			background: var(--dry-range-calendar-day-hover-bg);
			border-color: var(--dry-color-stroke-strong);
		}

		[role='group'] > div:first-child button:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 1px;
		}

		[role='group'] > div:first-child span {
			font-size: var(--dry-type-small-size, var(--dry-type-small-size));
			font-weight: 600;
			letter-spacing: -0.01em;
		}

		[role='grid'] {
			display: grid;
			gap: 1px;
		}

		[role='row'] {
			display: grid;
			grid-template-columns: repeat(7, minmax(0, 1fr));
			gap: 1px;
		}

		[role='columnheader'] {
			display: grid;
			place-items: center;
			min-height: var(--dry-space-8);
			font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
			color: var(--dry-range-calendar-outside-color);
			text-transform: uppercase;
			letter-spacing: 0.04em;
		}

		[role='gridcell'] {
			display: grid;
			place-items: center;
		}

		[role='gridcell'] button {
			display: inline-grid;
			place-items: center;
			min-height: var(--dry-range-calendar-day-size);
			aspect-ratio: 1;
			border: none;
			border-radius: var(--dry-range-calendar-day-radius);
			background: transparent;
			color: var(--dry-color-text-strong);
			font: inherit;
			font-size: var(--dry-type-small-size, var(--dry-type-small-size));
			font-variant-numeric: tabular-nums;
			cursor: pointer;
			transition:
				background var(--dry-duration-fast) var(--dry-ease-default),
				color var(--dry-duration-fast) var(--dry-ease-default);
		}

		[role='gridcell'] button:hover:not([data-disabled]) {
			background: var(--dry-range-calendar-day-hover-bg);
		}

		[role='gridcell'] button:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 1px;
		}

		[role='gridcell'] button[data-today]:not([data-selected]) {
			color: var(--dry-range-calendar-today-color);
			font-weight: 600;
		}

		[role='gridcell'] button[data-selected] {
			background: var(--dry-range-calendar-selected-bg);
			color: var(--dry-range-calendar-selected-color);
			font-weight: 600;
		}

		[role='gridcell'] button[data-selected]:hover:not([data-disabled]) {
			background: var(--dry-range-calendar-selected-hover-bg);
		}

		[role='gridcell'] button[data-in-range] {
			background: var(--dry-range-calendar-range-bg);
			border-radius: 0;
		}

		[role='gridcell'] button[data-range-start],
		[role='gridcell'] button[data-range-end] {
			border-radius: var(--dry-range-calendar-day-radius);
		}

		[role='gridcell'] button[data-outside-month] {
			color: var(--dry-range-calendar-outside-color);
			opacity: 0.6;
		}

		[role='gridcell'] button[data-disabled] {
			cursor: not-allowed;
			opacity: 0.4;
			pointer-events: none;
		}
	}

	[data-theme='dark'] [data-range-calendar-root] {
		--dry-range-calendar-bg: var(--dry-color-bg-raised);
		--dry-range-calendar-border: var(--dry-color-stroke-weak);
		--dry-range-calendar-day-hover-bg: color-mix(
			in srgb,
			var(--dry-color-bg-overlay) 70%,
			transparent
		);
		--dry-range-calendar-range-bg: color-mix(in srgb, var(--dry-color-fill-brand) 20%, transparent);
	}

	@media (prefers-color-scheme: dark) {
		.theme-auto [data-range-calendar-root] {
			--dry-range-calendar-bg: var(--dry-color-bg-raised);
			--dry-range-calendar-border: var(--dry-color-stroke-weak);
			--dry-range-calendar-day-hover-bg: color-mix(
				in srgb,
				var(--dry-color-bg-overlay) 70%,
				transparent
			);
			--dry-range-calendar-range-bg: color-mix(
				in srgb,
				var(--dry-color-fill-brand) 20%,
				transparent
			);
		}
	}
</style>
