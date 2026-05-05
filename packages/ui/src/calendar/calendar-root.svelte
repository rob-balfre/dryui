<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createDateViewController } from '../internal/date-family-controller.svelte.js';
	import type { CalendarVisibleMonths } from '../internal/calendar-event-layout.js';
	import { setCalendarCtx } from './context.svelte.js';
	import { addDays } from './week-utils.js';
	import type { CalendarEvent, CalendarEventCategory, CalendarView } from './types.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date | null;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		view?: CalendarView;
		events?: CalendarEvent[];
		categories?: CalendarEventCategory[];
		selectedEvent?: CalendarEvent | null;
		weekStartHour?: number;
		weekEndHour?: number;
		weekTimeZoneLabel?: string;
		onEventSelect?: (event: CalendarEvent | null) => void;
		children: Snippet;
	}

	let {
		value = $bindable<Date | null>(null),
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		view = 'month',
		events = [],
		categories = [],
		selectedEvent = $bindable<CalendarEvent | null>(null),
		weekStartHour = 6,
		weekEndHour = 22,
		weekTimeZoneLabel = 'Local',
		onEventSelect,
		class: className,
		children,
		...rest
	}: Props = $props();

	const viewController = createDateViewController({
		initialDate: value,
		locale: () => locale
	});
	const monthView = $state({
		visibleMonths: 1 as CalendarVisibleMonths
	});

	const categoryMap = $derived(new Map(categories.map((c) => [c.id, c])));

	setCalendarCtx({
		get value() {
			return value;
		},
		get focusedDate() {
			return viewController.focusedDate;
		},
		get viewMonth() {
			return viewController.viewMonth;
		},
		get viewYear() {
			return viewController.viewYear;
		},
		get locale() {
			return locale;
		},
		get visibleMonths() {
			return monthView.visibleMonths;
		},
		get monthView() {
			return monthView;
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
			return viewController.weekStartDay;
		},
		get multiple() {
			return false;
		},
		get selectedDates() {
			return value ? [value] : [];
		},
		get view() {
			return view;
		},
		get events() {
			return events;
		},
		get categories() {
			return categories;
		},
		get selectedEvent() {
			return selectedEvent;
		},
		get weekStartHour() {
			return weekStartHour;
		},
		get weekEndHour() {
			return weekEndHour;
		},
		get weekTimeZoneLabel() {
			return weekTimeZoneLabel;
		},
		select(date: Date) {
			value = date;
			viewController.setFocusedDate(date);
		},
		selectEvent(event: CalendarEvent | null) {
			selectedEvent = event;
			onEventSelect?.(event);
			if (event) viewController.setFocusedDate(event.start);
		},
		goToMonth(month: number) {
			viewController.goToMonth(month);
		},
		goToYear(year: number) {
			viewController.goToYear(year);
		},
		nextMonth() {
			viewController.nextMonth();
		},
		prevMonth() {
			viewController.prevMonth();
		},
		nextWeek() {
			viewController.setFocusedDate(addDays(viewController.focusedDate, 7));
		},
		prevWeek() {
			viewController.setFocusedDate(addDays(viewController.focusedDate, -7));
		},
		goToToday() {
			const today = new Date();
			value = today;
			viewController.setFocusedDate(today);
		},
		setFocusedDate(date: Date) {
			viewController.setFocusedDate(date);
		},
		getCategory(id: string | undefined) {
			return id ? categoryMap.get(id) : undefined;
		}
	});
</script>

<div
	data-calendar
	data-view={view}
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
		--dry-calendar-week-row-height: 3.25rem;
		--dry-calendar-week-time-col: 4rem;
		--dry-calendar-week-grid-color: var(--dry-color-stroke-weak);
		--dry-calendar-event-radius: var(--dry-radius-md);
		--dry-calendar-event-bg: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
		--dry-calendar-event-color: var(--dry-color-text-strong);
		--dry-calendar-event-accent: var(--dry-color-fill-brand);

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

	[data-calendar][data-view='week'] {
		display: grid;
	}
</style>
