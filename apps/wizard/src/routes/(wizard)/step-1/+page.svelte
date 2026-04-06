<script lang="ts">
	import { goto } from '$app/navigation';
	import { Badge, Button, Card, Container, Heading, Text, Thumbnail } from '@dryui/ui';
	import { getWizardController } from '../../../lib/wizard-context.svelte';

	const controller = getWizardController();

	const layouts = $derived(controller.layouts);
	const selectedLayoutId = $derived(controller.selectedLayoutId);

	function continueToStep2(): void {
		void goto('/step-2');
	}
</script>

<svelte:head>
	<title>Wizard Step 1 - dryui</title>
</svelte:head>

<Container size="xl">
	<div class="page-stack">
		<section class="intro-section">
			<Heading level={2}>Pick a layout</Heading>
			<Text size="lg" color="secondary">
				Start with a page structure that matches the kind of surface you want to build.
			</Text>
		</section>

		<div class="layouts-grid">
			{#each layouts as layout (layout.id)}
				<Card.Root
					as="button"
					variant={selectedLayoutId === layout.id ? 'interactive' : 'elevated'}
					selected={selectedLayoutId === layout.id}
					onclick={() => controller.selectLayout(layout.id)}
				>
					<Card.Header>
						<div class="card-heading">
							<Heading level={3}>{layout.name}</Heading>
							<Badge variant="outline">{layout.id}</Badge>
						</div>
					</Card.Header>
					<Card.Content>
						{@const thumbnailName = {
							'sidebar-main': 'LayoutSidebarMain',
							'header-content-footer': 'LayoutHeaderContentFooter',
							'header-sidebar-main': 'LayoutHeaderSidebarMain'
						}[layout.id]}
						<div class="thumbnail-center">
							<Thumbnail.Root name={thumbnailName} size="lg" />
						</div>
						<Text size="sm" color="secondary">{layout.description}</Text>
						<div class="region-badges">
							{#each layout.regions as region (region.id)}
								<Badge variant="soft" color="gray">{region.label}</Badge>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<div class="page-actions">
			<Button type="button" variant="solid" onclick={continueToStep2}>Continue to regions</Button>
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

	.layouts-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--dry-space-6);
	}

	.card-heading {
		display: grid;
		gap: var(--dry-space-2);
	}

	.thumbnail-center {
		display: grid;
		justify-items: center;
	}

	.region-badges {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}

	.page-actions {
		display: grid;
		justify-items: end;
	}

	@container (max-width: 860px) {
		.layouts-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@container (max-width: 560px) {
		.layouts-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
