<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { DateRangePicker } from '../../../packages/ui/src/date-range-picker/index.js';

	interface Props {
		startDate?: Date | null;
		endDate?: Date | null;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		open?: boolean;
	}

	let {
		startDate = $bindable<Date | null>(null),
		endDate = $bindable<Date | null>(null),
		min = new Date(2026, 3, 10),
		max = new Date(2026, 3, 24),
		disabled = false,
		open = $bindable(false)
	}: Props = $props();

	function formatValue(date: Date | null) {
		if (!date) return 'null';

		const year = String(date.getFullYear());
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}
</script>

<output data-testid="date-range-picker-open">{String(open)}</output>
<output data-testid="date-range-picker-start">{formatValue(startDate)}</output>
<output data-testid="date-range-picker-end">{formatValue(endDate)}</output>

<DateRangePicker.Root bind:startDate bind:endDate bind:open {min} {max} {disabled}>
	<DateRangePicker.Trigger placeholder="Pick date range" data-testid="date-range-picker-trigger" />
	<DateRangePicker.Content data-testid="date-range-picker-content">
		<DateRangePicker.Calendar data-testid="date-range-picker-calendar" />
	</DateRangePicker.Content>
</DateRangePicker.Root>
