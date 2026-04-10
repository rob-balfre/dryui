<script lang="ts">
	import { Badge, Card, Heading, Text } from '@dryui/ui';
	import DashboardPreview from '$lib/previews/DashboardPreview.svelte';
	import DataTablePreview from '$lib/previews/DataTablePreview.svelte';
	import FormPreview from '$lib/previews/FormPreview.svelte';

	const themeClasses = ['theme-auto', 'theme-dark', 'theme-light'] as const;
	const surfaces = [
		{ label: 'Surface mix', value: '3 previews' },
		{ label: 'Snapshot mode', value: 'element compare' },
		{ label: 'Theme', value: 'default auto' }
	] as const;

	$effect(() => {
		const root = document.documentElement;
		const previousClasses = themeClasses.filter((themeClass) =>
			root.classList.contains(themeClass)
		);

		root.classList.remove(...themeClasses);
		root.classList.add('theme-light');

		return () => {
			root.classList.remove(...themeClasses);
			root.classList.add(...previousClasses);
		};
	});
</script>

<div class="scene-shell">
	<div class="scene-stack" data-benchmark-root data-testid="visual-benchmark-root">
		<header class="scene-header">
			<div class="scene-copy">
				<Badge variant="soft">Visual benchmark</Badge>
				<Heading level={1}>DryUI component scene</Heading>
				<Text as="p" color="muted">
					Stable component composition for comparing local screenshot workflows across visual
					checking tools.
				</Text>
			</div>

			<Card.Root variant="elevated" size="sm">
				<Card.Content>
					<div class="meta-grid">
						{#each surfaces as surface (surface.label)}
							<div class="meta-item">
								<Text as="span" color="muted">{surface.label}</Text>
								<Text as="span" weight="bold">{surface.value}</Text>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</header>

		<section class="preview-grid" aria-label="Benchmark previews">
			<div class="preview-panel" data-benchmark-section="dashboard">
				<DashboardPreview />
			</div>

			<div class="preview-panel" data-benchmark-section="form">
				<FormPreview />
			</div>

			<div class="preview-panel preview-panel-wide" data-benchmark-section="table">
				<DataTablePreview />
			</div>
		</section>
	</div>
</div>

<style>
	.scene-shell {
		display: grid;
		grid-template-columns: minmax(0, 1200px);
		justify-content: center;
		container-type: inline-size;
		padding: var(--dry-space-8) var(--dry-space-5) var(--dry-space-10);
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent) 0,
				transparent 48%
			),
			linear-gradient(180deg, var(--dry-color-bg-base) 0%, var(--dry-color-bg-raised) 100%);
	}

	.scene-stack {
		display: grid;
		gap: var(--dry-space-6);
	}

	.scene-header {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(16rem, 24rem);
		align-items: start;
		gap: var(--dry-space-4);
	}

	.scene-copy,
	.meta-grid,
	.meta-item,
	.preview-grid {
		display: grid;
	}

	.scene-copy {
		gap: var(--dry-space-2);
	}

	.meta-grid {
		gap: var(--dry-space-3);
	}

	.meta-item {
		gap: var(--dry-space-1);
	}

	.preview-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-4);
		align-items: start;
	}

	.preview-panel {
		overflow: clip;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-xl);
		background: var(--dry-color-bg-base);
		box-shadow: 0 20px 50px color-mix(in srgb, var(--dry-color-text-strong) 10%, transparent);
	}

	.preview-panel-wide {
		grid-column: 1 / -1;
	}

	@container (max-width: 60rem) {
		.scene-header,
		.preview-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
