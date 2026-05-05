<script lang="ts">
	import { Slider, Field, Label } from '@dryui/ui';

	let value = $state(50);
</script>

<Field.Root>
	<Label>Value</Label>
	<Slider bind:value min={0} max={100} step={1} />
</Field.Root>
