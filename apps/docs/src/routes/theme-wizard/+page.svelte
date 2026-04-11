<script lang="ts">
	import '@dryui/ui/themes/aurora.css';
	import '@dryui/ui/themes/midnight.css';
	import '@dryui/ui/themes/terminal.css';
	import { Badge, Button, CodeBlock, Container, Heading, Text } from '@dryui/ui';
	import {
		PersonalityStep,
		BrandColor,
		Typography as TypographyStep,
		Shape,
		PreviewExport
	} from '@dryui/theme-wizard';
	import { isDarkTheme, setThemePreference } from '$lib/theme.svelte.js';
	import PreviewComponents from '$lib/theme-wizard/PreviewComponents.svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';

	interface PresetThemeDoc {
		name: string;
		modeLabel: string;
		modeColor: 'gray' | 'green';
		description: string;
		importCode: string;
		previewTheme: string;
		previewBadge: string;
		previewKicker: string;
		previewTitle: string;
		previewCopy: string;
	}

	const presetThemes: PresetThemeDoc[] = [
		{
			name: 'Aurora',
			modeLabel: 'Light + dark',
			modeColor: 'green',
			description:
				'Warm organic surfaces with coral brand colour, amber accents, and a softer serif-forward personality.',
			importCode: `<script>
  import '@dryui/ui/themes/aurora.css';
<\/script>

<html data-theme="aurora">
  <!-- light mode -->
</html>

<html data-theme="aurora-dark">
  <!-- dark mode -->
</html>`,
			previewTheme: 'aurora',
			previewBadge: 'Warm organic',
			previewKicker: 'Coral + amber',
			previewTitle: 'Editorial launch surface',
			previewCopy: 'Soft gradients, warmer neutrals, and gentler corners for a less clinical UI.'
		},
		{
			name: 'Midnight',
			modeLabel: 'Dark only',
			modeColor: 'gray',
			description:
				'Layered dark glass with lavender brand tokens, rose highlights, and more atmospheric depth.',
			importCode: `<script>
  import '@dryui/ui/themes/midnight.css';
<\/script>

<html data-theme="midnight">
  <!-- dark mode -->
</html>`,
			previewTheme: 'midnight',
			previewBadge: 'Dark glass',
			previewKicker: 'Lavender + rose',
			previewTitle: 'Ambient control panel',
			previewCopy:
				'Use it when you want the UI to feel luminous, soft-edged, and distinctly nocturnal.'
		},
		{
			name: 'Terminal',
			modeLabel: 'Dark only',
			modeColor: 'gray',
			description:
				'High-contrast monochrome surfaces with sharp corners, bright green brand tokens, and monospace typography.',
			importCode: `<script>
  import '@dryui/ui/themes/terminal.css';
<\/script>

<html data-theme="terminal">
  <!-- dark mode -->
</html>`,
			previewTheme: 'terminal',
			previewBadge: 'Monospace',
			previewKicker: 'Green phosphor',
			previewTitle: 'Diagnostics-first interface',
			previewCopy:
				'Best for dense tooling, dashboards, and any layout that should read as precise and technical.'
		}
	];

	let themeMode = $derived<'light' | 'dark'>(isDarkTheme() ? 'dark' : 'light');
</script>

<svelte:head>
	<title>Theme Wizard — DryUI</title>
</svelte:head>

