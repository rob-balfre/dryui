<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createDateViewController } from '../internal/date-family-controller.svelte.js';
	import { setCalendarCtx } from './context.svelte.js';

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

	const view = createDateViewController({
		initialDate: value,
		locale: () => locale
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
		goToMonth(month: number) {
			view.goToMonth(month);
		},
		goToYear(year: number) {
			view.goToYear(year);
		},
		nextMonth() {
			view.nextMonth();
		},
		prevMonth() {
			view.prevMonth();
		},
		setFocusedDate(date: Date) {
			view.setFocusedDate(date);
		}
	});
</script>

<div
	data-calendar
	data-disabled={disabled || undefined}
	class={className}
	role="group"
	aria-label="Calendar"
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-calendar] {
		--dry-calendar-bg: var(--dry-color-bg-overlay);
		--dry-calendar-border: var(--dry-color-stroke-weak);
		--dry-calendar-radius: var(--dry-radius-lg);
		--dry-calendar-shadow: var(--dry-shadow-sm);
		--dry-calendar-padding: var(--dry-space-3);
		--dry-calendar-header-color: var(--dry-color-text-strong);
		--dry-calendar-muted-color: var(--dry-color-text-weak);
		--dry-calendar-day-size: 2.25rem;
		--dry-calendar-day-radius: var(--dry-radius-md);
		--dry-calendar-day-hover-bg: var(--dry-color-bg-raised);
		--dry-calendar-selected-bg: var(--dry-color-fill-brand);
		--dry-calendar-selected-color: var(--dry-color-on-brand);
		--dry-calendar-selected-hover-bg: var(--dry-color-fill-brand-hover);
		--dry-calendar-range-bg: color-mix(in srgb, var(--dry-color-fill-brand) 15%, transparent);
		--dry-calendar-today-color: var(--dry-color-fill-brand);
		--dry-calendar-outside-color: var(--dry-color-text-weak);

		display: inline-grid;
		grid-template-rows: max-content minmax(0, 1fr);
		box-sizing: border-box;
		padding: var(--dry-calendar-padding);
		background: var(--dry-calendar-bg);
		border: 1px solid var(--dry-calendar-border);
		border-radius: var(--dry-calendar-radius);
		box-shadow: var(--dry-calendar-shadow);
		color: var(--dry-calendar-header-color);
		font-family: var(--dry-font-sans);
	}
</style>
