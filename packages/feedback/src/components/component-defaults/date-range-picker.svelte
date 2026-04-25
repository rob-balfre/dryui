<script lang="ts">
	import { DateRangePicker } from '@dryui/ui';
</script>

<DateRangePicker.Root open={true}>
	<DateRangePicker.Trigger placeholder="Pick a date range" />
	<DateRangePicker.Content>
		<DateRangePicker.Calendar />
	</DateRangePicker.Content>
</DateRangePicker.Root>
