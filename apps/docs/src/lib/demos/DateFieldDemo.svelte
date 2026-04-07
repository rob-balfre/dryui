<script lang="ts">
	import { DateField } from '@dryui/ui';

	let date = $state<Date | null>(null);
</script>

<DateField.Root bind:value={date} name="date">
	<DateField.Segment type="month" />
	<DateField.Separator />
	<DateField.Segment type="day" />
	<DateField.Separator />
	<DateField.Segment type="year" />
</DateField.Root>
