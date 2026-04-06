<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '../utils/date-utils.js';
	import {
		generateWeekdayLabels,
		splitIntoWeeks,
		getDayISOString,
		handleCalendarKeydown,
		focusCalendarDay
	} from '../internal/calendar-grid-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	let containerEl = $state<HTMLDivElement>();

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

	function isInSelectedRange(day: Date): boolean {
		const start = ctx.startDate;
		const end = ctx.endDate;
		if (!start || !end) return false;
		const time = day.getTime();
		return time > start.getTime() && time < end.getTime();
	}

	function isInPreviewRange(day: Date): boolean {
		if (ctx.selecting !== 'end' || !ctx.startDate || !ctx.hoverDate) return false;
		const time = day.getTime();
		const startTime = ctx.startDate.getTime();
		const hoverTime = ctx.hoverDate.getTime();
		if (hoverTime >= startTime) {
			return time >= startTime && time <= hoverTime;
		} else {
			return time >= hoverTime && time <= startTime;
		}
	}

	function isRangeStart(day: Date): boolean {
		if (!ctx.startDate) return false;
		if (ctx.endDate) {
			return isSameDay(day, ctx.startDate);
		}
		if (ctx.selecting === 'end' && ctx.hoverDate) {
			if (ctx.hoverDate.getTime() < ctx.startDate.getTime()) {
				return isSameDay(day, ctx.hoverDate);
			}
		}
		return isSameDay(day, ctx.startDate);
	}

	function isRangeEnd(day: Date): boolean {
		if (ctx.endDate) {
			return isSameDay(day, ctx.endDate);
		}
		if (ctx.selecting === 'end' && ctx.startDate && ctx.hoverDate) {
			if (ctx.hoverDate.getTime() < ctx.startDate.getTime()) {
				return isSameDay(day, ctx.startDate);
			}
			return isSameDay(day, ctx.hoverDate);
		}
		return false;
	}

	function isSelected(day: Date): boolean {
		return isRangeStart(day) || isRangeEnd(day);
	}

	function handleDayClick(day: Date) {
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.selectDate(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const result = handleCalendarKeydown(e, day, {
			onSelect: (d) => {
				if (isDateInRange(d, ctx.min, ctx.max)) ctx.selectDate(d);
			},
			onEscape: () => {
				ctx.close();
				ctx.triggerEl?.focus();
			},
			setFocusedDate: (d) => ctx.setFocusedDate(d),
			weekStartDay: ctx.weekStartDay,
			min: ctx.min,
			max: ctx.max
		});
		if (result?.type === 'navigate') {
			requestAnimationFrame(() => focusCalendarDay(containerEl, result.newDate));
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}
</script>

<div bind:this={containerEl} class={className} {...rest}>
	<!-- Calendar header: month/year + navigation -->
	<div role="group" aria-label={monthYearLabel}>
		<div>
			<button type="button" aria-label="Previous month" onclick={() => ctx.prevMonth()}>
				&#8249;
			</button>
			<span aria-live="polite" aria-atomic="true">
				{monthYearLabel}
			</span>
			<button type="button" aria-label="Next month" onclick={() => ctx.nextMonth()}>
				&#8250;
			</button>
		</div>

		<!-- Day-of-week header row -->
		<div role="grid" aria-label={monthYearLabel}>
			<div role="row">
				{#each weekdayLabels as label}
					<div role="columnheader" aria-label={label}>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			<!-- Calendar day grid -->
			{#each weeks as week}
				<div role="row">
					{#each week as day}
						{@const isCurrent = day.getMonth() === ctx.viewMonth}
						{@const selected = isSelected(day)}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						{@const inRange = isInSelectedRange(day) || isInPreviewRange(day)}
						{@const rangeStart = isRangeStart(day)}
						{@const rangeEnd = isRangeEnd(day)}
						<div role="gridcell">
							<button
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-pressed={selected}
								aria-disabled={disabled}
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-selected={selected ? '' : undefined}
								data-in-range={inRange ? '' : undefined}
								data-range-start={rangeStart ? '' : undefined}
								data-range-end={rangeEnd ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								data-disabled={disabled ? '' : undefined}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
								onmouseenter={() => {
									if (ctx.selecting === 'end') {
										ctx.setHoverDate(day);
									}
								}}
								onmouseleave={() => {
									if (ctx.selecting === 'end') {
										ctx.setHoverDate(null);
									}
								}}
							>
								{day.getDate()}
							</button>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>
