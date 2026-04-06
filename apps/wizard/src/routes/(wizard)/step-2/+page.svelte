<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Badge,
		Button,
		Card,
		Container,
		Heading,
		Input,
		Label,
		Listbox,
		Text,
		Thumbnail
	} from '@dryui/ui';
	import { getWizardController } from '../../../lib/wizard-context.svelte';
	import type { WizardRegionId } from '../../../lib/types';

	const controller = getWizardController();

	const layout = $derived(controller.activeLayout);
	const regions = $derived(layout?.regions ?? []);

	function regionSearch(regionId: WizardRegionId): string {
		return controller.regionSearches[regionId] ?? '';
	}

	function filteredComponents(regionId: WizardRegionId) {
		return controller.getRegionGroups(regionId).flatMap((group) => group.components);
	}
</script>

<svelte:head>
	<title>Wizard Step 2 - dryui</title>
</svelte:head>

<Container size="xl">
	<div class="page-stack">
		<section class="intro-section">
			<Heading level={2}>Assign components to regions</Heading>
			<Text size="lg" color="secondary">
				Search the curated component catalog and pick the blocks that fit each region.
			</Text>
		</section>

		{#each regions as region (region.id)}
			<Card.Root>
				<Card.Header>
					<div class="region-card-header">
						<div class="region-heading">
							<Heading level={3}>{region.label}</Heading>
							<Text size="sm" color="secondary">{region.description}</Text>
						</div>
						<Badge variant="soft">{controller.selections[region.id]?.length ?? 0} selected</Badge>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="region-content">
						<div class="search-field">
							<Label>Search components</Label>
							<Input
								aria-label={`Search components for ${region.label}`}
								type="search"
								value={regionSearch(region.id)}
								placeholder={`Filter ${region.label.toLowerCase()}`}
								oninput={(event) =>
									controller.setRegionSearch(
										region.id,
										(event.currentTarget as HTMLInputElement).value
									)}
							/>
						</div>

						<div class="selected-badges">
							{#each controller.selections[region.id] ?? [] as name (name)}
								<Badge variant="outline" color="gray">{name}</Badge>
							{/each}
							{#if (controller.selections[region.id] ?? []).length === 0}
								<Text size="sm" color="secondary">No selections yet.</Text>
							{/if}
						</div>

						<Listbox.Root
							multiple
							value={controller.selections[region.id] ?? []}
							onvaluechange={(value) =>
								controller.setRegionSelections(region.id, value as string[])}
						>
							{#each filteredComponents(region.id) as component (component.name)}
								<Listbox.Item value={component.name}>
									<div class="component-item">
										<Thumbnail.Root name={component.name} size="md" />
										<div class="component-info">
											<Text as="span"><strong>{component.name}</strong></Text>
											<Text as="span" size="sm" color="secondary">{component.description}</Text>
										</div>
									</div>
								</Listbox.Item>
							{/each}
						</Listbox.Root>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}

		<div class="page-nav">
			<Button type="button" variant="outline" onclick={() => void goto('/step-1')}
				>Back to layout</Button
			>
			<Button type="button" variant="solid" onclick={() => void goto('/step-3')}
				>Preview selections</Button
			>
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

	.region-card-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: start;
		gap: var(--dry-space-6);
	}

	.region-heading {
		display: grid;
		gap: var(--dry-space-2);
	}

	.region-content {
		display: grid;
		gap: var(--dry-space-4);
	}

	.search-field {
		display: grid;
		gap: var(--dry-space-2);
	}

	.selected-badges {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}

	.component-item {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.component-info {
		display: grid;
		gap: var(--dry-space-2);
	}

	.page-nav {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
