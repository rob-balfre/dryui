<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import type {
		CalendarEventDisplay,
		CalendarEventItem,
		CalendarVisibleMonths
	} from '../../../packages/ui/src/calendar/index.js';
	import { Calendar } from '../../../packages/ui/src/calendar/index.js';

	interface Props {
		value?: Date | null;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		events?: CalendarEventItem[];
		eventDisplay?: CalendarEventDisplay;
		maxEventLanes?: number;
		visibleMonths?: CalendarVisibleMonths;
	}

	let {
		value = $bindable<Date | null>(new Date(2026, 3, 18)),
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

<Calendar.Root bind:value {min} {max} {disabled} data-testid="calendar-root">
	<Calendar.Header data-testid="calendar-header">
		<Calendar.Prev data-testid="calendar-prev" />
		<Calendar.Heading data-testid="calendar-heading" />
		<Calendar.Next data-testid="calendar-next" />
	</Calendar.Header>
	<Calendar.Grid
		{events}
		{eventDisplay}
		{maxEventLanes}
		{visibleMonths}
		data-testid="calendar-grid"
	/>
</Calendar.Root>

<output data-testid="calendar-value">{formatValue(value)}</output>
