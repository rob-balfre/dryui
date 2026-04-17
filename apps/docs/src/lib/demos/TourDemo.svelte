<script lang="ts">
	import { Button, Card, Text, Tour } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';

	let active = $state(false);

	const steps = [
		{
			target: '#tour-demo-plan',
			title: 'Plan review',
			content: 'Start with the rollout card so you can confirm the release plan.',
			placement: 'bottom' as const
		},
		{
			target: '#tour-demo-launch',
			title: 'Launch checklist',
			content: 'Finish on the checklist card to confirm owners and handoff status.',
			placement: 'left' as const
		}
	];
</script>

<DocsDemo>
	<Button onclick={() => (active = true)}>Start Tour</Button>

	<div class="tour-grid">
		<Card.Root id="tour-demo-plan">
			<Card.Content>
				<div class="tour-card-copy">
					<strong class="tour-card-title">Plan review</strong>
					<Text color="secondary">Check prerequisites before publishing.</Text>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root id="tour-demo-launch">
			<Card.Content>
				<div class="tour-card-copy">
					<strong class="tour-card-title">Launch checklist</strong>
					<Text color="secondary">Verify QA, docs, and rollout owners.</Text>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</DocsDemo>

<Tour.Root bind:active {steps}>
	<Tour.Tooltip />
</Tour.Root>

<style>
	.tour-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.tour-card-copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.tour-card-title {
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-base-size);
		line-height: var(--dry-text-base-leading);
	}

	@container (max-width: 42rem) {
		.tour-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
