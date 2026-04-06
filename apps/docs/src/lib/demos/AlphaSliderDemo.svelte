<script lang="ts">
	import { AlphaSlider } from '@dryui/ui';

	let alpha = $state(0.75);
</script>

<AlphaSlider bind:value={alpha} color="hsl(220, 90%, 56%)" />
