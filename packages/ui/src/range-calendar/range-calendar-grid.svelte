<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getRangeCalendarCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getRangeCalendarCtx();

	let gridEl = $state<HTMLDivElement>();

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

	function generateWeekdayLabels(locale: string, weekStartDay: number): string[] {
		const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
		const labels: string[] = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(2024, 0, 7 + ((i + weekStartDay) % 7));
			labels.push(formatter.format(d));
		}
		return labels;
	}

	function splitIntoWeeks(days: Date[]): Date[][] {
		const result: Date[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			result.push(days.slice(i, i + 7));
		}
		return result;
	}

	function getDayISOString(day: Date): string {
		return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
	}

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

	function handleDayClick(day: Date) {
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.selectDate(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const { key } = e;
		let newDate: Date | null = null;

		if (key === 'ArrowLeft') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - 1);
		} else if (key === 'ArrowRight') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + 1);
		} else if (key === 'ArrowUp') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() - 7);
		} else if (key === 'ArrowDown') {
			e.preventDefault();
			newDate = new Date(day);
			newDate.setDate(newDate.getDate() + 7);
		} else if (key === 'Enter' || key === ' ') {
			e.preventDefault();
			if (isDateInRange(day, ctx.min, ctx.max)) ctx.selectDate(day);
			return;
		} else return;

		if (newDate) {
			ctx.setFocusedDate(newDate);
			requestAnimationFrame(() => {
				const isoStr = getDayISOString(newDate!);
				const btn = gridEl?.querySelector(`[data-calendar-day="${isoStr}"]`) as HTMLButtonElement;
				btn?.focus();
			});
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}
</script>

<div bind:this={gridEl} data-range-calendar-grid class={className} {...rest}>
	<div role="group" aria-label={monthYearLabel}>
		<div data-calendar-header>
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

		<div role="grid" aria-label={monthYearLabel}>
			<div role="row">
				{#each weekdayLabels as label}
					<div role="columnheader" aria-label={label}>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			{#each weeks as week}
				<div role="row">
					{#each week as day}
						{@const isCurrent = day.getMonth() === ctx.viewMonth}
						{@const inRange = isInRange(day)}
						{@const rangeStart = isRangeStart(day)}
						{@const rangeEnd = isRangeEnd(day)}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						<div>
							<button
								role="gridcell"
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-selected={inRange || undefined}
								aria-disabled={disabled}
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-in-range={inRange ? '' : undefined}
								data-range-start={rangeStart ? '' : undefined}
								data-range-end={rangeEnd ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								data-disabled={disabled ? '' : undefined}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
								onmouseenter={() => ctx.setHoveredDate(day)}
								onmouseleave={() => ctx.setHoveredDate(null)}
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
