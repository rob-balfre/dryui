<script lang="ts">
	import { DatePicker } from '@dryui/ui';

	let date = $state<Date | null>(new Date(2026, 3, 18));
</script>

<DatePicker.Root bind:value={date} name="date">
	<DatePicker.Trigger placeholder="Select a date" />
	<DatePicker.Content>
		<DatePicker.Calendar />
	</DatePicker.Content>
</DatePicker.Root>
