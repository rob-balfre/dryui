<script lang="ts">
	import {
		Adjust,
		Badge,
		Button,
		ColorPicker,
		Container,
		MegaMenu,
		Slider,
		Text,
		ToggleGroup,
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
		bg
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
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';

	let themeMode = $derived<'light' | 'dark'>(isDarkTheme() ? 'dark' : 'light');
	const tokens = $derived(getAllTokens(themeMode));

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

	function syncSingleToggleSelection<T extends string>(
		selection: string[],
		current: T,
		apply: (value: T) => void
	) {
		const next = selection[0];
		if (next && next !== current) {
			apply(next as T);
		}
	}

	function attachPresetVars(color: string, font: string) {
		return (node: HTMLElement) => {
			node.style.setProperty('--_preset-color', color);
			node.style.setProperty('--_preset-font', font);
			return () => {
				node.style.removeProperty('--_preset-color');
				node.style.removeProperty('--_preset-font');
			};
		};
	}

	function attachThemeTokens(tokens: Record<string, string>) {
		return (node: HTMLElement) => {
			for (const [name, value] of Object.entries(tokens)) {
				node.style.setProperty(name, value);
			}
			return () => {
				for (const name of Object.keys(tokens)) {
					node.style.removeProperty(name);
				}
			};
		};
	}

	let adjustBrightness = $state(100);
	let adjustContrast = $state(100);
	let adjustSaturate = $state(100);
	let adjustHueRotate = $state(0);

	function resetAdjust() {
		adjustBrightness = 100;
		adjustContrast = 100;
		adjustSaturate = 100;
		adjustHueRotate = 0;
	}

	let hasAdjustments = $derived(
		adjustBrightness !== 100 ||
			adjustContrast !== 100 ||
			adjustSaturate !== 100 ||
			adjustHueRotate !== 0
	);

	interface ContrastCheck {
		label: string;
		fgToken: string;
		threshold: number;
	}

	const CONTRAST_CHECKS: ContrastCheck[] = [
		{ label: 'Text', fgToken: '--dry-color-text-strong', threshold: 4.5 },
		{ label: 'UI', fgToken: '--dry-color-stroke-strong', threshold: 3 },
		{ label: 'Brand', fgToken: '--dry-color-fill-brand', threshold: 3 }
	];

	const BG_TOKEN = '--dry-color-bg-base';

	function getContrastResults(mode: 'light' | 'dark') {
		const t = getAllTokens(mode);
		const bg = t[BG_TOKEN] ?? '';
		return CONTRAST_CHECKS.map((check) => {
			const fg = t[check.fgToken] ?? '';
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
		['Dashboard', 'Terminal', 'Ember'].includes(p.name)
	);
	const editorialPresets = RECIPE_PRESETS.filter((p) => ['Editorial', 'Playful'].includes(p.name));
</script>

<svelte:head>
	<title>Theme Wizard — DryUI</title>
</svelte:head>

<Container size="xl">
	<div class="wizard-page">
		<DocsPageHeader
			title="Theme Wizard"
			description="Build a custom theme, preview updates live."
		/>

		<div class="control-bar">
			<div class="menu-area">
				<MegaMenu.Root>
					<MegaMenu.Item>
						<MegaMenu.Trigger><Sparkles size={14} aria-hidden="true" /> Preset</MegaMenu.Trigger>
						<MegaMenu.Panel>
							<MegaMenu.Column title="Starting points">
								{#each startingPresets as preset (preset.name)}
									{@const hex = brandHsbToHex(preset.recipe.brand)}
									{@const font = FONT_STACKS[preset.recipe.typography?.fontPreset ?? 'System']}
									<MegaMenu.Link
										onclick={() => applyRecipe(preset.recipe)}
										{@attach attachPresetVars(hex, font)}
									>
										{#snippet icon()}<span
												class="preset-thumb"
												use:bg={hex}
												data-shape={preset.recipe.shape?.radiusPreset ?? 'soft'}
												><span class="preset-thumb-text">Ag</span></span
											>{/snippet}
										{#snippet description()}{preset.description}{/snippet}
										{preset.name}
									</MegaMenu.Link>
								{/each}
							</MegaMenu.Column>
							<MegaMenu.Column title="Technical">
								{#each technicalPresets as preset (preset.name)}
									{@const hex = brandHsbToHex(preset.recipe.brand)}
									{@const font = FONT_STACKS[preset.recipe.typography?.fontPreset ?? 'System']}
									<MegaMenu.Link
										onclick={() => applyRecipe(preset.recipe)}
										{@attach attachPresetVars(hex, font)}
									>
										{#snippet icon()}<span
												class="preset-thumb"
												use:bg={hex}
												data-shape={preset.recipe.shape?.radiusPreset ?? 'soft'}
												><span class="preset-thumb-text">Ag</span></span
											>{/snippet}
										{#snippet description()}{preset.description}{/snippet}
										{preset.name}
									</MegaMenu.Link>
								{/each}
							</MegaMenu.Column>
							<MegaMenu.Column title="Editorial">
								{#each editorialPresets as preset (preset.name)}
									{@const hex = brandHsbToHex(preset.recipe.brand)}
									{@const font = FONT_STACKS[preset.recipe.typography?.fontPreset ?? 'System']}
									<MegaMenu.Link
										onclick={() => applyRecipe(preset.recipe)}
										{@attach attachPresetVars(hex, font)}
									>
										{#snippet icon()}<span
												class="preset-thumb"
												use:bg={hex}
												data-shape={preset.recipe.shape?.radiusPreset ?? 'soft'}
												><span class="preset-thumb-text">Ag</span></span
											>{/snippet}
										{#snippet description()}{preset.description}{/snippet}
										{preset.name}
									</MegaMenu.Link>
								{/each}
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger><Palette size={14} aria-hidden="true" /> Colour</MegaMenu.Trigger>
						<MegaMenu.Panel fullWidth>
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
								<div class="color-presets-grid">
									{#each PRESETS as preset (preset.name)}
										<Button
											variant="ghost"
											size="sm"
											title={preset.name}
											onclick={() =>
												setBrandHsb(preset.brandInput.h, preset.brandInput.s, preset.brandInput.b)}
										>
											<span class="color-swatch-dot" use:bg={brandHsbToHex(preset.brandInput)}
											></span>
											<VisuallyHidden>{preset.name}</VisuallyHidden>
										</Button>
									{/each}
								</div>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger><Type size={14} aria-hidden="true" /> Typography</MegaMenu.Trigger>
						<MegaMenu.Panel>
							<MegaMenu.Column title="Font family">
								<ToggleGroup.Root
									type="single"
									size="sm"
									bind:value={
										() => [wizardState.typography.fontPreset],
										(selection) =>
											syncSingleToggleSelection(
												selection,
												wizardState.typography.fontPreset,
												setFontPreset
											)
									}
									orientation="horizontal"
								>
									{#each Object.entries(FONT_STACKS) as [name, stack] (name)}
										<ToggleGroup.Item value={name}>
											<span class="font-sample" {@attach attachPresetVars('', stack)}>
												<span class="font-sample-glyph">Ag</span>
												<span class="font-sample-name">{name}</span>
											</span>
										</ToggleGroup.Item>
									{/each}
								</ToggleGroup.Root>
							</MegaMenu.Column>
							<MegaMenu.Column title="Type scale">
								<ToggleGroup.Root
									type="single"
									size="sm"
									bind:value={
										() => [wizardState.typography.scale],
										(selection) =>
											syncSingleToggleSelection(
												selection,
												wizardState.typography.scale,
												setTypeScale
											)
									}
									orientation="vertical"
								>
									{#each [['compact', 'Compact'], ['default', 'Default'], ['spacious', 'Spacious']] as const as [val, label] (val)}
										<ToggleGroup.Item value={val}>
											{label}
										</ToggleGroup.Item>
									{/each}
								</ToggleGroup.Root>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger><Shapes size={14} aria-hidden="true" /> Shape</MegaMenu.Trigger>
						<MegaMenu.Panel>
							<MegaMenu.Column title="Style">
								<ToggleGroup.Root
									type="single"
									size="sm"
									bind:value={
										() => [wizardState.personality],
										(selection) =>
											syncSingleToggleSelection(selection, wizardState.personality, setPersonality)
									}
									orientation="vertical"
								>
									{#each [{ value: 'minimal', label: 'Minimal' }, { value: 'clean', label: 'Clean' }, { value: 'structured', label: 'Structured' }, { value: 'rich', label: 'Rich' }] as opt (opt.value)}
										<ToggleGroup.Item value={opt.value}>
											{opt.label}
										</ToggleGroup.Item>
									{/each}
								</ToggleGroup.Root>
							</MegaMenu.Column>
							<MegaMenu.Column title="Corners">
								<ToggleGroup.Root
									type="single"
									size="sm"
									bind:value={
										() => [wizardState.shape.radiusPreset],
										(selection) =>
											syncSingleToggleSelection(
												selection,
												wizardState.shape.radiusPreset,
												setRadiusPreset
											)
									}
									orientation="horizontal"
								>
									{#each [{ value: 'sharp', label: 'Sharp' }, { value: 'soft', label: 'Soft' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }] as opt (opt.value)}
										<ToggleGroup.Item value={opt.value}>
											<span class="corner-toggle">
												<span class="corner-hint" data-shape={opt.value}></span>
												<span class="corner-label">{opt.label}</span>
											</span>
										</ToggleGroup.Item>
									{/each}
								</ToggleGroup.Root>
							</MegaMenu.Column>
							<MegaMenu.Column title="Spacing">
								<ToggleGroup.Root
									type="single"
									size="sm"
									bind:value={
										() => [wizardState.shape.density],
										(selection) =>
											syncSingleToggleSelection(selection, wizardState.shape.density, setDensity)
									}
									orientation="vertical"
								>
									{#each [{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'spacious', label: 'Spacious' }] as opt (opt.value)}
										<ToggleGroup.Item value={opt.value}>
											{opt.label}
										</ToggleGroup.Item>
									{/each}
								</ToggleGroup.Root>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger
							><SlidersHorizontal size={14} aria-hidden="true" /> Adjust</MegaMenu.Trigger
						>
						<MegaMenu.Panel>
							<MegaMenu.Column title="Filters">
								<div class="adjust-controls">
									<div class="adjust-row">
										<Text size="sm">Brightness</Text>
										<Slider bind:value={adjustBrightness} min={50} max={150} size="sm" />
										<Text size="xs" color="muted">{adjustBrightness}%</Text>
									</div>
									<div class="adjust-row">
										<Text size="sm">Contrast</Text>
										<Slider bind:value={adjustContrast} min={50} max={150} size="sm" />
										<Text size="xs" color="muted">{adjustContrast}%</Text>
									</div>
									<div class="adjust-row">
										<Text size="sm">Saturation</Text>
										<Slider bind:value={adjustSaturate} min={0} max={200} size="sm" />
										<Text size="xs" color="muted">{adjustSaturate}%</Text>
									</div>
									<div class="adjust-row">
										<Text size="sm">Hue shift</Text>
										<Slider bind:value={adjustHueRotate} min={-180} max={180} size="sm" />
										<Text size="xs" color="muted">{adjustHueRotate}°</Text>
									</div>
									{#if hasAdjustments}
										<Button variant="ghost" size="sm" onclick={resetAdjust}>Reset filters</Button>
									{/if}
								</div>
							</MegaMenu.Column>
						</MegaMenu.Panel>
					</MegaMenu.Item>

					<MegaMenu.Item>
						<MegaMenu.Trigger>
							{#if allContrastPass}
								<ShieldCheck size={14} aria-hidden="true" />
							{:else}
								<ShieldAlert size={14} aria-hidden="true" />
							{/if}
							Contrast
						</MegaMenu.Trigger>
						<MegaMenu.Panel>
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

			<div class="bar-actions">
				<Button
					variant="ghost"
					size="sm"
					onclick={() => {
						resetToDefaults();
						resetAdjust();
					}}>Reset</Button
				>
				<Button variant="solid" size="sm" onclick={handleDownload}>Download CSS</Button>
				<Button variant="outline" size="sm" onclick={handleCopyCss}>
					{copyFeedback || 'Copy CSS'}
				</Button>
			</div>
		</div>

		<Adjust
			brightness={adjustBrightness}
			contrast={adjustContrast}
			saturate={adjustSaturate}
			hueRotate={adjustHueRotate}
		>
			<div class="preview-scene" data-mode={themeMode} {@attach attachThemeTokens(tokens)}>
				<PreviewComponents />
			</div>
		</Adjust>
	</div>
</Container>

<style>
	.wizard-page {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-6);
		padding-bottom: var(--dry-space-10);
	}

	.control-bar {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-raised);
	}

	.menu-area {
		display: grid;
	}

	.bar-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	/* ─── Preset items ────────────────────────────────────────────────────── */

	.preset-thumb {
		display: grid;
		place-items: center;
		block-size: 2.5rem;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-sm);
		transition: border-radius var(--dry-duration-fast, 100ms) ease;
	}

	.preset-thumb[data-shape='sharp'] {
		border-radius: 2px;
	}

	.preset-thumb[data-shape='soft'] {
		border-radius: 6px;
	}

	.preset-thumb[data-shape='rounded'] {
		border-radius: 10px;
	}

	.preset-thumb[data-shape='pill'] {
		border-radius: 9999px;
	}

	.preset-thumb-text {
		font-family: var(--_preset-font, inherit);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	/* ─── Font samples ───────────────────────────────────────────────────── */

	.font-sample {
		display: grid;
		gap: var(--dry-space-1);
		text-align: center;
	}

	.font-sample-glyph {
		font-family: var(--_preset-font, inherit);
		font-size: 1.75rem;
		line-height: 1;
		color: var(--dry-color-text-strong);
	}

	.font-sample-name {
		font-size: var(--dry-text-xs-size, 0.75rem);
		color: var(--dry-color-text-weak);
	}

	/* ─── Corner toggle ──────────────────────────────────────────────────── */

	.corner-toggle {
		display: grid;
		gap: var(--dry-space-1);
		justify-items: center;
		text-align: center;
	}

	.corner-hint {
		display: block;
		block-size: 2rem;
		aspect-ratio: 1;
		border: 2px solid var(--dry-color-stroke-strong);
		background: var(--dry-color-bg-base);
		transition: border-radius var(--dry-duration-fast, 100ms) ease;
	}

	.corner-hint[data-shape='sharp'] {
		border-radius: 2px;
	}

	.corner-hint[data-shape='soft'] {
		border-radius: 8px;
	}

	.corner-hint[data-shape='rounded'] {
		border-radius: 16px;
	}

	.corner-hint[data-shape='pill'] {
		border-radius: 9999px;
	}

	.corner-label {
		font-size: var(--dry-text-xs-size, 0.75rem);
		color: var(--dry-color-text-weak);
	}

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

	.color-presets-grid {
		display: grid;
		grid-template-columns: repeat(4, max-content);
		gap: var(--dry-space-2);
	}

	.color-swatch-dot {
		display: block;
		block-size: 1.5rem;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full, 9999px);
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

	.preview-scene {
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-lg);
		border: 1px solid var(--dry-color-stroke-weak);
		background: var(--dry-color-bg-base);
		color: var(--dry-color-text-strong);
	}

	/* ─── Responsive ──────────────────────────────────────────────────────── */

	@container (max-width: 56rem) {
		.control-bar {
			grid-template-columns: 1fr;
		}

		.bar-actions {
			justify-content: start;
		}
	}
</style>
