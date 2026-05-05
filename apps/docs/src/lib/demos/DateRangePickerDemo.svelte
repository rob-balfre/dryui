<script lang="ts">
	import { DateRangePicker } from '@dryui/ui';

	let startDate = $state<Date | null>(new Date(2026, 3, 14));
	let endDate = $state<Date | null>(new Date(2026, 3, 21));
</script>

<DateRangePicker.Root bind:startDate bind:endDate>
	<DateRangePicker.Trigger placeholder="Pick a range" />
	<DateRangePicker.Content>
		<DateRangePicker.Calendar />
	</DateRangePicker.Content>
</DateRangePicker.Root>
