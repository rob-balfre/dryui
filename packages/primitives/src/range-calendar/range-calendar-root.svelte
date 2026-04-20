<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setRangeCalendarCtx } from './context.svelte.js';
	import { createDateViewState } from '../internal/date-view-state.svelte.js';

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
		children,
		...rest
	}: Props = $props();

	const view = createDateViewState({
		getLocale: () => locale,
		getInitialDate: () => startDate
	});
	let hoveredDate = $state<Date | null>(null);

	// Selection state: first click sets start, second click sets end
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
			return view.focusedDate;
		},
		get viewMonth() {
			return view.viewMonth;
		},
		get viewYear() {
			return view.viewYear;
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
			return view.weekStartDay;
		},
		selectDate(date: Date) {
			if (!selecting) {
				// First click: set start, clear end
				startDate = date;
				endDate = null;
				selecting = true;
			} else {
				// Second click: set end (ensure start < end)
				if (date < startDate!) {
					endDate = startDate;
					startDate = date;
				} else {
					endDate = date;
				}
				selecting = false;
			}
			view.setFocusedDate(date);
		},
		setHoveredDate(date: Date | null) {
			hoveredDate = date;
		},
		nextMonth: view.nextMonth,
		prevMonth: view.prevMonth,
		setFocusedDate: view.setFocusedDate
	});
</script>

<div {...rest}>
	{@render children()}
</div>
