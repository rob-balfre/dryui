<script lang="ts">
	import { isSameDay } from '@dryui/primitives';
	import { getRangeCalendarCtx } from './context.svelte.js';
	import CalendarGridButton, {
		type CalendarGridAdapter
	} from '../internal/calendar-grid-button.svelte';
	import type { CalendarEventGridProps } from '../internal/calendar-event-layout.js';

	interface Props extends CalendarEventGridProps {}

	let props: Props = $props();

	const ctx = getRangeCalendarCtx();

	function isInRange(day: Date): boolean {
		const start = ctx.startDate;
		const end = ctx.endDate ?? ctx.hoveredDate;
		if (!start || !end) return false;
		const lo = start < end ? start : end;
		const hi = start < end ? end : start;
		const time = day.getTime();
		return time >= lo.getTime() && time <= hi.getTime();
	}

	function isRangeStart(day: Date): boolean {
		if (!ctx.startDate) return false;
		const end = ctx.endDate ?? ctx.hoveredDate;
		if (!end) return isSameDay(day, ctx.startDate);
		const lo = ctx.startDate < end ? ctx.startDate : end;
		return isSameDay(day, lo);
	}

	function isRangeEnd(day: Date): boolean {
		const end = ctx.endDate ?? ctx.hoveredDate;
		if (!ctx.startDate || !end) return false;
		const hi = ctx.startDate < end ? end : ctx.startDate;
		return isSameDay(day, hi);
	}

	const adapter: CalendarGridAdapter = {
		get viewYear() {
			return ctx.viewYear;
		},
		get viewMonth() {
			return ctx.viewMonth;
		},
		get locale() {
			return ctx.locale;
		},
		get weekStartDay() {
			return ctx.weekStartDay;
		},
		get focusedDate() {
			return ctx.focusedDate;
		},
		get min() {
			return ctx.min;
		},
		get max() {
			return ctx.max;
		},
		get disabled() {
			return ctx.disabled;
		},
		isSelected: (day) => isRangeStart(day) || isRangeEnd(day),
		isInRange,
		isRangeStart,
		isRangeEnd,
		selectDate: (day) => ctx.selectDate(day),
		setFocusedDate: (day) => ctx.setFocusedDate(day),
		prevMonth: () => ctx.prevMonth(),
		nextMonth: () => ctx.nextMonth(),
		onHover: (day) => ctx.setHoveredDate(day)
	};
</script>

<CalendarGridButton {adapter} {...props} />
