<script lang="ts">
	import { TimeInput } from '@dryui/ui';

	let time = $state('');
</script>

<TimeInput bind:value={time} />