<Container size="xl">
	<div class="wizard-page">
		<DocsPageHeader
			title="Theme Wizard"
			description="Pick your brand colour, fonts, and shape — scroll down to preview and export."
		/>

		<section class="wizard-section">
			<Heading level={2}>Personality</Heading>
			<Text color="secondary">How much visual chrome should your UI have?</Text>
			<PersonalityStep />
		</section>

		<section class="wizard-section">
			<Heading level={2}>Brand Colour</Heading>
			<Text color="secondary">Pick a colour or choose a preset.</Text>
			<BrandColor mode={themeMode} />
		</section>

		<section class="wizard-section">
			<Heading level={2}>Typography</Heading>
			<Text color="secondary">Choose a font family and type scale.</Text>
			<TypographyStep />
		</section>

		<section class="wizard-section">
			<Heading level={2}>Shape</Heading>
			<Text color="secondary">Set corner radius and spacing density.</Text>
			<Shape />
		</section>

		<section class="wizard-section">
			<Heading level={2}>Preview</Heading>
			<Text color="secondary">See your theme on real components, then export.</Text>
			<PreviewExport mode={themeMode} onmodechange={(m) => setThemePreference(m)}>
				{#snippet preview()}
					<PreviewComponents />
				{/snippet}
			</PreviewExport>
		</section>

		<section class="wizard-section">
			<Heading level={2}>Preset themes</Heading>
			<Text color="secondary">
				If you want a faster starting point than generating tokens from scratch, these packaged
				themes give you ready-made directions with their own selectors and tone.
			</Text>

			<div class="preset-grid">
				{#each presetThemes as preset (preset.name)}
					<article class="preset-card">
						<div class="preset-card-copy">
							<div class="preset-card-meta">
								<div class="preset-card-heading">
									<Heading level={3}>{preset.name}</Heading>
									<Badge variant="outline" color={preset.modeColor}>{preset.modeLabel}</Badge>
								</div>
								<Text color="secondary">{preset.description}</Text>
							</div>

							<div class="preset-preview" data-theme={preset.previewTheme}>
								<div class="preset-preview-shell">
									<div class="preset-preview-header">
										<Badge variant="outline" color="gray">{preset.previewBadge}</Badge>
										<p class="preset-preview-kicker">{preset.previewKicker}</p>
									</div>

									<div class="preset-preview-copy">
										<p class="preset-preview-title">{preset.previewTitle}</p>
										<Text color="secondary" size="sm">{preset.previewCopy}</Text>
									</div>

									<div class="preset-preview-actions">
										<Button variant="solid" size="sm">Primary</Button>
										<Button variant="secondary" size="sm">Secondary</Button>
									</div>
								</div>
							</div>

							<CodeBlock language="svelte" code={preset.importCode} />
						</div>
					</article>
				{/each}
			</div>
		</section>
	</div>
</Container>

<style>
	.wizard-page {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-10);
		padding-bottom: var(--dry-space-10);
	}

	.wizard-section {
		display: grid;
		gap: var(--dry-space-4);
	}

	.preset-grid,
	.preset-card-copy,
	.preset-card-meta,
	.preset-card-heading,
	.preset-preview-shell,
	.preset-preview-header,
	.preset-preview-copy,
	.preset-preview-actions {
		display: grid;
	}

	.preset-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.preset-card {
		padding: var(--dry-space-5);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-xl);
		background: var(--dry-color-bg-base);
	}

	.preset-card-copy {
		gap: var(--dry-space-4);
	}

	.preset-card-meta {
		gap: var(--dry-space-2);
	}

	.preset-card-heading {
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: start;
		gap: var(--dry-space-3);
	}

	.preset-preview {
		position: relative;
		overflow: hidden;
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 78%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 92%, transparent)
		);
	}

	.preset-preview-shell {
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 68%, transparent);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-raised) 92%, transparent),
			color-mix(in srgb, var(--dry-color-bg-overlay) 84%, transparent)
		);
		box-shadow: var(--dry-shadow-raised);
	}

	.preset-preview-header {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	.preset-preview-copy {
		gap: var(--dry-space-2);
	}

	.preset-preview-kicker,
	.preset-preview-title {
		margin: 0;
	}

	.preset-preview-kicker {
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.preset-preview-title {
		font-size: var(--dry-text-lg-size);
		font-weight: var(--dry-font-weight-semibold);
		color: var(--dry-color-text-strong);
	}

	.preset-preview-actions {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		gap: var(--dry-space-2);
	}

	@container (max-width: 70rem) {
		.preset-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@container (max-width: 42rem) {
		.preset-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
