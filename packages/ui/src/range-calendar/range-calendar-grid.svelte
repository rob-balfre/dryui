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
			<button
				type="button"
				data-calendar-nav
				aria-label="Previous month"
				onclick={() => ctx.prevMonth()}
			>
				&#8249;
			</button>
			<span data-calendar-heading aria-live="polite" aria-atomic="true">
				{monthYearLabel}
			</span>
			<button
				type="button"
				data-calendar-nav
				aria-label="Next month"
				onclick={() => ctx.nextMonth()}
			>
				&#8250;
			</button>
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
							<button
								role="gridcell"
								type="button"
								data-calendar-day-button
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

	[data-range-calendar-grid] [data-calendar-nav] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-8);
		aspect-ratio: 1;
		border: 1px solid var(--dry-range-calendar-nav-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
		background: var(--dry-range-calendar-nav-bg, var(--dry-color-bg-raised));
		color: var(--dry-range-calendar-nav-color, var(--dry-color-text-weak));
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-range-calendar-grid] [data-calendar-nav]:hover:not([disabled]) {
		background: var(--dry-range-calendar-day-hover-bg, var(--dry-color-fill-hover));
		border-color: var(--dry-color-stroke-strong);
		color: var(--dry-color-text-strong);
	}

	[data-range-calendar-grid] [data-calendar-nav]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-range-calendar-grid] [data-calendar-heading] {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--dry-range-calendar-heading-color, var(--dry-color-text-strong));
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
		font-size: calc(var(--dry-type-tiny-size, var(--dry-type-tiny-size)) * 0.92);
		color: var(--dry-range-calendar-outside-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	[data-range-calendar-grid] [data-calendar-cell] {
		display: grid;
		grid-template-columns: var(--dry-range-calendar-day-size, 2.5rem);
		place-items: center;
		padding-block: var(--dry-space-0_5);
		border-radius: 0;
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

	[data-range-calendar-grid] [data-calendar-cell][data-range-start][data-range-end] {
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
	}

	[data-range-calendar-grid] [data-calendar-day-button] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-range-calendar-day-size, 2.5rem);
		padding: 0;
		aspect-ratio: 1;
		border: 1px solid transparent;
		border-radius: var(--dry-range-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-range-calendar-grid]
		[data-calendar-day-button]:hover:not([data-disabled]):not([data-range-start]):not(
			[data-range-end]
		) {
		background: var(--dry-range-calendar-day-hover-bg, var(--dry-color-fill-hover));
	}

	[data-range-calendar-grid] [data-calendar-day-button]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-range-calendar-grid]
		[data-calendar-day-button][data-today]:not([data-range-start]):not([data-range-end]) {
		border-color: color-mix(
			in srgb,
			var(--dry-range-calendar-today-color, var(--dry-color-text-brand)) 24%,
			transparent
		);
		color: var(--dry-range-calendar-today-color, var(--dry-color-text-brand));
		font-weight: 600;
	}

	[data-range-calendar-grid] [data-calendar-day-button][data-range-start],
	[data-range-calendar-grid] [data-calendar-day-button][data-range-end] {
		background: var(--dry-range-calendar-selected-bg, var(--dry-color-fill-brand));
		color: var(--dry-range-calendar-selected-color, var(--dry-color-on-brand));
		font-weight: 700;
	}

	[data-range-calendar-grid]
		[data-calendar-day-button][data-range-start]:hover:not([data-disabled]),
	[data-range-calendar-grid] [data-calendar-day-button][data-range-end]:hover:not([data-disabled]) {
		background: var(--dry-range-calendar-selected-hover-bg, var(--dry-color-fill-brand-hover));
	}

	[data-range-calendar-grid] [data-calendar-day-button][data-outside-month] {
		color: var(--dry-range-calendar-outside-color, var(--dry-color-text-weak));
		opacity: 0.55;
	}

	[data-range-calendar-grid] [data-calendar-day-button][data-disabled] {
		cursor: not-allowed;
		opacity: 0.35;
		pointer-events: none;
	}
</style>
