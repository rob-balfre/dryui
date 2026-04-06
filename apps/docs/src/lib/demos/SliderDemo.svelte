<script lang="ts">
	import { Slider } from '@dryui/ui';

	let volume = $state(50);
</script>

<Slider bind:value={volume} min={0} max={100} />
