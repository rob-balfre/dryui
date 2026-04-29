<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import type {
		CalendarEventDisplay,
		CalendarEventItem,
		CalendarVisibleMonths
	} from '../../../packages/ui/src/calendar/index.js';
	import { RangeCalendar } from '../../../packages/ui/src/range-calendar/index.js';

	interface Props {
		startDate?: Date | null;
		endDate?: Date | null;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		events?: CalendarEventItem[];
		eventDisplay?: CalendarEventDisplay;
		maxEventLanes?: number;
		visibleMonths?: CalendarVisibleMonths;
	}

	let {
		startDate = $bindable<Date | null>(new Date(2026, 3, 12)),
		endDate = $bindable<Date | null>(new Date(2026, 3, 16)),
		min = new Date(2026, 3, 10),
		max = new Date(2026, 3, 24),
		disabled = false,
		events = [],
		eventDisplay = 'dots',
		maxEventLanes = 3,
		visibleMonths = 1
	}: Props = $props();

	function formatValue(date: Date | null) {
		if (!date) return 'null';

		const year = String(date.getFullYear());
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}
</script>

<RangeCalendar.Root
	bind:startDate
	bind:endDate
	{min}
	{max}
	{disabled}
	data-testid="range-calendar-root"
>
	<RangeCalendar.Grid
		{events}
		{eventDisplay}
		{maxEventLanes}
		{visibleMonths}
		data-testid="range-calendar-grid"
	/>
</RangeCalendar.Root>

<output data-testid="range-calendar-start">{formatValue(startDate)}</output>
<output data-testid="range-calendar-end">{formatValue(endDate)}</output>
