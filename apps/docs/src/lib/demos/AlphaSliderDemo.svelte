<script lang="ts">
	import { AlphaSlider, Field, Label } from '@dryui/ui';

	let alpha = $state(72);
</script>

<Field.Root>
	<Label>Opacity</Label>
	<AlphaSlider bind:value={alpha} color="hsl(222, 18%, 14%)" />
</Field.Root>
