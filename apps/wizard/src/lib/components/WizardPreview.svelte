<script lang="ts">
	import { Badge, Card, DescriptionList, ScrollArea, Text } from '@dryui/ui';
	import ComponentPreview from './ComponentPreview.svelte';
	import type { WizardController } from '../wizard-state.svelte';
	import type { WizardRegionId } from '../types';

	interface Props {
		controller: WizardController;
	}

	let { controller }: Props = $props();

	const layout = $derived(controller.activeLayout);
	const selections = $derived(controller.selectionsSnapshot());

	function selectedComponents(regionId: WizardRegionId): string[] {
		return selections.regions[regionId] ?? [];
	}
</script>

{#if layout}
	<div class="preview-outer">
		{#if layout.id === 'sidebar-main'}
			<div class="sidebar-main preview-grid">
				<section class="preview-region sidebar">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Sidebar</Badge>
						<Text as="span" size="sm" color="secondary">Navigation and supporting context</Text>
					</div>
					<ScrollArea>
						<div class="region-components">
							{#each selectedComponents('sidebar') as name, index (name + index)}
								<ComponentPreview {name} />
							{/each}
							{#if selectedComponents('sidebar').length === 0}
								<div class="empty-state">
									<h3 class="empty-state-title">Nothing in sidebar</h3>
									<p class="empty-state-description">Assign components to see the navigation column populate.</p>
								</div>
							{/if}
						</div>
					</ScrollArea>
				</section>

				<section class="preview-region main">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Main</Badge>
						<Text as="span" size="sm" color="secondary">Primary workspace</Text>
					</div>
					<div class="region-components">
						{#each selectedComponents('main') as name, index (name + index)}
							<ComponentPreview {name} />
						{/each}
						{#if selectedComponents('main').length === 0}
							<div class="empty-state">
								<h3 class="empty-state-title">Main region empty</h3>
								<p class="empty-state-description">Assign the main work area components here.</p>
							</div>
						{/if}
					</div>
				</section>
			</div>
		{:else if layout.id === 'header-content-footer'}
			<div class="header-content-footer preview-grid">
				<section class="preview-region header">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Header</Badge>
						<Text as="span" size="sm" color="secondary">Top area</Text>
					</div>
					<div class="region-components">
						{#each selectedComponents('header') as name, index (name + index)}
							<ComponentPreview {name} />
						{/each}
					</div>
				</section>

				<section class="preview-region main">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Content</Badge>
						<Text as="span" size="sm" color="secondary">Core message and details</Text>
					</div>
					<div class="region-components">
						{#each selectedComponents('main') as name, index (name + index)}
							<ComponentPreview {name} />
						{/each}
					</div>
				</section>

				<section class="preview-region footer">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Footer</Badge>
						<Text as="span" size="sm" color="secondary">Final actions and notes</Text>
					</div>
					<div class="region-components">
						{#each selectedComponents('footer') as name, index (name + index)}
							<ComponentPreview {name} />
						{/each}
					</div>
				</section>
			</div>
		{:else}
			<div class="header-sidebar-main preview-grid">
				<section class="preview-region header">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Header</Badge>
						<Text as="span" size="sm" color="secondary">App chrome</Text>
					</div>
					<div class="region-components">
						{#each selectedComponents('header') as name, index (name + index)}
							<ComponentPreview {name} />
						{/each}
					</div>
				</section>

				<section class="preview-region sidebar">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Sidebar</Badge>
						<Text as="span" size="sm" color="secondary">Navigation column</Text>
					</div>
					<ScrollArea>
						<div class="region-components">
							{#each selectedComponents('sidebar') as name, index (name + index)}
								<ComponentPreview {name} />
							{/each}
						</div>
					</ScrollArea>
				</section>

				<section class="preview-region main">
					<div class="region-header" data-region-header>
						<Badge variant="outline">Main</Badge>
						<Text as="span" size="sm" color="secondary">Primary workspace</Text>
					</div>
					<div class="region-components">
						{#each selectedComponents('main') as name, index (name + index)}
							<ComponentPreview {name} />
						{/each}
					</div>
				</section>
			</div>
		{/if}

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
								{selectedComponents(region.id).join(', ') || 'No components selected'}
							</DescriptionList.Description>
						</DescriptionList.Item>
					{/each}
				</DescriptionList.Root>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="empty-state">
		<h3 class="empty-state-title">Choose a layout first</h3>
		<p class="empty-state-description">Step 3 needs a selected layout and component catalog before the live preview can render.</p>
	</div>
{/if}

<style>
	.preview-outer {
		display: grid;
		gap: var(--dry-space-6);
	}

	.region-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.region-components {
		display: grid;
		gap: var(--dry-space-4);
	}

	.preview-grid {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-4);
	}

	.sidebar-main {
		grid-template-columns: minmax(220px, 0.78fr) minmax(320px, 1.42fr);
	}

	.header-content-footer {
		grid-template-columns: minmax(0, 1fr);
	}

	.header-sidebar-main {
		grid-template-columns: minmax(0, 1fr) minmax(220px, 0.72fr) minmax(320px, 1.28fr);
	}

	.preview-region {
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-border);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-surface);
		box-shadow: var(--wizard-shell-shadow);
		min-height: 220px;
	}

	.preview-region.main {
		background: color-mix(in srgb, var(--dry-color-surface-raised) 94%, transparent);
	}

	.preview-region [data-region-header] {
		margin-bottom: var(--dry-space-3);
	}

	@container (max-width: 980px) {
		.sidebar-main,
		.header-sidebar-main {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.empty-state {
		display: grid;
		grid-template-columns: minmax(0, 36ch);
		justify-content: center;
		justify-items: center;
		text-align: center;
		gap: var(--dry-space-4);
		padding: var(--dry-space-8);
	}

	.empty-state-title {
		font-weight: 600;
		color: var(--dry-color-text-strong);
		margin: 0;
	}

	.empty-state-description {
		color: var(--dry-color-text-weak);
		margin: 0;
	}
</style>
