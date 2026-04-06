<script lang="ts">
	import { PinInput } from '@dryui/ui';

	let pin = $state('');
</script>

<PinInput.Root bind:value={pin} length={6}>
	{#snippet children({ cells })}
		<PinInput.Group>
			{#each cells.slice(0, 3) as cell}
				<PinInput.Cell {cell} />
			{/each}
		</PinInput.Group>
		<PinInput.Separator />
		<PinInput.Group>
			{#each cells.slice(3) as cell}
				<PinInput.Cell {cell} />
			{/each}
		</PinInput.Group>
	{/snippet}
</PinInput.Root>
