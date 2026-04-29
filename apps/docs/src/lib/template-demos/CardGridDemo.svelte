<script lang="ts">
	import { AreaGrid } from '@dryui/ui';

	const cards = Array.from({ length: 6 }, (_, i) => i + 1);
</script>

<AreaGrid.Root debug template="card-grid" maxWidth="full" --dry-area-grid-min-track="10rem">
	{#each cards as i (i)}
		<AreaGrid.Placeholder label={`card ${i}`} />
	{/each}
</AreaGrid.Root>
