<script lang="ts">
	import { AreaGrid } from '@dryui/ui';

	const cols = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

<AreaGrid.Root
	debug
	template="12-span"
	maxWidth="full"
	--dry-area-grid-template-rows="minmax(0, 1fr)"
>
	{#each cols as i (i)}
		<AreaGrid.Placeholder label={String(i)} />
	{/each}
</AreaGrid.Root>
