<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCalendarCtx } from './context.svelte.js';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getCalendarCtx();

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
		const weeks: Date[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		return weeks;
	}

	function getDayISOString(day: Date): string {
		return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
	}

	function handleDayClick(day: Date) {
		if (ctx.disabled) return;
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.select(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		if (ctx.disabled) return;
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
			if (isDateInRange(day, ctx.min, ctx.max)) ctx.select(day);
			return;
		} else return;

		if (newDate && isDateInRange(newDate, ctx.min, ctx.max)) {
			ctx.setFocusedDate(newDate);
			requestAnimationFrame(() => {
				const isoStr = getDayISOString(newDate!);
				const btn = containerEl?.querySelector(
					`[data-calendar-day="${isoStr}"]`
				) as HTMLButtonElement;
				btn?.focus();
			});
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}
</script>

<div bind:this={containerEl} data-calendar-grid class={className} {...rest}>
	<div role="grid" aria-label={monthYearLabel}>
		<div data-calendar-row role="row">
			{#each weekdayLabels as label}
				<div data-calendar-columnheader role="columnheader" aria-label={label}>
					<span aria-hidden="true">{label}</span>
				</div>
			{/each}
		</div>

		{#each weeks as week}
			<div data-calendar-row role="row">
				{#each week as day}
					{@const isCurrent = day.getMonth() === ctx.viewMonth}
					{@const selected = ctx.value ? isSameDay(day, ctx.value) : false}
					{@const today = isToday(day)}
					{@const disabled = isDayDisabled(day)}
					{@const focused = isSameDay(day, ctx.focusedDate)}
					{@const isoStr = getDayISOString(day)}
					<div data-calendar-cell>
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
							aria-selected={selected}
							aria-disabled={disabled}
							data-calendar-day={isoStr}
							data-today={today ? '' : undefined}
							data-selected={selected ? '' : undefined}
							data-outside-month={!isCurrent ? '' : undefined}
							data-disabled={disabled ? '' : undefined}
							onclick={() => handleDayClick(day)}
							onkeydown={(e) => handleDayKeydown(e, day)}
						>
							{day.getDate()}
						</button>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	[data-calendar-grid] {
		--dry-calendar-grid-gap: 1px;
		display: grid;
		gap: var(--dry-space-2);
	}

	[role='grid'] {
		display: grid;
		gap: var(--dry-calendar-grid-gap);
	}

	[data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--dry-calendar-grid-gap);
	}

	[data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-8);
		font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
		color: var(--dry-calendar-muted-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	[data-calendar-cell] {
		display: grid;
		grid-template-columns: var(--dry-calendar-day-size, 2.25rem);
		place-items: center;
	}

	[data-calendar-day-button] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-calendar-day-size, 2.25rem);
		aspect-ratio: 1;
		border: none;
		border-radius: var(--dry-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);

		&:hover:not([data-disabled]) {
			background: var(--dry-calendar-day-hover-bg, var(--dry-color-bg-raised));
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 1px;
		}

		&[data-today]:not([data-selected]) {
			color: var(--dry-calendar-today-color, var(--dry-color-fill-brand));
			font-weight: 600;
		}

		&[data-selected] {
			background: var(--dry-calendar-selected-bg, var(--dry-color-fill-brand));
			color: var(--dry-calendar-selected-color, var(--dry-color-on-brand));
			font-weight: 600;
		}

		&[data-selected]:hover:not([data-disabled]) {
			background: var(--dry-calendar-selected-hover-bg, var(--dry-color-fill-brand-hover));
		}

		&[data-in-range] {
			background: var(
				--dry-calendar-range-bg,
				color-mix(in srgb, var(--dry-color-fill-brand) 15%, transparent)
			);
			border-radius: 0;
		}

		&[data-range-start],
		&[data-range-end] {
			border-radius: var(--dry-calendar-day-radius, var(--dry-radius-md));
		}

		&[data-outside-month] {
			color: var(--dry-calendar-outside-color, var(--dry-color-text-weak));
			opacity: 0.6;
		}

		&[data-disabled] {
			cursor: not-allowed;
			opacity: 0.4;
			pointer-events: none;
		}
	}
</style>
