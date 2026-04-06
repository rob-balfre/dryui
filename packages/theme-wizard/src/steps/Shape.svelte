<script lang="ts">
	import { Card } from '@dryui/ui/card';
	import { SegmentedControl } from '@dryui/ui/segmented-control';
	import { Text } from '@dryui/ui/text';
	import { wizardState, setRadiusPreset, setDensity } from '../state.svelte.js';
	import type { RadiusPreset } from '../state.svelte.js';

	const PRESETS: { value: RadiusPreset; label: string; description: string }[] = [
		{ value: 'sharp', label: 'Sharp', description: 'Tight corners' },
		{ value: 'soft', label: 'Soft', description: 'Gentle corners' },
		{ value: 'rounded', label: 'Rounded', description: 'Friendly surfaces' },
		{ value: 'pill', label: 'Pill', description: 'Capsule shapes' }
	];
</script>

<section class="shape-section">
	<div class="corner-grid">
		{#each PRESETS as preset (preset.value)}
			<Card.Root
				as="button"
				variant="interactive"
				size="sm"
				selected={wizardState.shape.radiusPreset === preset.value}
				onclick={() => setRadiusPreset(preset.value)}
			>
				<Card.Content>
					<div class="corner-option">
						<div class="shape-hint" data-shape={preset.value}></div>
						<div class="corner-meta">
							<Text as="span" size="sm" weight="semibold">{preset.label}</Text>
							<Text as="span" size="xs" color="muted">{preset.description}</Text>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="density-control">
		<Text as="span" size="sm" weight="semibold">Spacing density</Text>
		<SegmentedControl.Root value={wizardState.shape.density}>
			<SegmentedControl.Item value="compact" onclick={() => setDensity('compact')}>
				Compact
			</SegmentedControl.Item>
			<SegmentedControl.Item value="default" onclick={() => setDensity('default')}>
				Default
			</SegmentedControl.Item>
			<SegmentedControl.Item value="spacious" onclick={() => setDensity('spacious')}>
				Spacious
			</SegmentedControl.Item>
		</SegmentedControl.Root>
	</div>
</section>

<style>
	.shape-section {
		display: grid;
		gap: var(--dry-space-5);
		container-type: inline-size;
	}

	.corner-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.corner-option {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}

	.corner-meta {
		display: grid;
		gap: var(--dry-space-1);
	}

	.shape-hint {
		aspect-ratio: 1;
		height: 2.5rem;
		border: 2px solid var(--dry-color-stroke-strong);
		background: var(--dry-color-bg-base);
		transition: border-radius 0.2s ease;
	}

	.shape-hint[data-shape='sharp'] {
		border-radius: 2px;
	}

	.shape-hint[data-shape='soft'] {
		border-radius: 8px;
	}

	.shape-hint[data-shape='rounded'] {
		border-radius: 16px;
	}

	.shape-hint[data-shape='pill'] {
		border-radius: 9999px;
	}

	.density-control {
		display: grid;
		grid-template-columns: auto minmax(0, 20rem);
		align-items: center;
		gap: var(--dry-space-4);
	}

	@container (max-width: 36rem) {
		.corner-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.density-control {
			grid-template-columns: 1fr;
		}
	}
</style>
