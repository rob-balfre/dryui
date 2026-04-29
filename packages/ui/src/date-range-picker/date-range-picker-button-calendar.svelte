<script lang="ts">
	import { isSameDay } from '@dryui/primitives';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import CalendarGridButton, {
		type CalendarGridAdapter
	} from '../internal/calendar-grid-button.svelte';
	import type { CalendarEventGridProps } from '../internal/calendar-event-layout.js';

	interface Props extends CalendarEventGridProps {}

	let props: Props = $props();

	const ctx = getDateRangePickerCtx();

	function isInPreviewRange(day: Date): boolean {
		if (ctx.selecting !== 'end' || !ctx.startDate || !ctx.hoverDate) return false;
		const time = day.getTime();
		const startTime = ctx.startDate.getTime();
		const hoverTime = ctx.hoverDate.getTime();
		const lo = Math.min(startTime, hoverTime);
		const hi = Math.max(startTime, hoverTime);
		return time >= lo && time <= hi;
	}

	function isInSelectedRange(day: Date): boolean {
		if (!ctx.startDate || !ctx.endDate) return false;
		const time = day.getTime();
		return time > ctx.startDate.getTime() && time < ctx.endDate.getTime();
	}

	function isRangeStart(day: Date): boolean {
		if (!ctx.startDate) return false;
		if (ctx.endDate) return isSameDay(day, ctx.startDate);
		if (
			ctx.selecting === 'end' &&
			ctx.hoverDate &&
			ctx.hoverDate.getTime() < ctx.startDate.getTime()
		) {
			return isSameDay(day, ctx.hoverDate);
		}
		return isSameDay(day, ctx.startDate);
	}

	function isRangeEnd(day: Date): boolean {
		if (ctx.endDate) return isSameDay(day, ctx.endDate);
		if (ctx.selecting === 'end' && ctx.startDate && ctx.hoverDate) {
			if (ctx.hoverDate.getTime() < ctx.startDate.getTime()) return isSameDay(day, ctx.startDate);
			return isSameDay(day, ctx.hoverDate);
		}
		return false;
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
		isInRange: (day) => isInSelectedRange(day) || isInPreviewRange(day),
		isRangeStart,
		isRangeEnd,
		selectDate: (day) => ctx.selectDate(day),
		setFocusedDate: (day) => ctx.setFocusedDate(day),
		prevMonth: () => ctx.prevMonth(),
		nextMonth: () => ctx.nextMonth(),
		onEscape: () => {
			ctx.close();
			ctx.triggerEl?.focus();
		},
		onHover: (day) => {
			if (ctx.selecting === 'end') ctx.setHoverDate(day);
		}
	};
</script>

<CalendarGridButton {adapter} {...props} />
