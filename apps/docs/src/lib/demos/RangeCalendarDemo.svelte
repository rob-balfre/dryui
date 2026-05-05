<script lang="ts">
	import { RangeCalendar } from '@dryui/ui';

	let startDate = $state<Date | null>(new Date(2026, 3, 14));
	let endDate = $state<Date | null>(new Date(2026, 3, 18));
</script>

<RangeCalendar.Root bind:startDate bind:endDate>
	<RangeCalendar.Grid />
</RangeCalendar.Root>
