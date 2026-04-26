<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import {
		Adjust,
		Badge,
		Button,
		ColorPicker,
		OptionPicker,
		Popover,
		Select,
		Slider,
		Tabs,
		Text,
		TokenScope,
		VisuallyHidden
	} from '@dryui/ui';
	import {
		wizardState,
		setBrandHsb,
		setPersonality,
		setFontPreset,
		setTypeScale,
		setRadiusPreset,
		setDensity,
		getAllTokens,
		getDerivedTheme,
		applyRecipe,
		decodeRecipe,
		hsbToHsl,
		hslToHex,
		hexToHsl,
		hslToHsb,
		resetToDefaults,
		downloadCss,
		copyCss,
		contrastBetweenCssColors,
		PRESETS,
		RECIPE_PRESETS,
		FONT_STACKS,
		type BrandInput,
		type RecipePreset
	} from '@dryui/theme-wizard';
	import {
		Sparkles,
		ShieldCheck,
		ShieldAlert,
		Moon,
		Sun,
		Monitor,
		Download,
		ClipboardCopy,
		SlidersHorizontal,
		RotateCcw
	} from 'lucide-svelte';
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
	let presetOpen = $state(false);
	let accentOpen = $state(false);
	let advancedOpen = $state(false);

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

	function brandHsbToHex(brand: { h: number; s: number; b: number }): string {
		const hsl = hsbToHsl(brand.h, brand.s / 100, brand.b / 100);
		return hslToHex(hsl.h, hsl.s, hsl.l);
	}

	function setBrandFromHex(value: string) {
		const hsl = hexToHsl(value);
		const hsb = hslToHsb(hsl.h, hsl.s, hsl.l);
		const current = wizardState.brandHsb;
		if (
			Math.round(hsb.h) !== Math.round(current.h) ||
			Math.round(hsb.s * 100) !== Math.round(current.s) ||
			Math.round(hsb.b * 100) !== Math.round(current.b)
		) {
			setBrandHsb(hsb.h, Math.round(hsb.s * 100), Math.round(hsb.b * 100));
		}
	}

	function thumbSlug(name: string): string {
		return name.toLowerCase().replace(/\s+/g, '-');
	}

	function brandHex(brand: BrandInput): string {
		const hsl = hsbToHsl(brand.h, brand.s / 100, brand.b / 100);
		return hslToHex(hsl.h, hsl.s, hsl.l);
	}

	function recipeBrandHex(preset: RecipePreset): string {
		return brandHex(preset.recipe.brand);
	}

	function cssVar(name: string, value: string) {
		return (node: HTMLElement) => {
			node.style.setProperty(name, value);
			return () => {
				node.style.removeProperty(name);
			};
		};
	}

	function isSameBrand(current: BrandInput, candidate: BrandInput): boolean {
		return current.h === candidate.h && current.s === candidate.s && current.b === candidate.b;
	}

	function isSelectedPreset(preset: RecipePreset): boolean {
		return (
			isSameBrand(wizardState.brandHsb, preset.recipe.brand) &&
			wizardState.personality === preset.recipe.personality &&
			wizardState.typography.fontPreset === preset.recipe.typography?.fontPreset &&
			wizardState.typography.scale === preset.recipe.typography?.scale &&
			wizardState.shape.radiusPreset === preset.recipe.shape?.radiusPreset &&
			wizardState.shape.radiusScale === preset.recipe.shape?.radiusScale &&
			wizardState.shape.density === preset.recipe.shape?.density &&
			wizardState.shadows.preset === preset.recipe.shadows?.preset &&
			wizardState.shadows.intensity === preset.recipe.shadows?.intensity &&
			wizardState.shadows.tintBrand === preset.recipe.shadows?.tintBrand &&
			wizardState.adjust.brightness === (preset.recipe.adjust?.brightness ?? 100) &&
			wizardState.adjust.contrast === (preset.recipe.adjust?.contrast ?? 100) &&
			wizardState.adjust.saturate === (preset.recipe.adjust?.saturate ?? 100) &&
			wizardState.adjust.hueRotate === (preset.recipe.adjust?.hueRotate ?? 0)
		);
	}

	function getSelectedRecipePresetName(): string {
		return RECIPE_PRESETS.find((preset) => isSelectedPreset(preset))?.name ?? '';
	}

	function applyRecipePresetName(name: string) {
		const preset = RECIPE_PRESETS.find((candidate) => candidate.name === name);
		if (preset) {
			applyRecipe(preset.recipe);
			presetOpen = false;
		}
	}

	function getSelectedBrandPresetName(): string {
		return (
			PRESETS.find((preset) => isSameBrand(wizardState.brandHsb, preset.brandInput))?.name ?? ''
		);
	}

	function applyBrandPresetName(name: string) {
		const preset = PRESETS.find((candidate) => candidate.name === name);
		if (preset) {
			setBrandHsb(preset.brandInput.h, preset.brandInput.s, preset.brandInput.b);
		}
	}

	function resetAdjust() {
		wizardState.adjust.brightness = 100;
		wizardState.adjust.contrast = 100;
		wizardState.adjust.saturate = 100;
		wizardState.adjust.hueRotate = 0;
	}

	function resetAll() {
		resetToDefaults();
		resetAdjust();
	}

	let hasAdjustments = $derived(
		wizardState.adjust.brightness !== 100 ||
			wizardState.adjust.contrast !== 100 ||
			wizardState.adjust.saturate !== 100 ||
			wizardState.adjust.hueRotate !== 0
	);

	interface ContrastCheck {
		label: string;
		fgToken: string;
		bgToken: string;
		threshold: number;
	}

	const BG_TOKEN = '--dry-color-bg-base';

	const CONTRAST_CHECKS: ContrastCheck[] = [
		{
			label: 'Surface text',
			fgToken: '--dry-color-text-strong',
			bgToken: BG_TOKEN,
			threshold: 4.5
		},
		{
			label: 'Surface UI',
			fgToken: '--dry-color-stroke-strong',
			bgToken: BG_TOKEN,
			threshold: 3
		},
		{
			label: 'On-brand text',
			fgToken: '--dry-color-on-brand',
			bgToken: '--dry-color-fill-brand',
			threshold: 4.5
		},
		{
			label: 'Brand fill',
			fgToken: '--dry-color-fill-brand',
			bgToken: BG_TOKEN,
			threshold: 3
		}
	];

	function getContrastResults(mode: 'light' | 'dark') {
		const t = getAllTokens(mode);
		return CONTRAST_CHECKS.map((check) => {
			const fg = t[check.fgToken] ?? '';
			const bg = t[check.bgToken] ?? '';
			const ratio = contrastBetweenCssColors(fg, bg);
			return {
				label: check.label,
				ratio,
				passes: ratio !== null && ratio >= check.threshold,
				ratioLabel: ratio !== null ? `${ratio.toFixed(1)}:1` : '---'
			};
		});
	}

	let lightContrast = $derived(getContrastResults('light'));
	let darkContrast = $derived(getContrastResults('dark'));
	let allContrastPass = $derived(
		lightContrast.every((c) => c.passes) && darkContrast.every((c) => c.passes)
	);

	let copyFeedback = $state('');

	function handleDownload() {
		downloadCss(getDerivedTheme());
	}

	let copyTimer: ReturnType<typeof setTimeout>;

	async function handleCopyCss() {
		await copyCss(getDerivedTheme());
		copyFeedback = 'Copied!';
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copyFeedback = ''), 2000);
	}

	const startingPresets = RECIPE_PRESETS.filter((p) =>
		['Default', 'Corporate', 'Midnight'].includes(p.name)
	);
	const technicalPresets = RECIPE_PRESETS.filter((p) =>
		['Wireframe', 'Dashboard', 'Terminal', 'Ember'].includes(p.name)
	);
	const editorialPresets = RECIPE_PRESETS.filter((p) => ['Editorial', 'Playful'].includes(p.name));

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
	const TYPE_SCALE_OPTIONS = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'default', label: 'Default' },
		{ value: 'spacious', label: 'Spacious' }
	] as const;

	const FONT_OPTIONS = Object.keys(FONT_STACKS) as Array<keyof typeof FONT_STACKS>;

	const THEME_OPTIONS = [
		{ value: 'system' as const, label: 'Auto', icon: Monitor },
		{ value: 'light' as const, label: 'Light', icon: Sun },
		{ value: 'dark' as const, label: 'Dark', icon: Moon }
	];

	function setThemeMode(value: string) {
		if (value === 'system' || value === 'light' || value === 'dark') {
			docsTheme.setMode(value);
		}
	}

	function getThemeMode(): string {
		return docsTheme.mode;
	}

	let activeAccentName = $derived(getSelectedBrandPresetName());
	let activeFontName = $derived(wizardState.typography.fontPreset);
	let activeRadius = $derived(wizardState.shape.radiusPreset);
	let activeDensity = $derived(wizardState.shape.density);
	let activePersonalityLabel = $derived(
		PERSONALITY_OPTIONS.find((o) => o.value === wizardState.personality)?.label ?? 'Base'
	);
	let accentSwatchHex = $derived(brandHsbToHex(wizardState.brandHsb));
