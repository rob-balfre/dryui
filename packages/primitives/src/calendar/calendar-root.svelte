<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCalendarCtx } from './context.svelte.js';
	import { createDateViewState } from '../internal/date-view-state.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date | null;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		value = $bindable<Date | null>(null),
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	const view = createDateViewState({
		getLocale: () => locale,
		getInitialDate: () => value
	});

	setCalendarCtx({
		get value() {
			return value;
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
		get multiple() {
			return false;
		},
		get selectedDates() {
			return value ? [value] : [];
		},
		select(date: Date) {
			value = date;
			view.setFocusedDate(date);
		},
		goToMonth: view.goToMonth,
		goToYear: view.goToYear,
		nextMonth: view.nextMonth,
		prevMonth: view.prevMonth,
		setFocusedDate: view.setFocusedDate
	});
</script>

<div
	data-disabled={disabled || undefined}
	class={className}
	role="group"
	aria-label="Calendar"
	{...rest}
>
	{@render children()}
</div>
