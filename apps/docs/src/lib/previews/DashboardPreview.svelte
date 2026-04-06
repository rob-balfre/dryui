<script lang="ts">
	import { Badge, Card, Chart, Heading, Text } from '@dryui/ui';

	const metrics = [
		{ label: 'Revenue', value: '$128k', detail: '+12.4% this week' },
		{ label: 'Trials', value: '1,284', detail: '+4.1% this week' },
		{ label: 'Conversion', value: '8.9%', detail: '+0.7% this week' }
	];

	const data = [
		{ label: 'Mon', value: 32 },
		{ label: 'Tue', value: 41 },
		{ label: 'Wed', value: 36 },
		{ label: 'Thu', value: 58 },
		{ label: 'Fri', value: 63 },
		{ label: 'Sat', value: 51 },
		{ label: 'Sun', value: 74 }
	];
</script>

<div class="preview">
	<div class="stack-lg">
		<div class="stack-sm">
			<Badge variant="soft">Dashboard</Badge>
			<Heading level={3}>Revenue command center</Heading>
			<Text as="p" color="muted">
				Compact metrics, a live trend line, and room for a narrow navigation rail.
			</Text>
		</div>

		<div class="metrics-grid">
			{#each metrics as metric (metric.label)}
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text as="span" color="muted">{metric.label}</Text>
							<Heading level={3}>{metric.value}</Heading>
							<Text as="p" color="muted">{metric.detail}</Text>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<Card.Root>
			<Card.Content>
				<div class="stack-md">
					<div class="chart-header">
						<div>
							<Text as="span" color="muted">Weekly traffic</Text>
							<Heading level={4}>Trend line</Heading>
						</div>
						<Badge variant="outline">Live</Badge>
					</div>
					<Chart.Root
						{data}
						width={560}
						height={220}
						padding={{ top: 12, right: 12, bottom: 24, left: 24 }}
					>
						<Chart.Line strokeWidth={3} showDots color="var(--dry-color-fill-brand)" />
						<Chart.XAxis />
						<Chart.YAxis ticks={5} />
					</Chart.Root>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<style>
	.preview {
		container-type: inline-size;
		padding: var(--dry-space-5);
		background: var(--dry-color-bg-raised);
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--dry-space-4);
	}

	.chart-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: start;
		gap: var(--dry-space-3);
	}

	@container (max-width: 700px) {
		.chart-header {
			grid-template-columns: 1fr;
		}
	}
</style>
