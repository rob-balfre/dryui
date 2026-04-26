<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import {
		Adjust,
		AppFrame,
		Badge,
		Button,
		Container,
		OptionPicker,
		Popover,
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
		resetToDefaults,
		downloadCss,
		copyCss,
		contrastBetweenCssColors,
		PRESETS,
		RECIPE_PRESETS,
		FONT_STACKS,
		type BrandInput,
		type FontPreset,
		type Personality,
		type RecipePreset
	} from '@dryui/theme-wizard';
	import {
		Sparkles,
		Moon,
		Sun,
		Download,
		ClipboardCopy,
		SlidersHorizontal,
		RotateCcw,
		ChevronUp,
		Info,
		Shuffle
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
	let fontOpen = $state(false);
	let shapeOpen = $state(false);
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

	function applyRandomBrandPreset() {
		const current = getSelectedBrandPresetName();
		const candidates = PRESETS.filter((preset) => preset.name !== current);
		const preset = candidates[Math.floor(Math.random() * candidates.length)] ?? PRESETS[0];
		if (preset) {
			applyBrandPresetName(preset.name);
		}
	}

	function focusBrandPreset(name: string) {
		if (!browser) return;

		requestAnimationFrame(() => {
			document
				.querySelector<HTMLButtonElement>(`[data-accent-preset="${thumbSlug(name)}"]`)
				?.focus();
		});
	}

	function moveBrandPresetFocus(index: number, delta: number) {
		const next = PRESETS[(index + delta + PRESETS.length) % PRESETS.length];
		if (!next) return;

		applyBrandPresetName(next.name);
		focusBrandPreset(next.name);
	}

	function handleBrandPresetKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			moveBrandPresetFocus(index, 1);
		}
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			moveBrandPresetFocus(index, -1);
		}
		if (event.key === 'Home') {
			event.preventDefault();
			moveBrandPresetFocus(0, 0);
		}
		if (event.key === 'End') {
			event.preventDefault();
			moveBrandPresetFocus(PRESETS.length - 1, 0);
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
	let mergedContrast = $derived(
		lightContrast.map((light, i) => {
			const dark = darkContrast[i]!;
			return {
				label: light.label,
				light,
				dark,
				passes: light.passes && dark.passes
			};
		})
	);
	let failingContrastCount = $derived(mergedContrast.filter((c) => !c.passes).length);
	let allContrastPass = $derived(failingContrastCount === 0);

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
		{ value: 'minimal', label: 'Minimal', hint: 'Quietest surfaces, lightest borders' },
		{ value: 'clean', label: 'Clean', hint: 'Soft surfaces, restrained shadows' },
		{ value: 'structured', label: 'Structured', hint: 'Defined borders, clear separation' },
		{ value: 'rich', label: 'Rich', hint: 'Layered surfaces, deeper shadows' }
	] as const;
	const FONT_META: Record<FontPreset, { hint: string }> = {
		System: { hint: 'Native interface stack' },
		Humanist: { hint: 'Warm product UI' },
		Geometric: { hint: 'Precise dashboard tone' },
		Classical: { hint: 'Measured enterprise feel' },
		Serif: { hint: 'Editorial contrast' },
		Mono: { hint: 'Technical workspaces' }
	};
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

	const FONT_OPTIONS = Object.keys(FONT_STACKS) as FontPreset[];
	const FONT_PANEL_OPTIONS = FONT_OPTIONS.map((value) => ({
		value,
		label: value,
		hint: FONT_META[value].hint
	}));

	function setBasePanelValue(value: string) {
		if (PERSONALITY_OPTIONS.some((o) => o.value === value)) {
			setPersonality(value as Personality);
		}
	}

	function setFontPanelValue(value: string) {
		if (!FONT_OPTIONS.includes(value as FontPreset)) return;

		setFontPreset(value as FontPreset);
		fontOpen = false;
	}

	let activeAccentName = $derived(getSelectedBrandPresetName());
	let activeFontName = $derived(wizardState.typography.fontPreset);
	let activeRadius = $derived(wizardState.shape.radiusPreset);
	let activeDensity = $derived(wizardState.shape.density);
	let activeRadiusLabel = $derived(
		RADIUS_OPTIONS.find((o) => o.value === activeRadius)?.label ?? 'Soft'
	);
	let activeDensityLabel = $derived(
		DENSITY_OPTIONS.find((o) => o.value === activeDensity)?.label ?? 'Default'
	);
	let activeShapeLabel = $derived(`${activeRadiusLabel} · ${activeDensityLabel}`);
	let previewFrameTitle = $derived(`preview.${previewMode}`);
