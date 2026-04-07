<script lang="ts">
	import { Card } from '@dryui/ui/card';
	import { SegmentedControl } from '@dryui/ui/segmented-control';
	import { Text } from '@dryui/ui/text';
	import {
		FONT_STACKS,
		setFontPreset,
		setTypeScale,
		wizardState,
		type FontPreset
	} from '../state.svelte.js';

	const FONT_SAMPLES: Record<FontPreset, string> = {
		System: 'Fast, neutral, and familiar',
		Humanist: 'Warm curves for readable product copy',
		Geometric: 'Sharper rhythm with a modern edge',
		Classical: 'Refined without turning formal',
		Serif: 'Editorial and literary by default',
		Mono: 'Technical, precise, and utilitarian'
	};

	const FONT_PRESETS = (Object.keys(FONT_STACKS) as FontPreset[]).map((name) => ({
		name,
		stack: FONT_STACKS[name],
		sample: FONT_SAMPLES[name]
	}));
</script>

<section class="typography-section">
	<div class="font-grid">
		{#each FONT_PRESETS as preset (preset.name)}
			<Card.Root
				as="button"
				variant="interactive"
				size="sm"
				selected={wizardState.typography.fontPreset === preset.name}
				onclick={() => setFontPreset(preset.name)}
			>
				<Card.Content>
					<div class="font-option" style:--_stack={preset.stack}>
						<span class="font-display">Ag</span>
						<div class="font-meta">
							<Text as="span" size="sm" weight="semibold">{preset.name}</Text>
							<Text as="span" size="xs" color="muted">{preset.sample}</Text>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="scale-control">
		<Text as="span" size="sm" weight="semibold">Type scale</Text>
		<SegmentedControl.Root value={wizardState.typography.scale}>
			<SegmentedControl.Item value="compact" onclick={() => setTypeScale('compact')}>
				Compact
			</SegmentedControl.Item>
			<SegmentedControl.Item value="default" onclick={() => setTypeScale('default')}>
				Default
			</SegmentedControl.Item>
			<SegmentedControl.Item value="spacious" onclick={() => setTypeScale('spacious')}>
				Spacious
			</SegmentedControl.Item>
		</SegmentedControl.Root>
	</div>
</section>

<style>
	.typography-section {
		display: grid;
		gap: var(--dry-space-5);
		container-type: inline-size;
	}

	.font-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.font-option {
		display: grid;
		gap: var(--dry-space-2);
	}

	.font-display {
		font-family: var(--_stack, inherit);
		font-size: 2rem;
		line-height: 1;
	}

	.font-meta {
		display: grid;
		gap: var(--dry-space-1);
	}

	.scale-control {
		display: grid;
		grid-template-columns: auto minmax(0, 20rem);
		align-items: center;
		gap: var(--dry-space-4);
	}

	@container (max-width: 40rem) {
		.font-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@container (max-width: 30rem) {
		.scale-control {
			grid-template-columns: 1fr;
		}
	}
</style>
