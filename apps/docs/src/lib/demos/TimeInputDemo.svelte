<script lang="ts">
	import { TimeInput } from '@dryui/ui';

	let value = $state('09:30');
</script>

<TimeInput bind:value name="time" />
