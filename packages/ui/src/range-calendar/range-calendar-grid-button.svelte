<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getRangeCalendarCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '@dryui/primitives';
	import {
		generateWeekdayLabels,
		splitIntoWeeks,
		getDayISOString,
		handleCalendarKeydown,
		focusCalendarDay
	} from '../internal/calendar-grid-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getRangeCalendarCtx();

	let gridEl = $state<HTMLDivElement | undefined>();

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

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
		const result = handleCalendarKeydown(e, day, {
			onSelect: (date) => {
				if (isDateInRange(date, ctx.min, ctx.max)) {
					ctx.selectDate(date);
				}
			},
			onEscape: () => {},
			setFocusedDate: (date) => ctx.setFocusedDate(date),
			weekStartDay: ctx.weekStartDay,
			min: ctx.min,
			max: ctx.max
		});
		if (result?.type === 'navigate') {
			requestAnimationFrame(() => focusCalendarDay(gridEl, result.newDate));
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}

	function captureGrid(node: HTMLDivElement) {
		gridEl = node;

		return {
			destroy() {
				if (gridEl === node) {
					gridEl = undefined;
				}
			}
		};
	}
</script>

<div {@attach captureGrid} data-range-calendar-grid class={className} {...rest}>
	<div data-calendar-panel role="group" aria-label={monthYearLabel}>
		<div data-calendar-header>
			<Button
				variant="outline"
				size="icon-sm"
				type="button"
				aria-label="Previous month"
				onclick={() => ctx.prevMonth()}
			>
				&#8249;
			</Button>
			<span data-calendar-heading aria-live="polite" aria-atomic="true">
				{monthYearLabel}
			</span>
			<Button
				variant="outline"
				size="icon-sm"
				type="button"
				aria-label="Next month"
				onclick={() => ctx.nextMonth()}
			>
				&#8250;
			</Button>
		</div>

		<div role="grid" aria-label={monthYearLabel}>
			<div data-calendar-row role="row">
				{#each weekdayLabels as label (label)}
					<div data-calendar-columnheader role="columnheader" aria-label={label}>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			{#each weeks as week (week[0]?.getTime() ?? 0)}
				<div data-calendar-row role="row">
					{#each week as day (day.getTime())}
						{@const isCurrent = day.getMonth() === ctx.viewMonth}
						{@const inRange = isInRange(day)}
						{@const rangeStart = isRangeStart(day)}
						{@const rangeEnd = isRangeEnd(day)}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						<div
							data-calendar-cell
							data-in-range={inRange ? '' : undefined}
							data-range-start={rangeStart ? '' : undefined}
							data-range-end={rangeEnd ? '' : undefined}
						>
							<Button
								variant="trigger"
								size="icon-sm"
								type="button"
								role="gridcell"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-current={today ? 'date' : undefined}
								aria-selected={inRange || undefined}
								aria-disabled={disabled}
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-in-range={inRange ? '' : undefined}
								data-range-start={rangeStart ? '' : undefined}
								data-range-end={rangeEnd ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								{disabled}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
								onmouseenter={() => ctx.setHoveredDate(day)}
								onmouseleave={() => ctx.setHoveredDate(null)}
							>
								{day.getDate()}
							</Button>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	[data-range-calendar-grid] {
		display: grid;
		gap: var(--dry-space-2);
		user-select: none;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}

	[data-range-calendar-grid] [data-calendar-panel] {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		background: var(--dry-range-calendar-panel-bg, var(--dry-color-bg-overlay));
		border: 1px solid var(--dry-range-calendar-panel-border, var(--dry-color-stroke-weak));
		border-radius: calc(
			var(--dry-range-calendar-radius, var(--dry-radius-lg)) - var(--dry-space-1)
		);
	}

	[data-range-calendar-grid] [data-calendar-header] {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
		padding-block-end: var(--dry-space-1);
		border-block-end: 1px solid
			color-mix(
				in srgb,
				var(--dry-range-calendar-panel-border, var(--dry-color-stroke-weak)) 70%,
				transparent
			);
	}

	[data-range-calendar-grid] [data-calendar-heading] {
		font-size: var(--dry-type-small-size);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--dry-range-calendar-heading-color, var(--dry-color-text-strong));
		text-align: center;
	}

	[data-range-calendar-grid] [role='grid'] {
		display: grid;
		gap: var(--dry-space-1);
	}

	[data-range-calendar-grid] [data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--dry-space-1);
	}

	[data-range-calendar-grid] [data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-7);
		font-size: calc(var(--dry-type-tiny-size) * 0.92);
		color: var(--dry-range-calendar-outside-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	[data-range-calendar-grid] [data-calendar-cell] {
		display: grid;
		place-items: center;
		padding-block: var(--dry-space-0_5);
	}

	[data-range-calendar-grid] [data-calendar-cell][data-in-range] {
		background: var(
			--dry-range-calendar-range-bg,
			color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent)
		);
	}

	[data-range-calendar-grid] [data-calendar-cell][data-range-start][data-in-range] {
		border-start-start-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
		border-end-start-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
	}

	[data-range-calendar-grid] [data-calendar-cell][data-range-end][data-in-range] {
		border-start-end-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
		border-end-end-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
	}
</style>
