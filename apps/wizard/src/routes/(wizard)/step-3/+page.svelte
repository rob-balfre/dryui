<script lang="ts">
	import { goto } from '$app/navigation';
	import { Alert, Badge, Button, Card, Container, DescriptionList, Heading, Text } from '@dryui/ui';
	import { getWizardController } from '../../../lib/wizard-context.svelte';
	import WizardPreview from '../../../lib/components/WizardPreview.svelte';

	const controller = getWizardController();
	const layout = $derived(controller.activeLayout);
	const selections = $derived(controller.selectionsSnapshot());

	function confirmPhaseOne(): void {
		controller.confirmPhaseOne();
		void goto('/follow-up');
	}
</script>

<svelte:head>
	<title>Wizard Step 3 - dryui</title>
</svelte:head>

<Container size="xl">
	<div class="page-stack">
		<section class="intro-section">
			<Heading level={2}>Preview and confirm</Heading>
			<Text size="lg" color="secondary">
				Review the live layout preview, then confirm the selected regions to move on to follow-up
				questions.
			</Text>
		</section>

		{#if layout}
			<Card.Root>
				<Card.Content>
					<DescriptionList.Root>
						<DescriptionList.Item>
							<DescriptionList.Term>Layout</DescriptionList.Term>
							<DescriptionList.Description>{layout.name}</DescriptionList.Description>
						</DescriptionList.Item>
						{#each layout.regions as region (region.id)}
							<DescriptionList.Item>
								<DescriptionList.Term>{region.label}</DescriptionList.Term>
								<DescriptionList.Description>
									{(selections.regions[region.id] ?? []).join(', ') || 'No components selected'}
								</DescriptionList.Description>
							</DescriptionList.Item>
						{/each}
					</DescriptionList.Root>
				</Card.Content>
			</Card.Root>
		{/if}

		<WizardPreview {controller} />

		<Alert.Root variant="info">
			<Alert.Description>
				The preview uses curated DryUI demo content. It does not mutate your project data.
			</Alert.Description>
		</Alert.Root>

		<div class="page-nav">
			<Button type="button" variant="outline" onclick={() => void goto('/step-2')}
				>Back to regions</Button
			>
			<Button type="button" variant="solid" onclick={confirmPhaseOne}>Confirm phase 1</Button>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-8);
	}

	.intro-section {
		display: grid;
		gap: var(--dry-space-4);
	}

	.page-nav {
		display: grid;
		grid-template-columns: auto 1fr;
		justify-items: end;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
