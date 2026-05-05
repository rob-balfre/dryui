<script lang="ts">
	import { DateTimeInput } from '@dryui/ui';

	let value = $state(new Date(2026, 4, 12, 22, 30));
</script>

<DateTimeInput bind:value name="datetime" />