</script>

<svelte:head>
	<title>Theme Wizard — DryUI</title>
</svelte:head>

<Tabs.Root bind:value={previewMode} activationMode="manual">
	<div class="workbench" data-mode={themeMode}>
		<header class="bar">
			<div class="bar-brand">
				<span class="bar-logo">
					<Logo />
				</span>
				<span class="bar-title">Theme Wizard</span>
			</div>

			<nav class="bar-tabs" aria-label="Preview mode">
				<Tabs.List>
					<Tabs.Trigger value="overview" size="sm">Overview</Tabs.Trigger>
					<Tabs.Trigger value="forms" size="sm">Forms</Tabs.Trigger>
					<Tabs.Trigger value="dashboard" size="sm">Dashboard</Tabs.Trigger>
					<Tabs.Trigger value="cards" size="sm">Cards</Tabs.Trigger>
				</Tabs.List>
			</nav>

			<div class="bar-actions">
				<Popover.Root bind:open={presetOpen}>
					<Popover.Trigger>
						<Button variant="ghost" size="sm">
							<Sparkles size={14} aria-hidden="true" />
							<span class="bar-action-label">Preset</span>
						</Button>
					</Popover.Trigger>
					<Popover.Content placement="bottom-end">
						<div class="preset-panel">
							{#each [['Starting points', startingPresets], ['Technical', technicalPresets], ['Editorial', editorialPresets]] as const as [title, group] (title)}
								<div class="preset-group">
									<div class="preset-group-label">{title}</div>
									<div class="wizard-option-scope wizard-preset-list">
										<OptionPicker.Root
											columns={1}
											bind:value={getSelectedRecipePresetName, applyRecipePresetName}
										>
											{#each group as preset (preset.name)}
												<OptionPicker.Item value={preset.name} size="compact">
													<OptionPicker.Preview
														variant="preset"
														data-shape={preset.recipe.shape?.radiusPreset ?? 'soft'}
														data-preset-thumb={thumbSlug(preset.name)}
														{@attach cssVar('--_preset-color', recipeBrandHex(preset))}
													>
														<span class="preset-thumb-text">Ag</span>
													</OptionPicker.Preview>
													<OptionPicker.Label>
														<span class="preset-option-label">{preset.name}</span>
													</OptionPicker.Label>
													<OptionPicker.Description>
														<span class="preset-option-description">{preset.description}</span>
													</OptionPicker.Description>
												</OptionPicker.Item>
											{/each}
										</OptionPicker.Root>
									</div>
								</div>
							{/each}
						</div>
					</Popover.Content>
				</Popover.Root>

				<Button
					variant="ghost"
					size="sm"
					onclick={() => docsTheme.cycle()}
					aria-label={docsTheme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if docsTheme.isDark}
						<Sun size={14} aria-hidden="true" />
					{:else}
						<Moon size={14} aria-hidden="true" />
					{/if}
				</Button>

				<Button variant="ghost" size="sm" onclick={handleCopyCss}>
					<ClipboardCopy size={14} aria-hidden="true" />
					<span class="bar-action-label">{copyFeedback || 'Copy'}</span>
				</Button>

				<Button variant="solid" size="sm" onclick={handleDownload}>
					<Download size={14} aria-hidden="true" />
					<span class="bar-action-label">Download</span>
				</Button>
			</div>
		</header>

		<Adjust
			brightness={wizardState.adjust.brightness}
			contrast={wizardState.adjust.contrast}
			saturate={wizardState.adjust.saturate}
			hueRotate={wizardState.adjust.hueRotate}
		>
			<TokenScope {tokens}>
				<main class="frame">
					<div class="viewport">
						<Tabs.Content value="overview">
							<OverviewPreview />
						</Tabs.Content>
						<Tabs.Content value="forms">
							<FormsPreview />
						</Tabs.Content>
						<Tabs.Content value="dashboard">
							<DashboardPreview />
						</Tabs.Content>
						<Tabs.Content value="cards">
							<CardsPreview />
						</Tabs.Content>
					</div>
				</main>
			</TokenScope>
		</Adjust>

		<footer class="rail">
			<div class="rail-modules">
				<div class="rail-module">
					<span class="rail-label">Accent</span>
					<Popover.Root bind:open={accentOpen}>
						<Popover.Trigger>
							<Button variant="secondary" size="sm" aria-label="Edit accent color">
								<span class="rail-color-swatch" {@attach cssVar('--_swatch', accentSwatchHex)}
								></span>
								<span class="rail-color-name">{activeAccentName || 'Custom'}</span>
							</Button>
						</Popover.Trigger>
						<Popover.Content placement="top-start">
							<div class="accent-panel">
								<div class="accent-panel-section">
									<div class="accent-panel-label">Picker</div>
									<ColorPicker.Root
										bind:value={() => brandHsbToHex(wizardState.brandHsb), setBrandFromHex}
										areaHeight={160}
									>
										<ColorPicker.Area />
										<ColorPicker.HueSlider />
										<ColorPicker.Input format="hex" />
									</ColorPicker.Root>
								</div>
								<div class="accent-panel-section">
									<div class="accent-panel-label">Brand presets</div>
									<div class="wizard-option-scope wizard-color-options">
										<OptionPicker.Root
											columns={3}
											bind:value={getSelectedBrandPresetName, applyBrandPresetName}
										>
											{#each PRESETS as preset (preset.name)}
												<OptionPicker.Item
													value={preset.name}
													size="compact"
													layout="stacked"
													title={preset.name}
													aria-label={preset.name}
												>
													<OptionPicker.Preview
														shape="circle"
														color={brandHex(preset.brandInput)}
														data-color-thumb={thumbSlug(preset.name)}
													/>
													<VisuallyHidden>{preset.name}</VisuallyHidden>
												</OptionPicker.Item>
											{/each}
										</OptionPicker.Root>
									</div>
								</div>
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>

				<div class="rail-module">
					<span class="rail-label" id="rail-base-label">Base</span>
					<Select.Root name="base" bind:value={wizardState.personality}>
						<Select.Trigger aria-labelledby="rail-base-label">
							<Select.Value placeholder={activePersonalityLabel} />
						</Select.Trigger>
						<Select.Content>
							{#each PERSONALITY_OPTIONS as opt (opt.value)}
								<Select.Item value={opt.value}>{opt.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="rail-module">
					<span class="rail-label" id="rail-font-label">Font</span>
					<Select.Root name="font" bind:value={wizardState.typography.fontPreset}>
						<Select.Trigger aria-labelledby="rail-font-label">
							<Select.Value placeholder={activeFontName} />
						</Select.Trigger>
						<Select.Content>
							{#each FONT_OPTIONS as name (name)}
								<Select.Item value={name}>
									<span
										class="rail-font-label"
										{@attach cssVar('--_preset-font', FONT_STACKS[name])}>{name}</span
									>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="rail-module">
					<span class="rail-label">Radius</span>
					<div class="wizard-option-scope rail-segmented">
						<OptionPicker.Root columns={4} bind:value={() => activeRadius, setRadiusPreset}>
							{#each RADIUS_OPTIONS as opt (opt.value)}
								<OptionPicker.Item value={opt.value} size="compact" layout="stacked">
									<OptionPicker.Preview variant="shape" data-shape={opt.value} />
									<VisuallyHidden>{opt.label}</VisuallyHidden>
								</OptionPicker.Item>
							{/each}
						</OptionPicker.Root>
					</div>
				</div>

				<div class="rail-module">
					<span class="rail-label">Density</span>
					<div class="wizard-option-scope rail-segmented">
						<OptionPicker.Root columns={3} bind:value={() => activeDensity, setDensity}>
							{#each DENSITY_OPTIONS as opt (opt.value)}
								<OptionPicker.Item
									value={opt.value}
									size="compact"
									layout="stacked"
									aria-label={opt.label}
								>
									<span class="density-dots" data-density={opt.value} aria-hidden="true">
										<span class="density-dot"></span>
										<span class="density-dot"></span>
										<span class="density-dot"></span>
									</span>
									<VisuallyHidden>{opt.label}</VisuallyHidden>
								</OptionPicker.Item>
							{/each}
						</OptionPicker.Root>
					</div>
				</div>

				<div class="rail-module">
					<span class="rail-label">Theme</span>
					<div class="wizard-option-scope rail-segmented">
						<OptionPicker.Root columns={3} bind:value={getThemeMode, setThemeMode}>
							{#each THEME_OPTIONS as opt (opt.value)}
								{@const ThemeIcon = opt.icon}
								<OptionPicker.Item
									value={opt.value}
									size="compact"
									layout="stacked"
									aria-label={opt.label}
								>
									<ThemeIcon size={14} aria-hidden="true" />
									<VisuallyHidden>{opt.label}</VisuallyHidden>
								</OptionPicker.Item>
							{/each}
						</OptionPicker.Root>
					</div>
				</div>
			</div>

			<div class="rail-aux">
				<Popover.Root bind:open={advancedOpen}>
					<Popover.Trigger>
						<Button variant="ghost" size="sm" aria-label="Open advanced controls">
							<SlidersHorizontal size={14} aria-hidden="true" />
							{#if !allContrastPass}
								<ShieldAlert size={14} aria-hidden="true" />
							{:else}
								<ShieldCheck size={14} aria-hidden="true" />
							{/if}
							<span class="bar-action-label">Advanced</span>
						</Button>
					</Popover.Trigger>
					<Popover.Content placement="top-end">
						<div class="advanced-panel">
							<div class="advanced-panel-section">
								<div class="advanced-panel-label">Type scale</div>
								<div class="wizard-option-scope rail-segmented">
									<OptionPicker.Root
										columns={3}
										bind:value={() => wizardState.typography.scale, setTypeScale}
									>
										{#each TYPE_SCALE_OPTIONS as opt (opt.value)}
											<OptionPicker.Item value={opt.value} size="compact">
												<OptionPicker.Label>{opt.label}</OptionPicker.Label>
											</OptionPicker.Item>
										{/each}
									</OptionPicker.Root>
								</div>
							</div>

							<div class="advanced-panel-section">
								<div class="advanced-panel-label">Filters</div>
								<div class="adjust-rows">
									<div class="adjust-row">
										<Text size="sm">Brightness</Text>
										<Slider
											bind:value={wizardState.adjust.brightness}
											min={50}
											max={150}
											size="sm"
										/>
										<Text size="xs" color="muted">{wizardState.adjust.brightness}%</Text>
									</div>
									<div class="adjust-row">
										<Text size="sm">Contrast</Text>
										<Slider bind:value={wizardState.adjust.contrast} min={50} max={150} size="sm" />
										<Text size="xs" color="muted">{wizardState.adjust.contrast}%</Text>
									</div>
									<div class="adjust-row">
										<Text size="sm">Saturation</Text>
										<Slider bind:value={wizardState.adjust.saturate} min={0} max={200} size="sm" />
										<Text size="xs" color="muted">{wizardState.adjust.saturate}%</Text>
									</div>
									<div class="adjust-row">
										<Text size="sm">Hue</Text>
										<Slider
											bind:value={wizardState.adjust.hueRotate}
											min={-180}
											max={180}
											size="sm"
										/>
										<Text size="xs" color="muted">{wizardState.adjust.hueRotate}°</Text>
									</div>
								</div>
								{#if hasAdjustments}
									<div class="advanced-panel-actions">
										<Button variant="secondary" size="sm" onclick={resetAdjust}>
											Reset filters
										</Button>
									</div>
								{/if}
							</div>

							<div class="advanced-panel-section">
								<div class="advanced-panel-label">Contrast</div>
								<div class="contrast-grid">
									<div class="contrast-column">
										<div class="contrast-column-label">Light</div>
										{#each lightContrast as check (check.label)}
											<div class="contrast-row">
												<span class="contrast-row-label">{check.label}</span>
												<Badge variant="soft" color={check.passes ? 'success' : 'danger'} size="sm">
													{check.ratioLabel}
												</Badge>
											</div>
										{/each}
									</div>
									<div class="contrast-column">
										<div class="contrast-column-label">Dark</div>
										{#each darkContrast as check (check.label)}
											<div class="contrast-row">
												<span class="contrast-row-label">{check.label}</span>
												<Badge variant="soft" color={check.passes ? 'success' : 'danger'} size="sm">
													{check.ratioLabel}
												</Badge>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</Popover.Content>
				</Popover.Root>

				<Button variant="ghost" size="sm" onclick={resetAll} aria-label="Reset all">
					<RotateCcw size={14} aria-hidden="true" />
					<span class="bar-action-label">Reset</span>
				</Button>
			</div>
		</footer>
	</div>
</Tabs.Root>

<style>
	.workbench {
		--workbench-bar-h: 3.5rem;
		--workbench-rail-min-h: 5rem;
		--workbench-frame-radius: var(--dry-radius-2xl, 1.5rem);
		--workbench-viewport-radius: var(--dry-radius-xl, 1rem);
		--wizard-accent-bg: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 38%,
			var(--dry-color-bg-base) 62%
		);
		--wizard-accent-bg-hover: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 46%,
			var(--dry-color-bg-base) 54%
		);
		--wizard-accent-bg-active: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 54%,
			var(--dry-color-bg-base) 46%
		);
		--wizard-accent-border: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 68%,
			var(--dry-color-stroke-strong) 32%
		);
		--wizard-accent-weak: color-mix(
			in srgb,
			var(--dry-color-fill-brand) 12%,
			var(--dry-color-bg-raised) 88%
		);
		--wizard-accent-fg: var(--dry-color-text-strong);
		display: grid;
		grid-template-rows: var(--workbench-bar-h) minmax(0, 1fr) auto;
		container-type: inline-size;
		block-size: 100dvh;
		overflow: hidden;
		background: color-mix(in srgb, var(--dry-color-bg-base) 96%, var(--dry-color-fill-brand) 4%);
	}

	.bar {
		display: grid;
		grid-template-columns: minmax(0, max-content) minmax(0, 1fr) minmax(0, max-content);
		align-items: center;
		gap: var(--dry-space-3);
		padding-inline: var(--dry-space-4);
		border-block-end: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-raised);
	}

	.bar-brand {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.bar-logo {
		display: inline-grid;
		font-size: 1rem;
		color: var(--dry-color-text-strong);
	}

	.bar-title {
		font-size: 0.875rem;
		font-weight: 650;
		letter-spacing: -0.01em;
		color: var(--dry-color-text-strong);
	}

	.bar-tabs {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-self: center;
	}

	.bar-actions {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		justify-self: end;
	}

	.bar-action-label {
		display: none;
	}

	@container (min-width: 56rem) {
		.bar-action-label {
			display: inline;
		}
	}

	.frame {
		display: grid;
		padding: var(--dry-space-4);
		min-height: 0;
	}

	.viewport {
		display: grid;
		min-height: 0;
		padding: var(--dry-space-5) var(--dry-space-4);
		border-radius: var(--workbench-viewport-radius);
		background: var(--dry-color-bg-base);
		border: 1px solid var(--dry-color-stroke-weak);
		overflow: auto;
	}

	@container (min-width: 64rem) {
		.frame {
			padding: var(--dry-space-5) var(--dry-space-6) var(--dry-space-4);
		}
		.viewport {
			padding: var(--dry-space-6) var(--dry-space-5);
			border-radius: var(--workbench-frame-radius);
		}
	}

	.rail {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, max-content);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-block-start: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-raised);
	}

	.rail-modules {
		display: grid;
		grid-template-columns:
			minmax(7rem, 9rem) minmax(6rem, 9rem) minmax(6rem, 9rem) minmax(9rem, 11rem)
			minmax(7rem, 9rem) minmax(6rem, 8rem);
		align-items: stretch;
		gap: var(--dry-space-3);
	}

	.rail-module {
		display: grid;
		grid-template-rows: auto 2.5rem;
		align-content: end;
		gap: var(--dry-space-1_5);
		justify-items: stretch;
	}

	.rail-label {
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1;
		color: var(--dry-color-text-weak);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.rail-segmented {
		display: grid;
		--dry-option-picker-gap: 2px;
		--dry-option-picker-padding-x: var(--dry-space-1);
		--dry-option-picker-padding-y: var(--dry-space-0_5);
		--dry-option-picker-min-block-size: 2.5rem;
		--dry-option-picker-compact-min-block-size: 2.5rem;
		--dry-option-picker-radius: var(--dry-radius-md);
		--dry-option-picker-content-align: center;
	}

	.rail-aux {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		justify-self: end;
	}

	.density-dots {
		display: inline-grid;
		grid-template-columns: repeat(3, 0.25rem);
		grid-template-rows: 0.25rem;
		gap: 0.125rem;
		align-items: center;
		justify-content: center;
	}

	.density-dots[data-density='compact'] {
		gap: 1px;
	}

	.density-dots[data-density='spacious'] {
		gap: 0.25rem;
	}

	.density-dot {
		display: inline-grid;
		grid-template-columns: 0.25rem;
		grid-template-rows: 0.25rem;
		border-radius: 50%;
		background: currentColor;
	}

	.rail-color-swatch {
		display: inline-grid;
		grid-template-columns: 1.125rem;
		grid-template-rows: 1.125rem;
		border-radius: 50%;
		background: var(--_swatch, var(--dry-color-fill-brand));
		border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
	}

	.rail-color-name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		justify-self: start;
	}

	.rail-font-label {
		font-family: var(--_preset-font, inherit);
		font-size: 0.8125rem;
	}

	.preset-panel {
		display: grid;
		grid-template-columns: repeat(3, minmax(13rem, 14rem));
		align-items: start;
		gap: var(--dry-space-4);
		padding: var(--dry-space-3);
	}

	.preset-group {
		display: grid;
		grid-template-rows: auto auto;
		gap: var(--dry-space-2);
	}

	.preset-group-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.wizard-preset-list {
		--dry-option-picker-padding-y: var(--dry-space-2);
		--dry-option-picker-padding-x: var(--dry-space-2_5);
		--dry-option-picker-content-align: center;
		--dry-option-picker-compact-min-block-size: 0;
		--dry-option-picker-preview-preset-size: 1.875rem;
		--dry-option-picker-label-size: 0.875rem;
		--dry-option-picker-description-size: 0.8125rem;
	}

	.preset-option-description {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		text-wrap: auto;
	}

	.preset-thumb-text {
		font-family: var(--_preset-font, inherit);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1;
		color: var(--dry-color-on-brand, #ffffff);
	}

	.accent-panel {
		display: grid;
		grid-template-columns: minmax(18rem, 22rem);
		gap: var(--dry-space-4);
		padding: var(--dry-space-3);
	}

	.accent-panel-section {
		display: grid;
		gap: var(--dry-space-2);
	}

	.accent-panel-label,
	.advanced-panel-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.wizard-color-options {
		--dry-option-picker-gap: var(--dry-space-2);
		--dry-option-picker-padding-x: var(--dry-space-1);
		--dry-option-picker-padding-y: var(--dry-space-1);
		--dry-option-picker-min-block-size: 0;
		--dry-option-picker-radius: var(--dry-radius-full);
		--dry-option-picker-preview-size: 1.5rem;
		--dry-option-picker-preview-radius: 9999px;
	}

	.advanced-panel {
		display: grid;
		grid-template-columns: minmax(22rem, 24rem);
		gap: var(--dry-space-4);
		padding: var(--dry-space-3);
	}

	.advanced-panel-section {
		display: grid;
		gap: var(--dry-space-2);
	}

	.advanced-panel-actions {
		display: grid;
		justify-items: end;
	}

	.adjust-rows {
		display: grid;
		gap: var(--dry-space-2_5);
	}

	.adjust-row {
		display: grid;
		grid-template-columns: 4.5rem minmax(8rem, 1fr) 2.5rem;
		align-items: center;
		gap: var(--dry-space-2_5);
	}

	.contrast-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--dry-space-3);
	}

	.contrast-column {
		display: grid;
		gap: var(--dry-space-1_5);
	}

	.contrast-column-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--dry-color-text-weak);
	}

	.contrast-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.contrast-row-label {
		font-size: 0.8125rem;
		color: var(--dry-color-text-strong);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.wizard-option-scope {
		display: grid;
		--dry-color-fill: var(--wizard-accent-weak);
		--dry-color-fill-brand: var(--wizard-accent-bg);
		--dry-color-fill-brand-hover: var(--wizard-accent-bg-hover);
		--dry-color-fill-brand-active: var(--wizard-accent-bg-active);
		--dry-color-on-brand: var(--wizard-accent-fg);
		--dry-color-stroke-selected: var(--wizard-accent-border);
		--dry-option-picker-selected-bg: color-mix(
			in srgb,
			var(--wizard-accent-bg) 14%,
			var(--dry-color-bg-raised) 86%
		);
		--dry-option-picker-selected-bg-hover: color-mix(
			in srgb,
			var(--wizard-accent-bg) 18%,
			var(--dry-color-bg-raised) 82%
		);
		--dry-option-picker-selected-border: color-mix(
			in srgb,
			var(--wizard-accent-border) 86%,
			var(--dry-color-stroke-weak) 14%
		);
	}

	@container (max-width: 48rem) {
		.workbench {
			--workbench-bar-h: auto;
			grid-template-rows: auto minmax(0, 1fr) auto;
		}

		.bar {
			grid-template-columns: minmax(0, 1fr) minmax(0, max-content);
			grid-template-rows: auto auto;
			grid-template-areas:
				'brand actions'
				'tabs tabs';
			align-items: center;
			padding: var(--dry-space-2) var(--dry-space-3);
			gap: var(--dry-space-2);
		}

		.bar-brand {
			grid-area: brand;
		}

		.bar-tabs {
			grid-area: tabs;
			justify-self: stretch;
			grid-auto-flow: column;
			grid-auto-columns: 1fr;
			overflow-x: auto;
		}

		.bar-actions {
			grid-area: actions;
		}

		.frame {
			padding: var(--dry-space-3);
		}

		.viewport {
			padding: var(--dry-space-4) var(--dry-space-3);
		}

		.rail {
			grid-template-columns: minmax(0, 1fr);
			padding: var(--dry-space-3);
		}

		.rail-modules {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			grid-auto-rows: auto;
		}

		.rail-aux {
			justify-self: stretch;
			grid-auto-columns: 1fr;
		}
	}
</style>
