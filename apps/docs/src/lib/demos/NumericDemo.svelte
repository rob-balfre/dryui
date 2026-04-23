<script lang="ts">
	import { Badge, Numeric, Text } from '@dryui/ui';

	const metrics = [
		{ label: 'Requests', value: 12840, suffix: 'today' },
		{ label: 'Errors', value: 7, suffix: 'open' },
		{ label: 'Latency', value: '142', suffix: 'ms p95' }
	];
</script>

<div class="numeric-demo">
	{#each metrics as metric (metric.label)}
		<div class="metric">
			<Badge variant="soft">{metric.label}</Badge>
			<Text as="span" size="lg" weight="semibold">
				<Numeric value={metric.value} stable minDigits={5} />
			</Text>
			<Text as="span" color="muted" size="sm">{metric.suffix}</Text>
		</div>
	{/each}
</div>

<style>
	.numeric-demo {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.metric {
		display: grid;
		align-content: start;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		background: var(--dry-color-bg-subtle);
		border-radius: var(--dry-radius-card);
	}
</style>
