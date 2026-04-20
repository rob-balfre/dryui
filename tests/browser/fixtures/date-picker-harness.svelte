<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { DatePicker } from '../../../packages/ui/src/date-picker/index.js';

	interface Props {
		value?: Date | null;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		open?: boolean;
		name?: string;
	}

	let {
		value = $bindable<Date | null>(new Date(2026, 3, 18)),
		min = new Date(2026, 3, 10),
		max = new Date(2026, 3, 24),
		disabled = false,
		open = $bindable(false),
		name = 'date'
	}: Props = $props();

	function formatValue(date: Date | null) {
		if (!date) return 'null';

		const year = String(date.getFullYear());
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}
</script>

<output data-testid="date-picker-open">{String(open)}</output>
<output data-testid="date-picker-value">{formatValue(value)}</output>

<DatePicker.Root bind:value bind:open {name} {min} {max} {disabled}>
	<DatePicker.Trigger placeholder="Select a date" data-testid="date-picker-trigger" />
	<DatePicker.Content data-testid="date-picker-content">
		<DatePicker.Calendar data-testid="date-picker-calendar" />
	</DatePicker.Content>
</DatePicker.Root>
