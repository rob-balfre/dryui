<script lang="ts">
	import { DateTimeInput } from '@dryui/ui';

	let dt = $state(new Date(2026, 3, 18, 14, 30));
</script>

<DateTimeInput bind:value={dt} name="appointment" />
