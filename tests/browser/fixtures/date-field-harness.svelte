<script lang="ts">
	import { DateField } from '../../../packages/ui/src/date-field/index.js';

	let value = $state<Date | null>(null);

	function formatValue(date: Date | null) {
		if (!date) return 'null';

		const year = String(date.getFullYear());
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}
</script>

<div>
	<DateField.Root bind:value name="date" data-testid="root">
		<DateField.Segment type="month" data-testid="segment-month" />
		<DateField.Separator data-testid="separator-month-day" />
		<DateField.Segment type="day" data-testid="segment-day" />
		<DateField.Separator />
		<DateField.Segment type="year" data-testid="segment-year" />
	</DateField.Root>

	<button type="button" data-testid="outside-focus">Outside</button>
	<output data-testid="value-output">{formatValue(value)}</output>
</div>
