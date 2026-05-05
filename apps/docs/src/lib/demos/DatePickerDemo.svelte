<script lang="ts">
	import { DatePicker } from '@dryui/ui';

	let value = $state<Date | null>(new Date(2026, 4, 2));
</script>

<DatePicker.Root bind:value name="date">
	<DatePicker.Trigger placeholder="Pick a date" />
	<DatePicker.Content>
		<DatePicker.Calendar />
	</DatePicker.Content>
</DatePicker.Root>
