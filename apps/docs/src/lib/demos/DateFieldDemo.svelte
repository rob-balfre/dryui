<script>
	import { DateField } from '@dryui/ui';

	let date = $state('');
</script>

<DateField.Root bind:value={date} name="date">
	<DateField.Segment type="month" />
	<DateField.Separator />
	<DateField.Segment type="day" />
	<DateField.Separator />
	<DateField.Segment type="year" />
</DateField.Root>
