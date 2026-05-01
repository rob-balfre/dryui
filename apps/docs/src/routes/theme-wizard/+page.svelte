<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { Adjust, AppFrame, Button, SegmentedControl, Slider, Text, TokenScope } from '@dryui/ui';
	import {
		wizardState,
		setBrandHsb,
		setBaseHue,
		setPersonality,
		setFontPreset,
		setRadiusPreset,
		setDensity,
		getAllTokens,
		getDerivedTheme,
		applyRecipe,
		decodeRecipe,
		resetToDefaults,
		downloadCss,
		copyCss,
		FONT_STACKS,
		type Density,
		type FontPreset,
		type Personality,
		type RadiusPreset
	} from '@dryui/theme-wizard';
	import { Moon, Sun, Download, ClipboardCopy, RotateCcw, List } from 'lucide-svelte';
	import { docsTheme, isDarkTheme } from '$lib/theme.svelte.js';
	import Logo from '$lib/components/Logo.svelte';
	import OverviewPreview from '$lib/theme-wizard/PreviewComponents.svelte';
	import FormsPreview from '$lib/theme-wizard/previews/Forms.svelte';
	import DashboardPreview from '$lib/theme-wizard/previews/Dashboard.svelte';
	import CardsPreview from '$lib/theme-wizard/previews/Cards.svelte';

	let { data }: PageProps = $props();
	let themeMode = $derived<'light' | 'dark'>(isDarkTheme() ? 'dark' : 'light');
	const tokens = $derived(getAllTokens(themeMode));
	let lastAppliedRecipe: string | null = null;
	let previewMode = $state<'overview' | 'forms' | 'dashboard' | 'cards'>('overview');

	function decodeBrowserRecipe() {
		if (!browser) return data;

		const recipeParam = new URL(window.location.href).searchParams.get('t');
		if (!recipeParam) return { recipeParam: null, recipe: null };

		try {
			return {
				recipeParam,
				recipe: decodeRecipe(recipeParam)
			};
		} catch {
			return {
				recipeParam,
				recipe: null
			};
		}
	}

	function applyInitialRecipe() {
		const initial = decodeBrowserRecipe();
		if (!initial.recipeParam || !initial.recipe) return;
		applyRecipe(initial.recipe);
		lastAppliedRecipe = initial.recipeParam;
	}

	applyInitialRecipe();

	afterNavigate(() => {
		const recipe = page.url.searchParams.get('t');
		if (!recipe) {
			lastAppliedRecipe = null;
			return;
		}

		if (recipe === lastAppliedRecipe) return;

		try {
			applyRecipe(decodeRecipe(recipe));
			lastAppliedRecipe = recipe;
		} catch {
			// Ignore malformed recipe URLs and leave the current in-memory state alone.
		}
	});

	const PERSONALITY_OPTIONS = [
		{ value: 'minimal', label: 'Minimal' },
		{ value: 'clean', label: 'Clean' },
		{ value: 'structured', label: 'Structured' },
		{ value: 'rich', label: 'Rich' }
	] as const;

	const RADIUS_OPTIONS = [
		{ value: 'sharp', label: 'Sharp' },
		{ value: 'soft', label: 'Soft' },
		{ value: 'rounded', label: 'Rounded' },
		{ value: 'pill', label: 'Pill' }
	] as const;

	const DENSITY_OPTIONS = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'default', label: 'Default' },
		{ value: 'spacious', label: 'Spacious' }
	] as const;

	const FONT_OPTIONS = Object.keys(FONT_STACKS) as FontPreset[];
	let activePersonalityLabel = $derived(
		PERSONALITY_OPTIONS.find((option) => option.value === wizardState.personality)?.label ??
			wizardState.personality
	);
	let activeRadiusLabel = $derived(
		RADIUS_OPTIONS.find((option) => option.value === wizardState.shape.radiusPreset)?.label ??
			wizardState.shape.radiusPreset
	);
	let activeDensityLabel = $derived(
		DENSITY_OPTIONS.find((option) => option.value === wizardState.shape.density)?.label ??
			wizardState.shape.density
	);

	function getAccentHue(): number {
		return wizardState.brandHsb.h;
	}

	function setAccentHue(value: number): void {
		setBrandHsb(Math.round(value), wizardState.brandHsb.s, wizardState.brandHsb.b);
	}

	function getBaseHue(): number {
		return wizardState.baseHue;
	}

	function setBaseHueValue(value: number): void {
		setBaseHue(Math.round(value));
	}

	function cyclePersonality() {
		const options = PERSONALITY_OPTIONS.map((option) => option.value);
		const index = options.indexOf(wizardState.personality);
		const next = options[(index + 1) % options.length] ?? 'structured';
		setPersonality(next as Personality);
	}

	function cycleFont() {
		const index = FONT_OPTIONS.indexOf(wizardState.typography.fontPreset);
		const next = FONT_OPTIONS[(index + 1) % FONT_OPTIONS.length] ?? 'System';
		setFontPreset(next);
	}

	function cycleRadius() {
		const options = RADIUS_OPTIONS.map((option) => option.value);
		const index = options.indexOf(wizardState.shape.radiusPreset);
		const next = options[(index + 1) % options.length] ?? 'soft';
		setRadiusPreset(next as RadiusPreset);
	}

	function cycleDensity() {
		const options = DENSITY_OPTIONS.map((option) => option.value);
		const index = options.indexOf(wizardState.shape.density);
		const next = options[(index + 1) % options.length] ?? 'default';
		setDensity(next as Density);
	}

	function resetAll() {
		resetToDefaults();
	}

	let copyFeedback = $state('');
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	function handleDownload() {
		downloadCss(getDerivedTheme());
	}

	async function handleCopyCss() {
		await copyCss(getDerivedTheme());
		copyFeedback = 'Copied!';
		if (copyTimer) clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copyFeedback = ''), 2000);
	}

	let previewFrameTitle = $derived(`preview.${previewMode}`);
