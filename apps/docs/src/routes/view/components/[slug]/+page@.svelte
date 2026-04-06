<script lang="ts">
	import type { PageProps } from './$types';
	import { Badge, Card, Text } from '@dryui/ui';
	import ViewLayout from '$lib/components/ViewLayout.svelte';
	import ComponentScreenshotFallback from '$lib/components/ComponentScreenshotFallback.svelte';
	import { getComponentConfigurator } from '$lib/configurators/index';
	import { hasCustomComponentScreenshotPreview } from '$lib/component-screenshots';
	import '../../../../app.css';

	let { data }: PageProps = $props();

	let configuratorPromise = $derived(getComponentConfigurator(data.name));
	let packageLabel = $derived(data.kind === 'primitive' ? '@dryui/primitives' : '@dryui/ui');
	let hasConfigurator = $derived(configuratorPromise !== null);
	let previewMode = $derived.by(() => {
		if (hasConfigurator) return 'live';
		return hasCustomComponentScreenshotPreview(data.name) ? 'custom' : 'thumbnail';
	});
	let previewBadgeLabel = $derived(
		previewMode === 'live'
			? 'Live preview'
			: previewMode === 'custom'
				? 'Custom preview'
				: 'Thumbnail preview'
	);
</script>

<ViewLayout title={`${data.name} Preview`}>
	<section class="preview-page" data-component-screenshot-page data-preview-mode={previewMode}>
		<header class="preview-header">
			<div class="meta-row">
				<Badge variant="soft" size="sm">{data.category}</Badge>
				<Badge variant="outline" size="sm">{packageLabel}</Badge>
				<Badge variant="soft" color="blue" size="sm">{previewBadgeLabel}</Badge>
			</div>

			<Text size="sm" color="secondary">
				{data.description}
			</Text>
		</header>

		{#if configuratorPromise}
			{#await configuratorPromise then ConfiguratorComponent}
				<div class="live-preview-shell" data-component-preview-live={data.name}>
					<ConfiguratorComponent />
				</div>
			{/await}
		{:else}
			<Card.Root>
				<Card.Content>
					<div
						class="preview-surface"
						data-component-preview-root
						data-component-name={data.name}
						data-preview-mode={previewMode}
					>
						<ComponentScreenshotFallback name={data.name} />
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	</section>
</ViewLayout>

<style>
	.preview-page {
		display: grid;
		gap: var(--dry-space-6);
	}

	.preview-header {
		display: grid;
		grid-template-columns: minmax(0, 60rem);
		gap: var(--dry-space-3);
	}

	.meta-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}

	.live-preview-shell {
		display: grid;
	}

	.preview-surface {
		display: grid;
	}
</style>
