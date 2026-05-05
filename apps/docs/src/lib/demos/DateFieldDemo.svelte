<script lang="ts">
	import { DateField } from '@dryui/ui';

	let value = $state<Date | null>(new Date(2026, 4, 8));
</script>

<DateField.Root bind:value name="date" size="md">
	<DateField.Segment type="month" />
	<DateField.Separator />
	<DateField.Segment type="day" />
	<DateField.Separator />
	<DateField.Segment type="year" />
</DateField.Root>