</script>

<svelte:head>
	<title>Theme Wizard — DryUI</title>
</svelte:head>

<Tabs.Root bind:value={previewMode} activationMode="manual">
	<Container size="xl">
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
						<AppFrame title={previewFrameTitle}>
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
						</AppFrame>
					</main>
				</TokenScope>
			</Adjust>

			<footer class="rail">
				<div class="rail-inner">
					<div class="rail-modules">
						<div class="rail-module">
							<span class="rail-label">
								<span>Accent</span>
								<Info size={13} aria-hidden="true" />
							</span>
							<div class="rail-accent">
								<div class="rail-accent-track" role="radiogroup" aria-label="Accent presets">
									{#each PRESETS as preset, i (preset.name)}
										{@const presetHex = brandHex(preset.brandInput)}
										{@const isActivePreset = activeAccentName === preset.name}
										<span
											class="rail-accent-swatch"
											data-selected={isActivePreset ? '' : undefined}
										>
											<Button
												variant="bare"
												role="radio"
												aria-checked={isActivePreset}
												aria-label={preset.name}
												title={preset.name}
												tabindex={isActivePreset || (!activeAccentName && i === 0) ? 0 : -1}
												data-accent-preset={thumbSlug(preset.name)}
												onclick={() => applyBrandPresetName(preset.name)}
												onkeydown={(event) => handleBrandPresetKeydown(event, i)}
												--dry-btn-bg="transparent"
												--dry-btn-border="transparent"
												--dry-btn-color="inherit"
												--dry-btn-padding-x="0"
												--dry-btn-padding-y="0"
												--dry-btn-min-height="0"
												--dry-btn-radius="9999px"
												--dry-btn-active-transform="none"
												--dry-focus-ring="none"
											>
												<span
													class="rail-accent-dot"
													aria-hidden="true"
													{@attach cssVar('--_swatch', presetHex)}
												></span>
											</Button>
										</span>
									{/each}
								</div>
								<span class="rail-accent-shuffle">
									<Button
										variant="ghost"
										size="sm"
										aria-label="Random accent preset"
										onclick={applyRandomBrandPreset}
										--dry-btn-padding-x="var(--dry-space-1)"
										--dry-btn-padding-y="var(--dry-space-1)"
										--dry-btn-min-height="0"
										--dry-btn-radius="9999px"
									>
										<Shuffle size={14} aria-hidden="true" />
									</Button>
								</span>
							</div>
						</div>

						<div class="rail-module">
							<span class="rail-label" id="rail-base-label">
								<span>Base</span>
								<Info size={13} aria-hidden="true" />
							</span>
							<div class="wizard-option-scope rail-segmented rail-base-segmented">
								<OptionPicker.Root
									columns={4}
									bind:value={() => wizardState.personality, setBasePanelValue}
								>
									{#each PERSONALITY_OPTIONS as opt (opt.value)}
										<OptionPicker.Item
											value={opt.value}
											size="compact"
											layout="stacked"
											aria-label={opt.label}
											title={opt.hint}
										>
											<span class="rail-base-letter" aria-hidden="true">{opt.label[0]}</span>
											<VisuallyHidden>{opt.label}</VisuallyHidden>
										</OptionPicker.Item>
									{/each}
								</OptionPicker.Root>
							</div>
						</div>

						<div class="rail-module">
							<span class="rail-label" id="rail-font-label">Font Family</span>
							<Popover.Root bind:open={fontOpen}>
								<Popover.Trigger>
									<Button variant="secondary" size="sm" aria-labelledby="rail-font-label">
										<span class="rail-trigger-glyph">Aa</span>
										<span class="rail-trigger-value">{activeFontName}</span>
										<ChevronUp size={15} aria-hidden="true" />
									</Button>
								</Popover.Trigger>
								<Popover.Content
									placement="top-start"
									offset={12}
									--dry-popover-padding="0"
									--dry-popover-radius="var(--dry-radius-2xl)"
									--dry-popover-bg="color-mix(in srgb, var(--dry-color-bg-raised) 90%, var(--dry-color-bg-base) 10%)"
									--dry-popover-border="color-mix(in srgb, var(--dry-color-stroke-weak) 82%, transparent 18%)"
									--dry-popover-shadow="var(--dry-shadow-overlay)"
								>
									<div class="font-panel">
										<header class="option-panel-header font-panel-header">
											<span>Suggested</span>
										</header>
										<div class="wizard-option-scope font-picker">
											<OptionPicker.Root
												columns={3}
												bind:value={() => wizardState.typography.fontPreset, setFontPanelValue}
											>
												{#each FONT_PANEL_OPTIONS as font (font.value)}
													<OptionPicker.Item value={font.value} size="visual" layout="stacked">
														<span
															class="font-sample"
															{@attach cssVar('--_preset-font', FONT_STACKS[font.value])}>Ag</span
														>
														<OptionPicker.Label>
															<span
																class="font-option-name"
																{@attach cssVar('--_preset-font', FONT_STACKS[font.value])}
																>{font.label}</span
															>
														</OptionPicker.Label>
														<OptionPicker.Description>
															<VisuallyHidden>{font.hint}</VisuallyHidden>
														</OptionPicker.Description>
													</OptionPicker.Item>
												{/each}
											</OptionPicker.Root>
										</div>
									</div>
								</Popover.Content>
							</Popover.Root>
						</div>

						<div class="rail-module">
							<span class="rail-label" id="rail-shape-label">Shape</span>
							<Popover.Root bind:open={shapeOpen}>
								<Popover.Trigger>
									<Button variant="secondary" size="sm" aria-labelledby="rail-shape-label">
										<span class="rail-trigger-value">{activeShapeLabel}</span>
										<ChevronUp size={15} aria-hidden="true" />
									</Button>
								</Popover.Trigger>
								<Popover.Content
									placement="top-start"
									offset={12}
									--dry-popover-padding="0"
									--dry-popover-radius="var(--dry-radius-2xl)"
									--dry-popover-bg="color-mix(in srgb, var(--dry-color-bg-raised) 90%, var(--dry-color-bg-base) 10%)"
									--dry-popover-border="color-mix(in srgb, var(--dry-color-stroke-weak) 82%, transparent 18%)"
									--dry-popover-shadow="var(--dry-shadow-overlay)"
								>
									<div class="shape-panel">
										<header class="option-panel-header">
											<span>Shape</span>
										</header>
										<div class="shape-panel-row">
											<span class="popover-section-label">Radius</span>
											<div class="wizard-option-scope rail-segmented shape-radius-picker">
												<OptionPicker.Root
													columns={4}
													bind:value={() => activeRadius, setRadiusPreset}
												>
													{#each RADIUS_OPTIONS as opt (opt.value)}
														<OptionPicker.Item
															value={opt.value}
															size="compact"
															layout="stacked"
															aria-label={opt.label}
														>
															<OptionPicker.Preview variant="shape" data-shape={opt.value} />
															<VisuallyHidden>{opt.label}</VisuallyHidden>
														</OptionPicker.Item>
													{/each}
												</OptionPicker.Root>
											</div>
										</div>
										<div class="shape-panel-row">
											<span class="popover-section-label">Density</span>
											<div class="wizard-option-scope rail-segmented shape-density-picker">
												<OptionPicker.Root columns={3} bind:value={() => activeDensity, setDensity}>
													{#each DENSITY_OPTIONS as opt (opt.value)}
														<OptionPicker.Item
															value={opt.value}
															size="compact"
															layout="stacked"
															aria-label={opt.label}
														>
															<span
																class="density-dots"
																data-density={opt.value}
																aria-hidden="true"
															>
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
									</div>
								</Popover.Content>
							</Popover.Root>
						</div>
					</div>

					<div class="rail-aux">
						<Popover.Root bind:open={advancedOpen}>
							<Popover.Trigger>
								<Button variant="outline" size="sm" aria-label="Open advanced controls">
									<span class="rail-aux-icon">
										<SlidersHorizontal size={14} aria-hidden="true" />
										<span
											class="rail-aux-dot"
											data-rail-status={allContrastPass ? 'ok' : 'warn'}
											aria-hidden="true"
										></span>
									</span>
									<span class="bar-action-label">Advanced</span>
								</Button>
							</Popover.Trigger>
							<Popover.Content placement="top-end">
								<div class="advanced-panel">
									<header class="popover-header">
										<span class="popover-title">Advanced</span>
										<Badge variant="soft" color={allContrastPass ? 'success' : 'danger'} size="sm">
											{allContrastPass
												? 'Contrast OK'
												: `${failingContrastCount} contrast issue${failingContrastCount === 1 ? '' : 's'}`}
										</Badge>
									</header>

									<div class="advanced-panel-section">
										<div class="popover-section-label">Type scale</div>
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
										<div class="popover-section-label">Filters</div>
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
												<Slider
													bind:value={wizardState.adjust.contrast}
													min={50}
													max={150}
													size="sm"
												/>
												<Text size="xs" color="muted">{wizardState.adjust.contrast}%</Text>
											</div>
											<div class="adjust-row">
												<Text size="sm">Saturation</Text>
												<Slider
													bind:value={wizardState.adjust.saturate}
													min={0}
													max={200}
													size="sm"
												/>
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
										<div class="popover-section-label">
											<span>Contrast</span>
											<span class="contrast-key">
												<span>Light</span>
												<span aria-hidden="true">·</span>
												<span>Dark</span>
											</span>
										</div>
										<div class="contrast-strip">
											{#each mergedContrast as check (check.label)}
												<div class="contrast-strip-row" data-passes={check.passes}>
													<span class="contrast-strip-label">{check.label}</span>
													<span
														class="contrast-strip-ratio"
														data-passes={check.light.passes}
														aria-label="Light {check.light.ratioLabel}"
													>
														{check.light.ratioLabel}
													</span>
													<span class="contrast-strip-sep" aria-hidden="true">·</span>
													<span
														class="contrast-strip-ratio"
														data-passes={check.dark.passes}
														aria-label="Dark {check.dark.ratioLabel}"
													>
														{check.dark.ratioLabel}
													</span>
												</div>
											{/each}
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
				</div>
			</footer>
		</div>
	</Container>
</Tabs.Root>

<style>
	.workbench {
		--workbench-bar-h: 3.5rem;
		--workbench-rail-min-h: 5rem;
		--_status-success: var(--dry-color-fill-success, oklch(72% 0.15 150));
		--_status-danger: var(--dry-color-fill-danger, oklch(68% 0.18 25));
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
		background: var(--workbench-bg);
	}

	.bar {
		display: grid;
		grid-template-columns: minmax(0, max-content) minmax(0, 1fr) minmax(0, max-content);
		align-items: center;
		gap: var(--dry-space-3);
		padding-inline: var(--dry-space-4);
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
		letter-spacing: 0;
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
		grid-template-rows: minmax(0, 1fr);
		padding: var(--dry-space-3) var(--dry-space-4) var(--dry-space-2);
		min-height: 0;
	}

	.viewport {
		display: grid;
		min-height: 0;
		padding: var(--dry-space-5) var(--dry-space-4);
		overflow: auto;
	}

	@container (min-width: 64rem) {
		.frame {
			padding: var(--dry-space-3) var(--dry-space-4) var(--dry-space-2);
		}
		.viewport {
			padding: var(--dry-space-6) var(--dry-space-5);
		}
	}

	.rail {
		--rail-h: 3rem;
		--dry-btn-min-height: var(--rail-h);
		--dry-btn-bg: color-mix(in srgb, var(--dry-color-bg-raised) 84%, var(--dry-color-bg-base) 16%);
		--dry-btn-border: color-mix(
			in srgb,
			var(--dry-color-stroke-strong) 72%,
			var(--dry-color-stroke-weak) 28%
		);
		--dry-btn-color: var(--dry-color-text-strong);
		--dry-btn-radius: var(--dry-radius-lg);
		--dry-btn-padding-x: var(--dry-space-3);
		--dry-btn-padding-y: 0;
		--dry-btn-justify: stretch;
		--dry-btn-active-transform: none;
		padding-block: var(--dry-space-3) var(--dry-space-4);
	}

	.rail-inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, max-content);
		align-items: end;
		gap: var(--dry-space-4);
	}

	.rail-modules {
		display: grid;
		grid-template-columns: minmax(13rem, 19rem) minmax(9rem, 12rem) minmax(11rem, 15rem) minmax(
				10rem,
				13rem
			);
		align-items: end;
		gap: var(--dry-space-4);
	}

	.rail-module {
		display: grid;
		grid-template-rows: auto var(--rail-h);
		align-content: end;
		gap: var(--dry-space-1_5);
		justify-items: stretch;
	}

	.rail-label {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1;
		color: var(--dry-color-text-weak);
		letter-spacing: 0;
	}

	.rail-segmented {
		display: grid;
		--dry-option-picker-gap: 2px;
		--dry-option-picker-padding-x: var(--dry-space-1);
		--dry-option-picker-padding-y: 0;
		--dry-option-picker-min-block-size: calc(var(--rail-h) - 4px);
		--dry-option-picker-compact-min-block-size: calc(var(--rail-h) - 4px);
		--dry-option-picker-radius: var(--dry-radius-lg);
		--dry-option-picker-content-align: center;
		--dry-option-picker-bg: color-mix(
			in srgb,
			var(--dry-color-bg-raised) 84%,
			var(--dry-color-bg-base) 16%
		);
		--dry-option-picker-bg-hover: color-mix(
			in srgb,
			var(--dry-color-bg-raised) 72%,
			var(--dry-color-fill-brand) 28%
		);
		--dry-option-picker-border: color-mix(
			in srgb,
			var(--dry-color-stroke-strong) 72%,
			var(--dry-color-stroke-weak) 28%
		);
	}

	.rail-trigger-glyph {
		font-size: 0.875rem;
		font-weight: 650;
		color: var(--dry-color-text-weak);
	}

	.rail-trigger-value {
		justify-self: start;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rail-aux {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: end;
		gap: var(--dry-space-1);
		justify-self: end;
	}

	.rail-aux-icon {
		position: relative;
		display: inline-grid;
		place-items: center;
	}

	.rail-aux-dot {
		position: absolute;
		inset-block-end: -2px;
		inset-inline-end: -3px;
		display: grid;
		grid-template-columns: 6px;
		grid-template-rows: 6px;
		border-radius: 50%;
		background: var(--_status-success);
		box-shadow: 0 0 0 1.5px var(--workbench-bg);
	}

	.rail-aux-dot[data-rail-status='warn'] {
		background: var(--_status-danger);
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

	.rail-accent {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-rows: var(--rail-h);
		align-items: center;
		gap: var(--dry-space-2);
		padding-inline: var(--dry-space-3);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 84%, var(--dry-color-bg-base) 16%);
		border: 1px solid
			color-mix(in srgb, var(--dry-color-stroke-strong) 72%, var(--dry-color-stroke-weak) 28%);
	}

	.rail-accent-track {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
		align-items: center;
		justify-items: center;
		gap: var(--dry-space-1);
	}

	.rail-accent-swatch {
		display: inline-grid;
		grid-template-columns: 1.75rem;
		grid-template-rows: 1.75rem;
		place-items: center;
		isolation: isolate;
		transition: transform var(--dry-duration-fast, 100ms) ease;
	}

	.rail-accent-swatch:hover,
	.rail-accent-swatch:focus-within {
		transform: translateY(-1px);
	}

	.rail-accent-dot {
		display: grid;
		grid-template-columns: 1.25rem;
		grid-template-rows: 1.25rem;
		border-radius: 50%;
		background: var(--_swatch, var(--dry-color-fill-brand));
		box-shadow:
			inset 0 1px 1px color-mix(in srgb, var(--dry-color-text-strong) 18%, transparent 82%),
			0 0 0 0 transparent;
		transition: box-shadow var(--dry-duration-fast, 100ms) ease;
	}

	.rail-accent-swatch:hover .rail-accent-dot,
	.rail-accent-swatch:focus-within .rail-accent-dot {
		box-shadow:
			inset 0 1px 1px color-mix(in srgb, var(--dry-color-text-strong) 18%, transparent 82%),
			0 0 0 2px color-mix(in srgb, var(--dry-color-text-strong) 28%, transparent 72%);
	}

	.rail-accent-swatch[data-selected] .rail-accent-dot {
		box-shadow:
			inset 0 1px 1px color-mix(in srgb, var(--dry-color-text-strong) 18%, transparent 82%),
			0 0 0 2px var(--dry-color-bg-raised),
			0 0 0 4px color-mix(in srgb, var(--dry-color-text-strong) 70%, transparent 30%);
	}

	.rail-accent-shuffle {
		display: inline-grid;
		place-items: center;
		color: var(--dry-color-text-weak);
		opacity: 0.7;
		transition: opacity var(--dry-duration-fast, 100ms) ease;
	}

	.rail-accent-shuffle:hover,
	.rail-accent-shuffle:focus-within {
		opacity: 1;
	}

	.rail-base-segmented {
		--dry-option-picker-padding-x: var(--dry-space-1);
	}

	.rail-base-letter {
		display: inline-grid;
		font-size: 0.875rem;
		font-weight: 650;
		line-height: 1;
		color: inherit;
	}

	.font-panel,
	.shape-panel {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
	}

	.font-panel {
		grid-template-columns: minmax(0, min(39rem, calc(100vw - var(--dry-space-6))));
		grid-template-rows: auto minmax(0, min(27rem, calc(100dvh - 12rem)));
	}

	.shape-panel {
		grid-template-columns: minmax(0, min(22rem, calc(100vw - var(--dry-space-6))));
	}

	.shape-panel-row {
		display: grid;
		gap: var(--dry-space-1_5);
	}

	.shape-radius-picker,
	.shape-density-picker {
		--dry-option-picker-min-block-size: 2.75rem;
		--dry-option-picker-compact-min-block-size: 2.75rem;
	}

	.option-panel-header {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: space-between;
		align-items: center;
		font-size: 1.125rem;
		font-weight: 650;
		line-height: 1.1;
		color: var(--dry-color-text-strong);
		letter-spacing: 0;
	}

	.font-picker {
		overflow: auto;
		--dry-option-picker-gap: var(--dry-space-3);
		--dry-option-picker-padding-y: var(--dry-space-4);
		--dry-option-picker-padding-x: var(--dry-space-3);
		--dry-option-picker-visual-min-block-size: 8.5rem;
		--dry-option-picker-radius: var(--dry-radius-xl);
		--dry-option-picker-content-align: center;
		--dry-option-picker-bg: color-mix(
			in srgb,
			var(--dry-color-bg-base) 50%,
			var(--dry-color-bg-raised) 50%
		);
		--dry-option-picker-bg-hover: color-mix(
			in srgb,
			var(--dry-color-bg-raised) 82%,
			var(--dry-color-fill-brand) 18%
		);
		--dry-option-picker-border: color-mix(
			in srgb,
			var(--dry-color-stroke-weak) 76%,
			transparent 24%
		);
		--dry-option-picker-selected-border: var(--dry-color-text-strong);
		--dry-option-picker-selected-bg: color-mix(
			in srgb,
			var(--dry-color-bg-raised) 82%,
			var(--dry-color-fill-brand) 18%
		);
		--dry-option-picker-label-size: 0.9375rem;
		--dry-option-picker-description-size: 0;
	}

	.font-sample {
		font-family: var(--_preset-font, inherit);
		font-size: 2rem;
		font-weight: 650;
		line-height: 1;
		color: var(--dry-color-text-strong);
	}

	.font-option-name {
		font-family: var(--_preset-font, inherit);
		color: var(--dry-color-text-weak);
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

	.preset-group-label,
	.popover-section-label {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: space-between;
		align-items: baseline;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0;
		line-height: 1;
	}

	.popover-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding-block-end: var(--dry-space-2);
		border-block-end: 1px solid var(--dry-color-stroke-weak);
	}

	.popover-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--dry-color-text-strong);
		letter-spacing: 0;
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
		color: var(--dry-color-on-brand);
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

	.contrast-key {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: 0.4em;
		font-size: 0.625rem;
		letter-spacing: 0;
	}

	.contrast-strip {
		display: grid;
		gap: var(--dry-space-1);
		font-variant-numeric: tabular-nums;
	}

	.contrast-strip-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content max-content max-content;
		align-items: baseline;
		column-gap: var(--dry-space-2);
		padding-block: var(--dry-space-1);
		padding-inline: var(--dry-space-2);
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, var(--dry-color-bg-base) 35%, transparent 65%);
	}

	.contrast-strip-row[data-passes='false'] {
		background: color-mix(in srgb, var(--_status-danger) 14%, transparent 86%);
	}

	.contrast-strip-label {
		font-size: 0.8125rem;
		color: var(--dry-color-text-strong);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.contrast-strip-ratio {
		font-size: 0.75rem;
		color: var(--dry-color-text-strong);
	}

	.contrast-strip-ratio[data-passes='false'] {
		color: var(--_status-danger);
		font-weight: 600;
	}

	.contrast-strip-sep {
		font-size: 0.75rem;
		color: var(--dry-color-text-weak);
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
			padding-block: var(--dry-space-3);
		}

		.rail-inner {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--dry-space-2);
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