</script>

<svelte:head>
	<title>Theme Wizard - DryUI</title>
</svelte:head>

<div data-layout="theme-wizard" data-mode={themeMode}>
	<div data-layout-area="brand">
		<Text as="span" size="sm" weight="semibold">
			<Logo />
			<Text as="span" size="sm" weight="semibold">Theme Wizard</Text>
		</Text>
	</div>

	<div data-layout-area="tabs">
		<SegmentedControl.Root bind:value={previewMode} aria-label="Preview mode">
			<SegmentedControl.Item value="overview">Overview</SegmentedControl.Item>
			<SegmentedControl.Item value="forms">Forms</SegmentedControl.Item>
			<SegmentedControl.Item value="dashboard">Dashboard</SegmentedControl.Item>
			<SegmentedControl.Item value="cards">Cards</SegmentedControl.Item>
		</SegmentedControl.Root>
	</div>

	<div data-layout-area="mode">
		<Button
			variant="ghost"
			size="icon-sm"
			onclick={() => docsTheme.cycle()}
			aria-label={docsTheme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{#if docsTheme.isDark}
				<Sun size={14} aria-hidden="true" />
			{:else}
				<Moon size={14} aria-hidden="true" />
			{/if}
		</Button>
	</div>

	<div data-layout-area="copy">
		<Button variant="ghost" size="sm" onclick={handleCopyCss}>
			<ClipboardCopy size={14} aria-hidden="true" />
			{copyFeedback || 'Copy'}
		</Button>
	</div>

	<div data-layout-area="download">
		<Button variant="solid" size="sm" onclick={handleDownload}>
			<Download size={14} aria-hidden="true" />
			Download
		</Button>
	</div>

	<div data-layout-area="reset">
		<Button variant="ghost" size="sm" onclick={resetAll} aria-label="Reset all">
			<RotateCcw size={14} aria-hidden="true" />
			Reset
		</Button>
	</div>

	<div data-layout-area="preview">
		<Adjust
			--dry-adjust-block-size="100%"
			--dry-adjust-min-block-size="0"
			--dry-adjust-overflow="hidden"
			brightness={wizardState.adjust.brightness}
			contrast={wizardState.adjust.contrast}
			saturate={wizardState.adjust.saturate}
			hueRotate={wizardState.adjust.hueRotate}
		>
			<TokenScope {tokens}>
				<AppFrame
					title={previewFrameTitle}
					--dry-app-frame-block-size="100%"
					--dry-app-frame-min-block-size="0"
					--dry-app-frame-content-overflow="auto"
					--dry-app-frame-content-padding="var(--dry-space-3)"
				>
					{#if previewMode === 'overview'}
						<OverviewPreview />
					{:else if previewMode === 'forms'}
						<FormsPreview />
					{:else if previewMode === 'dashboard'}
						<DashboardPreview />
					{:else if previewMode === 'cards'}
						<CardsPreview />
					{/if}
				</AppFrame>
			</TokenScope>
		</Adjust>
	</div>

	<div data-layout-area="accentLabel">
		<Text as="span" variant="label" size="xs">
			Accent {Math.round(wizardState.brandHsb.h)} degrees
		</Text>
	</div>

	<div data-layout-area="accent">
		<Slider
			bind:value={getAccentHue, setAccentHue}
			min={0}
			max={360}
			step={1}
			size="sm"
			aria-label="Accent hue"
		/>
	</div>

	<div data-layout-area="baseLabel">
		<Text as="span" variant="label" size="xs">
			Base {Math.round(wizardState.baseHue)} degrees
		</Text>
	</div>

	<div data-layout-area="base">
		<Slider
			bind:value={getBaseHue, setBaseHueValue}
			min={0}
			max={360}
			step={1}
			size="sm"
			aria-label="Base hue"
		/>
	</div>

	<div data-layout-area="depthLabel">
		<Text as="span" variant="label" size="xs">Depth</Text>
	</div>

	<div data-layout-area="depth">
		<Button
			variant="secondary"
			size="sm"
			onclick={cyclePersonality}
			aria-label={`Depth ${activePersonalityLabel}`}
		>
			{activePersonalityLabel}
		</Button>
	</div>

	<div data-layout-area="fontLabel">
		<Text as="span" variant="label" size="xs">Font</Text>
	</div>

	<div data-layout-area="font">
		<Button
			variant="secondary"
			size="sm"
			onclick={cycleFont}
			aria-label={`Font ${wizardState.typography.fontPreset}`}
		>
			{wizardState.typography.fontPreset}
		</Button>
	</div>

	<div data-layout-area="radiusLabel">
		<Text as="span" variant="label" size="xs">Radius</Text>
	</div>

	<div data-layout-area="radius">
		<Button
			variant="secondary"
			size="sm"
			onclick={cycleRadius}
			aria-label={`Radius ${activeRadiusLabel}`}
		>
			{activeRadiusLabel}
		</Button>
	</div>

	<div data-layout-area="densityLabel">
		<Text as="span" variant="label" size="xs">Density</Text>
	</div>

	<div data-layout-area="density">
		<Button
			variant="secondary"
			size="sm"
			onclick={cycleDensity}
			aria-label={`Density ${activeDensityLabel}`}
		>
			{activeDensityLabel}
		</Button>
	</div>
</div>
