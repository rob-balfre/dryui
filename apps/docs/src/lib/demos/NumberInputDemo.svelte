<script lang="ts">
	import { NumberInput } from '@dryui/ui';

	let quantity = $state(1);
</script>

<NumberInput bind:value={quantity} min={0} max={100} step={1} />
