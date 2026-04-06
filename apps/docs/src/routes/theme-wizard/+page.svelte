<script lang="ts">
	import { Container, Heading, Text } from '@dryui/ui';
	import {
		PersonalityStep,
		BrandColor,
		Typography,
		Shape,
		PreviewExport
	} from '@dryui/theme-wizard';
	import { isDarkTheme, setThemePreference } from '$lib/theme.svelte.js';
	import PreviewComponents from '$lib/theme-wizard/PreviewComponents.svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';

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
			<Typography />
		</section>

		<section class="wizard-section">
			<Heading level={2}>Shape</Heading>
			<Text color="secondary">Set corner radius and spacing density.</Text>
			<Shape />
		</section>

		<section class="wizard-section">
			<Heading level={2}>Preview</Heading>
			<Text color="secondary">See your theme on real components, then export.</Text>
			<PreviewExport
				mode={themeMode}
				onmodechange={(m) => setThemePreference(m)}
			>
				{#snippet preview()}
					<PreviewComponents />
				{/snippet}
			</PreviewExport>
		</section>
	</div>
</Container>

<style>
	.wizard-page {
		display: grid;
		gap: var(--dry-space-10);
		padding-bottom: var(--dry-space-10);
	}

	.wizard-section {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
