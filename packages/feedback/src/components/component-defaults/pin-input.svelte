<script lang="ts">
	import { PinInput } from '@dryui/ui';
</script>

<PinInput.Root length={4}>
	{#snippet children({ cells })}
		<PinInput.Group>
			{#each cells as cell}
				<PinInput.Cell {cell} />
			{/each}
		</PinInput.Group>
	{/snippet}
</PinInput.Root>
