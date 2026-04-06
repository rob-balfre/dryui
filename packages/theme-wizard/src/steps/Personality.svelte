<script lang="ts">
	import { Card } from '@dryui/ui/card';
	import { Text } from '@dryui/ui/text';
	import { wizardState, setPersonality } from '../state.svelte.js';
	import type { Personality as PersonalityPreset } from '../state.svelte.js';

	const OPTIONS: {
		value: PersonalityPreset;
		name: string;
		description: string;
	}[] = [
		{
			value: 'minimal',
			name: 'Minimal',
			description: 'Flat, transparent, content-forward',
		},
		{
			value: 'clean',
			name: 'Clean',
			description: 'Subtle separation, gentle edges',
		},
		{
			value: 'structured',
			name: 'Structured',
			description: 'Clear regions, visible cards',
		},
		{
			value: 'rich',
			name: 'Rich',
			description: 'Elevated surfaces, deep layering',
		}
	];

	let selected = $derived(wizardState.personality);
</script>

<section class="personality-step" aria-label="Personality presets">
	<div class="options-grid">
		{#each OPTIONS as option (option.value)}
			<Card.Root
				as="button"
				variant="interactive"
				size="sm"
				selected={selected === option.value}
				onclick={() => setPersonality(option.value)}
			>
				<Card.Content noPadding>
					<div class="preview-frame" data-personality={option.value}>
						<div class="preview-toolbar">
							<div class="preview-dot"></div>
							<div class="preview-pills">
								<div class="preview-pill"></div>
								<div class="preview-pill short"></div>
							</div>
						</div>

						<div class="preview-body">
							<div class="preview-sidebar">
								<div class="preview-nav-line"></div>
								<div class="preview-nav-line"></div>
								<div class="preview-nav-line short"></div>
							</div>

							<div class="preview-main">
								<div class="preview-card primary">
									<div class="preview-line"></div>
									<div class="preview-line short"></div>
								</div>
								<div class="preview-card-grid">
									<div class="preview-card secondary">
										<div class="preview-line"></div>
										<div class="preview-line shorter"></div>
									</div>
									<div class="preview-card secondary">
										<div class="preview-line"></div>
										<div class="preview-line short"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card.Content>

				<Card.Footer>
					<div class="option-stack">
						<div class="title-row">
							<Text as="span" size="sm" weight="semibold">{option.name}</Text>
						</div>

						<Text as="p" size="sm" color="muted">{option.description}</Text>
					</div>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</section>

<style>
	.personality-step {
		container-type: inline-size;
	}

	.options-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
		gap: var(--dry-space-4);
		align-items: start;
	}

	.option-stack,
	.preview-body,
	.preview-sidebar,
	.preview-main,
	.preview-card,
	.preview-card-grid {
		display: grid;
	}

	.option-stack {
		gap: var(--dry-space-2);
	}

	.title-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.preview-frame {
		display: grid;
		grid-template-rows: auto 1fr;
		min-block-size: 10.5rem;
		border-radius: var(--dry-radius-lg) var(--dry-radius-lg) 0 0;
		overflow: clip;
	}

	.preview-toolbar {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
	}

	.preview-dot {
		block-size: 0.375rem;
		aspect-ratio: 1;
		border-radius: 999px;
	}

	.preview-pills {
		display: grid;
		grid-template-columns: 2rem 1rem;
		gap: var(--dry-space-1);
	}

	.preview-pill {
		block-size: 0.25rem;
		border-radius: 999px;
	}

	.preview-body {
		grid-template-columns: 2.75rem minmax(0, 1fr);
		min-block-size: 0;
	}

	.preview-sidebar {
		align-content: start;
		gap: 0.375rem;
		padding: var(--dry-space-3);
	}

	.preview-nav-line,
	.preview-line {
		block-size: 0.25rem;
		border-radius: 999px;
		background-size: var(--_line-fill, 100%) 100%;
		background-repeat: no-repeat;
	}

	.preview-nav-line.short,
	.preview-line.short {
		--_line-fill: 66%;
	}

	.preview-line.shorter {
		--_line-fill: 48%;
	}

	.preview-main {
		align-content: start;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
	}

	.preview-card {
		align-content: start;
		gap: 0.375rem;
		padding: var(--dry-space-3);
	}

	.preview-card-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-2);
	}

	/* Preview colors use currentColor so they stay neutral regardless of
	   wizard theme overrides applied to :root. */

	.preview-frame[data-personality='minimal'] {
		background: color-mix(in srgb, currentColor 4%, transparent);
	}

	[data-personality='minimal'] .preview-dot,
	[data-personality='minimal'] .preview-pill,
	[data-personality='minimal'] .preview-nav-line,
	[data-personality='minimal'] .preview-line {
		background: color-mix(in srgb, currentColor 14%, transparent);
	}

	[data-personality='minimal'] .preview-card {
		background: transparent;
	}

	.preview-frame[data-personality='clean'] {
		background: color-mix(in srgb, currentColor 4%, transparent);
	}

	[data-personality='clean'] .preview-toolbar {
		border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
	}

	[data-personality='clean'] .preview-sidebar {
		border-right: 1px solid color-mix(in srgb, currentColor 8%, transparent);
	}

	[data-personality='clean'] .preview-dot,
	[data-personality='clean'] .preview-pill,
	[data-personality='clean'] .preview-nav-line,
	[data-personality='clean'] .preview-line {
		background: color-mix(in srgb, currentColor 18%, transparent);
	}

	[data-personality='clean'] .preview-card {
		background: color-mix(in srgb, currentColor 6%, transparent);
		border-radius: var(--dry-radius-md);
	}

	.preview-frame[data-personality='structured'] {
		background: color-mix(in srgb, currentColor 4%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
	}

	[data-personality='structured'] .preview-toolbar,
	[data-personality='structured'] .preview-sidebar {
		background: color-mix(in srgb, currentColor 6%, transparent);
	}

	[data-personality='structured'] .preview-toolbar {
		border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
	}

	[data-personality='structured'] .preview-sidebar {
		border-right: 1px solid color-mix(in srgb, currentColor 10%, transparent);
	}

	[data-personality='structured'] .preview-dot,
	[data-personality='structured'] .preview-pill,
	[data-personality='structured'] .preview-nav-line,
	[data-personality='structured'] .preview-line {
		background: color-mix(in srgb, currentColor 22%, transparent);
	}

	[data-personality='structured'] .preview-card {
		background: color-mix(in srgb, currentColor 6%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
		border-radius: var(--dry-radius-md);
	}

	.preview-frame[data-personality='rich'] {
		background: color-mix(in srgb, currentColor 4%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		box-shadow: 0 1.25rem 2.5rem color-mix(in srgb, currentColor 12%, transparent);
	}

	[data-personality='rich'] .preview-toolbar,
	[data-personality='rich'] .preview-sidebar {
		background: color-mix(in srgb, currentColor 8%, transparent);
	}

	[data-personality='rich'] .preview-toolbar {
		border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
	}

	[data-personality='rich'] .preview-sidebar {
		border-right: 1px solid color-mix(in srgb, currentColor 12%, transparent);
	}

	[data-personality='rich'] .preview-dot,
	[data-personality='rich'] .preview-pill,
	[data-personality='rich'] .preview-nav-line,
	[data-personality='rich'] .preview-line {
		background: color-mix(in srgb, currentColor 26%, transparent);
	}

	[data-personality='rich'] .preview-card {
		background: color-mix(in srgb, currentColor 8%, transparent);
		border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		border-radius: var(--dry-radius-lg);
		box-shadow: 0 0.75rem 1.5rem color-mix(in srgb, currentColor 10%, transparent);
	}

	@container (max-width: 40rem) {
		.options-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
