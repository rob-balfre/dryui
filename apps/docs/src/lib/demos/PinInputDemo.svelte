<script lang="ts">
	import { PinInput, Field, Label } from '@dryui/ui';

	let code = $state('');
</script>

<Field.Root>
	<Label>Verification code</Label>
	<PinInput.Root bind:value={code} length={6}>
		{#snippet children({ cells })}
			<PinInput.Group>
				{#each cells.slice(0, 3) as cell (cell.index)}
					<PinInput.Cell {cell} />
				{/each}
			</PinInput.Group>
			<PinInput.Separator />
			<PinInput.Group>
				{#each cells.slice(3) as cell (cell.index)}
					<PinInput.Cell {cell} />
				{/each}
			</PinInput.Group>
		{/snippet}
	</PinInput.Root>
</Field.Root>
