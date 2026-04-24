<script lang="ts">
	import { Badge, Numeric, Text } from '@dryui/ui';

	const tiles = [
		{ label: 'Requests', value: 1_284_650, suffix: 'today', tone: 'blue' as const },
		{ label: 'Errors', value: 142, suffix: 'last 1h', tone: 'red' as const },
		{ label: 'p95 latency', value: 184, suffix: 'ms', tone: 'gray' as const },
		{ label: 'Active seats', value: 312, suffix: 'of 500', tone: 'green' as const }
	];
</script>

<div class="grid">
	{#each tiles as tile (tile.label)}
		<div class="tile">
			<Badge variant="soft" color={tile.tone}>{tile.label}</Badge>
			<Text as="span" size="lg" weight="semibold">
				<Numeric value={tile.value.toLocaleString()} align="start" />
			</Text>
			<Text as="span" color="muted" size="sm">{tile.suffix}</Text>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--dry-space-3);
	}

	.tile {
		display: grid;
		align-content: start;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}
</style>
