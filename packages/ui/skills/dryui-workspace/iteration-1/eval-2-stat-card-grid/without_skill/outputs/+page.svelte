<script lang="ts">
	import { Container, Card, Heading, Text } from '@dryui/ui';

	type Stat = {
		label: string;
		value: string;
		delta: string;
		trend: 'up' | 'down';
	};

	const stats: Stat[] = [
		{ label: 'Active Users', value: '1,284', delta: '+12% vs last week', trend: 'up' },
		{ label: 'Revenue', value: '$42,580', delta: '+8.4% vs last week', trend: 'up' },
		{ label: 'Conversion', value: '3.2%', delta: '+0.4pp vs last week', trend: 'up' }
	];
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<section class="dashboard">
	<Container size="lg">
		<header class="dashboard-header">
			<Heading level={1}>Dashboard</Heading>
			<Text as="p" color="secondary">Key metrics across your account this week.</Text>
		</header>

		<div class="stat-grid">
			{#each stats as stat (stat.label)}
				<Card.Root>
					<Card.Content>
						<div class="stat">
							<Text as="span" color="muted" size="sm" variant="label" weight="medium">
								{stat.label}
							</Text>
							<Heading level={2} variant="display">{stat.value}</Heading>
							<Text as="p" color="secondary" size="sm" data-trend={stat.trend}>
								{stat.delta}
							</Text>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</Container>
</section>

<style>
	.dashboard {
		display: grid;
		padding-block: var(--dry-space-8, 2rem);
	}

	.dashboard-header {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
		padding-block-end: var(--dry-space-6, 1.5rem);
	}

	.stat-grid {
		display: grid;
		gap: var(--dry-space-4, 1rem);
		grid-template-columns: 1fr;
		container-type: inline-size;
	}

	@container (min-width: 640px) {
		.stat-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.stat {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	[data-trend='up'] {
		color: var(--dry-color-success, var(--dry-color-text-secondary));
	}

	[data-trend='down'] {
		color: var(--dry-color-danger, var(--dry-color-text-secondary));
	}
</style>
