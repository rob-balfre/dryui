<script lang="ts">
	import { DateField } from '@dryui/ui';
</script>

<DateField.Root>
	<DateField.Segment type="day" />
	<DateField.Separator separator="/" />
	<DateField.Segment type="month" />
	<DateField.Separator separator="/" />
	<DateField.Segment type="year" />
</DateField.Root>
