<script lang="ts">
	import { Calendar } from '@dryui/ui';

	let selected = $state<Date | null>(new Date(2026, 3, 18));
</script>

<Calendar.Root bind:value={selected}>
	<Calendar.Header>
		<Calendar.Prev />
		<Calendar.Heading />
		<Calendar.Next />
	</Calendar.Header>
	<Calendar.Grid />
</Calendar.Root>
