<script lang="ts">
	import { Container, Card, Heading, Text } from '@dryui/ui';

	const stats = [
		{ label: 'Active Users', value: '1,284', delta: '+12% vs last week' },
		{ label: 'Revenue', value: '$42,580', delta: '+8.4% vs last week' },
		{ label: 'Conversion', value: '3.2%', delta: '+0.6pp vs last week' }
	];
</script>

<Container size="lg">
	<div class="dashboard">
		<header class="dashboard-header">
			<Heading level={1}>Dashboard</Heading>
			<Text as="p" color="secondary">Overview of this week's key metrics.</Text>
		</header>

		<div class="stat-grid">
			{#each stats as stat (stat.label)}
				<Card.Root>
					<Card.Content>
						<div class="stat">
							<Text as="span" variant="label" color="muted" size="sm">{stat.label}</Text>
							<Heading level={2}>{stat.value}</Heading>
							<Text as="p" color="secondary" size="sm">{stat.delta}</Text>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>
</Container>

<style>
	.dashboard {
		display: grid;
		gap: var(--dry-space-6);
		padding-block: var(--dry-space-8);
	}

	.dashboard-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.stat-grid {
		display: grid;
		gap: var(--dry-space-4);
		grid-template-columns: 1fr;
		container-type: inline-size;
	}

	@container (min-inline-size: 48rem) {
		.stat-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.stat {
		display: grid;
		gap: var(--dry-space-2);
	}
</style>
