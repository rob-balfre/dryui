<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Adjust,
		Badge,
		Button,
		ColorPicker,
		Container,
		Heading,
		MegaMenu,
		OptionPicker,
		Slider,
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
		Palette,
		Type,
		Shapes,
		SlidersHorizontal,
		ShieldCheck,
		ShieldAlert
	} from 'lucide-svelte';
	import { isDarkTheme } from '$lib/theme.svelte.js';
	import PreviewComponents from '$lib/theme-wizard/PreviewComponents.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let themeMode = $derived<'light' | 'dark'>(isDarkTheme() ? 'dark' : 'light');
	const tokens = $derived(getAllTokens(themeMode));
	let lastAppliedRecipe: string | null = null;

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
		if (preset) applyRecipe(preset.recipe);
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
	const TYPE_SCALE_OPTIONS = [
		['compact', 'Compact'],
		['default', 'Default'],
		['spacious', 'Spacious']
	] as const;
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
</script>

<svelte:head>
	<title>Theme Wizard — DryUI</title>
</svelte:head>

<div class="wizard-page">
	<Container size="xl">
		<header class="wizard-header">
			<div class="wizard-title">
				<Heading level={1}>Theme Wizard</Heading>
			</div>
			<div class="wizard-description">
				<Text size="lg" color="secondary">Build a custom theme, preview updates live.</Text>
			</div>
		</header>
	</Container>

	<Container size="md">
		<div class="control-bar">
			<div class="wizard-toggle-scope">
				<ThemeToggle />
			</div>
			<div class="menu-area">
				<MegaMenu.Root>
					<MegaMenu.Item>
						<MegaMenu.Trigger
							><Sparkles size={14} aria-hidden="true" /><span class="trigger-label">Preset</span
							></MegaMenu.Trigger
						>
						<MegaMenu.Panel align="center">
							{#each [['Starting points', startingPresets], ['Technical', technicalPresets], ['Editorial', editorialPresets]] as const as [title, group] (title)}
								<MegaMenu.Column {title}>
									<div class="wizard-option-scope wizard-option-list wizard-preset-column">
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
								</MegaMenu.Column>
							{/each}
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger
							><Palette size={14} aria-hidden="true" /><span class="trigger-label">Colour</span
							></MegaMenu.Trigger
						>
						<MegaMenu.Panel align="center" fullWidth>
							<MegaMenu.Column title="Picker">
								<ColorPicker.Root
									bind:value={() => brandHsbToHex(wizardState.brandHsb), setBrandFromHex}
									areaHeight={160}
								>
									<ColorPicker.Area />
									<ColorPicker.HueSlider />
									<ColorPicker.Input format="hex" />
								</ColorPicker.Root>
							</MegaMenu.Column>
							<MegaMenu.Column title="Presets">
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
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger
							><Type size={14} aria-hidden="true" /><span class="trigger-label">Typography</span
							></MegaMenu.Trigger
						>
						<MegaMenu.Panel align="center">
							<MegaMenu.Column title="Font family">
								<div class="wizard-option-scope wizard-option-grid wizard-font-options">
									<OptionPicker.Root
										columns={2}
										bind:value={() => wizardState.typography.fontPreset, setFontPreset}
									>
										{#each Object.keys(FONT_STACKS) as name (name)}
											<OptionPicker.Item value={name} layout="stacked" size="visual">
												<OptionPicker.Preview
													variant="font"
													data-font-thumb={name}
													{@attach cssVar(
														'--_preset-font',
														FONT_STACKS[name as keyof typeof FONT_STACKS]
													)}
												>
													<span class="font-preview-glyph">Ag</span>
												</OptionPicker.Preview>
												<OptionPicker.Label>{name}</OptionPicker.Label>
											</OptionPicker.Item>
										{/each}
									</OptionPicker.Root>
								</div>
							</MegaMenu.Column>
							<MegaMenu.Column title="Type scale">
								<div class="wizard-option-scope wizard-option-list">
									<OptionPicker.Root
										columns={1}
										bind:value={() => wizardState.typography.scale, setTypeScale}
									>
										{#each TYPE_SCALE_OPTIONS as [value, label] (value)}
											<OptionPicker.Item {value} size="compact">
												<OptionPicker.Label>{label}</OptionPicker.Label>
											</OptionPicker.Item>
										{/each}
									</OptionPicker.Root>
								</div>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger
							><Shapes size={14} aria-hidden="true" /><span class="trigger-label">Shape</span
							></MegaMenu.Trigger
						>
						<MegaMenu.Panel align="center">
							<MegaMenu.Column title="Style">
								<div class="wizard-option-scope wizard-option-list">
									<OptionPicker.Root
										columns={1}
										bind:value={() => wizardState.personality, setPersonality}
									>
										{#each PERSONALITY_OPTIONS as opt (opt.value)}
											<OptionPicker.Item value={opt.value} size="compact">
												<OptionPicker.Label>{opt.label}</OptionPicker.Label>
											</OptionPicker.Item>
										{/each}
									</OptionPicker.Root>
								</div>
							</MegaMenu.Column>
							<MegaMenu.Column title="Corners">
								<div class="wizard-option-scope wizard-option-grid wizard-corner-options">
									<OptionPicker.Root
										columns={2}
										bind:value={() => wizardState.shape.radiusPreset, setRadiusPreset}
									>
										{#each RADIUS_OPTIONS as opt (opt.value)}
											<OptionPicker.Item value={opt.value} layout="stacked" size="visual">
												<OptionPicker.Preview variant="shape" data-shape={opt.value} />
												<OptionPicker.Label>{opt.label}</OptionPicker.Label>
											</OptionPicker.Item>
										{/each}
									</OptionPicker.Root>
								</div>
							</MegaMenu.Column>
							<MegaMenu.Column title="Spacing">
								<div class="wizard-option-scope wizard-option-list">
									<OptionPicker.Root
										columns={1}
										bind:value={() => wizardState.shape.density, setDensity}
									>
										{#each DENSITY_OPTIONS as opt (opt.value)}
											<OptionPicker.Item value={opt.value} size="compact">
												<OptionPicker.Label>{opt.label}</OptionPicker.Label>
											</OptionPicker.Item>
										{/each}
									</OptionPicker.Root>
								</div>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger
							><SlidersHorizontal size={14} aria-hidden="true" /><span class="trigger-label"
								>Adjust</span
							></MegaMenu.Trigger
						>
						<MegaMenu.Panel align="center">
							<MegaMenu.Column title="Filters">
								<div class="adjust-controls">
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
										<Text size="sm">Hue shift</Text>
										<Slider
											bind:value={wizardState.adjust.hueRotate}
											min={-180}
											max={180}
											size="sm"
										/>
										<Text size="xs" color="muted">{wizardState.adjust.hueRotate}°</Text>
									</div>
									{#if hasAdjustments}
										<div class="wizard-action-scope">
											<Button variant="secondary" size="sm" onclick={resetAdjust}>
												Reset filters
											</Button>
										</div>
									{/if}
								</div>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger>
							{#if allContrastPass}<ShieldCheck size={14} aria-hidden="true" />{:else}<ShieldAlert
									size={14}
									aria-hidden="true"
								/>{/if}<span class="trigger-label">Contrast</span>
						</MegaMenu.Trigger>
						<MegaMenu.Panel align="center">
							<MegaMenu.Column title="Light mode">
								{#each lightContrast as check (check.label)}
									<div class="contrast-result">
										<div class="contrast-result-icon">
											<Badge variant="soft" color={check.passes ? 'success' : 'danger'} size="sm">
												{check.ratioLabel}
												{check.passes ? '\u2713' : '\u2717'}
											</Badge>
										</div>
										<div class="contrast-result-content">
											<div class="contrast-result-label">{check.label}</div>
										</div>
									</div>
								{/each}
							</MegaMenu.Column>
							<MegaMenu.Column title="Dark mode">
								{#each darkContrast as check (check.label)}
									<div class="contrast-result">
										<div class="contrast-result-icon">
											<Badge variant="soft" color={check.passes ? 'success' : 'danger'} size="sm">
												{check.ratioLabel}
												{check.passes ? '\u2713' : '\u2717'}
											</Badge>
										</div>
										<div class="contrast-result-content">
											<div class="contrast-result-label">{check.label}</div>
										</div>
									</div>
								{/each}
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>
				</MegaMenu.Root>
			</div>
		</div>

		<div class="bar-actions below-bar-actions">
			<div class="wizard-action-scope">
				<Button
					variant="secondary"
					size="sm"
					onclick={() => {
						resetToDefaults();
						resetAdjust();
					}}>Reset</Button
				>
			</div>
			<div class="wizard-action-scope wizard-action-scope-primary">
				<Button variant="solid" size="sm" onclick={handleDownload}>Download CSS</Button>
			</div>
			<div class="wizard-action-scope">
				<Button variant="secondary" size="sm" onclick={handleCopyCss}>
					{copyFeedback || 'Copy CSS'}
				</Button>
			</div>
		</div>
	</Container>

	<Adjust
		brightness={wizardState.adjust.brightness}
		contrast={wizardState.adjust.contrast}
		saturate={wizardState.adjust.saturate}
		hueRotate={wizardState.adjust.hueRotate}
	>
		<section class="preview-band">
			<Container size="xl">
				<TokenScope {tokens}>
					<div class="preview-scene" data-mode={themeMode}>
						<PreviewComponents />
					</div>
				</TokenScope>
			</Container>
		</section>
	</Adjust>
</div>

<style>
	.wizard-page {
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
		container-type: inline-size;
		gap: var(--dry-space-6);
		padding-block: var(--dry-space-4) var(--dry-space-10);
	}

	.wizard-header {
		display: grid;
		justify-items: center;
		gap: var(--dry-space-2);
		text-align: center;
	}

	.wizard-title {
		font-size: clamp(2rem, 4vw, 2.75rem);
		letter-spacing: -0.03em;
	}

	.wizard-description {
		display: grid;
		grid-template-columns: minmax(0, 64ch);
		line-height: 1.7;
	}

	.control-bar {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-items: center;
		align-items: center;
		justify-self: stretch;
		gap: var(--dry-space-1);
		padding-inline: var(--dry-space-2);
		padding-block: var(--dry-space-2);
		border: 1px solid
			color-mix(in srgb, var(--dry-color-stroke-weak) 76%, var(--dry-color-fill-brand) 24%);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 94%, var(--dry-color-fill-brand) 6%);
	}

	.below-bar-actions {
		justify-self: stretch;
		padding-top: var(--dry-space-3);
	}

	.menu-area {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-self: stretch;
		justify-items: center;
		--dry-mega-menu-panel-bg: color-mix(
			in srgb,
			var(--dry-color-bg-raised) 94%,
			var(--dry-color-fill-brand) 6%
		);
		--dry-color-fill-brand: var(--wizard-accent-bg);
		--dry-color-fill-brand-hover: var(--wizard-accent-bg-hover);
		--dry-color-fill-brand-active: var(--wizard-accent-bg-active);
		--dry-color-on-brand: var(--wizard-accent-fg);
		--dry-color-text-brand: var(--wizard-accent-fg);
		--dry-color-stroke-selected: var(--wizard-accent-border);
		--dry-btn-trigger-open-bg: var(--wizard-accent-weak);
		--dry-btn-trigger-open-color: var(--wizard-accent-fg);
		--dry-btn-trigger-open-border: var(--wizard-accent-border);
	}

	.trigger-label {
		position: absolute;
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
		block-size: 1px;
		padding: 0;
		margin: -1px;
	}

	.bar-actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
		align-items: center;
		gap: var(--dry-space-2);
	}

	@container (min-width: 22rem) {
		.control-bar {
			grid-auto-flow: column;
			grid-template-columns: max-content minmax(0, 1fr);
			justify-self: center;
			align-items: center;
			gap: var(--dry-space-3);
			padding-block: var(--dry-space-1);
		}

		.menu-area {
			justify-self: start;
			justify-items: start;
		}
	}

	@container (min-width: 52rem) {
		.control-bar {
			grid-template-columns: none;
			grid-auto-columns: max-content;
		}

		.menu-area {
			justify-self: start;
			justify-items: start;
		}

		.trigger-label {
			position: static;
			clip-path: none;
			overflow: visible;
			white-space: normal;
			block-size: auto;
			margin: 0;
		}

		.bar-actions {
			grid-template-columns: none;
			grid-auto-flow: column;
			grid-auto-columns: max-content;
		}

		.below-bar-actions {
			justify-self: center;
		}
	}

	.wizard-action-scope {
		display: grid;
		--dry-btn-accent: var(--wizard-accent-bg);
		--dry-btn-accent-hover: var(--wizard-accent-bg-hover);
		--dry-btn-accent-active: var(--wizard-accent-bg-active);
		--dry-btn-accent-stroke: var(--wizard-accent-border);
		--dry-btn-accent-fg: var(--wizard-accent-fg);
		--dry-btn-accent-weak: var(--wizard-accent-weak);
		--dry-btn-on-accent: var(--wizard-accent-fg);
	}

	.wizard-toggle-scope {
		display: grid;
		--dry-toggle-selected-bg: var(--wizard-accent-bg);
		--dry-toggle-selected-stroke: var(--wizard-accent-border);
		--dry-color-text-brand: var(--wizard-accent-fg);
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
			var(--wizard-accent-bg) 12%,
			var(--dry-color-bg-raised) 88%
		);
		--dry-option-picker-selected-bg-hover: color-mix(
			in srgb,
			var(--wizard-accent-bg) 16%,
			var(--dry-color-bg-raised) 84%
		);
		--dry-option-picker-selected-border: color-mix(
			in srgb,
			var(--wizard-accent-border) 84%,
			var(--dry-color-stroke-weak) 16%
		);
	}

	.wizard-option-grid {
		--dry-option-picker-gap: var(--dry-space-2_5);
	}

	.wizard-option-list {
		--dry-option-picker-gap: var(--dry-space-2);
	}

	.wizard-font-options,
	.wizard-corner-options {
		--dry-option-picker-gap: var(--dry-space-2);
		--dry-option-picker-visual-min-block-size: 5rem;
	}

	.wizard-preset-column {
		grid-template-columns: minmax(13.25rem, 14.75rem);
		--dry-option-picker-gap: var(--dry-space-1_5, var(--dry-space-2));
		--dry-option-picker-item-gap: var(--dry-space-2_5, var(--dry-space-3));
		--dry-option-picker-item-column-gap: var(--dry-space-2_5, var(--dry-space-3));
		--dry-option-picker-item-row-gap: var(--dry-space-1, 0.25rem);
		--dry-option-picker-padding-y: var(--dry-space-2_5, 0.625rem);
		--dry-option-picker-padding-x: var(--dry-space-3, 0.75rem);
		--dry-option-picker-content-align: start;
		--dry-option-picker-compact-min-block-size: 7.5rem;
		--dry-option-picker-preview-align-self: start;
		--dry-option-picker-preview-offset-block-start: 0.125rem;
		--dry-option-picker-preview-preset-size: 2.5rem;
		--dry-option-picker-label-size: 0.9375rem;
		--dry-option-picker-label-line-height: 1.1;
		--dry-option-picker-description-size: 0.875rem;
		--dry-option-picker-description-line-height: 1.3;
	}

	.preset-option-label {
		align-self: start;
	}

	.preset-option-description {
		display: -webkit-box;
		min-block-size: calc(2 * 1.3em);
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		text-wrap: auto;
	}

	/* ─── Preset items ────────────────────────────────────────────────────── */

	.preset-thumb-text {
		font-family: var(--_preset-font, inherit);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	/* ─── Font samples ───────────────────────────────────────────────────── */

	.font-preview-glyph {
		font-family: var(--_preset-font, inherit);
		font-size: 1.75rem;
		line-height: 1;
		color: var(--dry-color-text-strong);
	}

	/* ─── Corner toggle ──────────────────────────────────────────────────── */

	/* ─── Adjust controls ────────────────────────────────────────────────── */

	.adjust-controls {
		display: grid;
		gap: var(--dry-space-4);
	}

	.adjust-row {
		display: grid;
		grid-template-columns: 5rem minmax(8rem, 1fr) 2.5rem;
		align-items: center;
		gap: var(--dry-space-3);
	}

	/* ─── Color presets grid ──────────────────────────────────────────────── */

	.wizard-color-options {
		--dry-option-picker-gap: var(--dry-space-1_5, var(--dry-space-2));
		--dry-option-picker-padding-x: var(--dry-space-0_5);
		--dry-option-picker-padding-y: var(--dry-space-0_5);
		--dry-option-picker-min-block-size: 0;
		--dry-option-picker-radius: var(--dry-radius-full, 9999px);
		--dry-option-picker-preview-size: 1.75rem;
		--dry-option-picker-preview-radius: 9999px;
	}

	.contrast-result {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: start;
		gap: var(--dry-space-3, 0.75rem);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md, 0.375rem);
	}

	.contrast-result-content {
		display: grid;
		gap: var(--dry-space-0_5, 0.125rem);
	}

	.contrast-result-label {
		font-size: var(--dry-type-ui-control-size, var(--dry-text-sm-size, 0.875rem));
		font-weight: 500;
		color: var(--dry-color-text-strong, #1a1a2e);
	}

	/* ─── Preview scene ───────────────────────────────────────────────────── */

	.preview-band {
		display: grid;
		padding-block: var(--dry-space-3) var(--dry-space-8);
		background: color-mix(in srgb, var(--dry-color-bg-base) 95%, var(--dry-color-fill-brand) 5%);
	}

	.preview-scene {
		display: grid;
		padding: var(--dry-space-4) 0;
		color: var(--dry-color-text-strong);
	}
</style>
