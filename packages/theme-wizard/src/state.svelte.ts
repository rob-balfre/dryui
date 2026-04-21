import { untrack } from 'svelte';
import { generateTheme, type BrandInput, type ThemeTokens } from './engine/derivation.js';
import { PRESETS } from './engine/presets.js';
import type { WizardRecipe } from './engine/url-codec.js';
import type {
	NeutralMode,
	Personality,
	RadiusPreset,
	Density,
	ShadowPreset,
	TypeScale,
	FontPreset
} from './engine/types.js';

export type {
	NeutralMode,
	Personality,
	RadiusPreset,
	Density,
	ShadowPreset,
	TypeScale,
	FontPreset
} from './engine/types.js';

export type PreviewMode = 'light' | 'dark' | 'side-by-side';

function fmtRem(value: number): string {
	return `${parseFloat(value.toFixed(4))}rem`;
}

// ─── Reactive state ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'dryui-theme-wizard';

const DEFAULTS = {
	currentStep: 1,
	personality: 'structured' as Personality,
	brandHsb: { h: 230, s: 65, b: 85 } as BrandInput,
	neutralMode: 'monochromatic' as NeutralMode,
	statusHues: { error: 0, warning: 40, success: 145, info: 210 } as {
		error: number;
		warning: number;
		success: number;
		info: number;
	},
	darkBgOverrides: {} as { base?: string; raised?: string; overlay?: string },
	fastTrack: false,
	typography: {
		fontPreset: 'System' as FontPreset,
		scale: 'default' as TypeScale
	},
	shape: {
		radiusPreset: 'soft' as RadiusPreset,
		radiusScale: 1,
		density: 'default' as Density
	},
	shadows: {
		preset: 'elevated' as ShadowPreset,
		intensity: 1,
		tintBrand: true
	},
	adjust: {
		brightness: 100,
		contrast: 100,
		saturate: 100,
		hueRotate: 0
	}
};

function loadPersistedState(): typeof DEFAULTS {
	if (typeof sessionStorage === 'undefined') return DEFAULTS;
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const saved = JSON.parse(raw);
		return { ...DEFAULTS, ...saved };
	} catch {
		return DEFAULTS;
	}
}

let persistTimer: ReturnType<typeof setTimeout> | undefined;

function persistState(): void {
	if (typeof sessionStorage === 'undefined') return;
	clearTimeout(persistTimer);
	persistTimer = setTimeout(() => {
		untrack(() => {
			try {
				const {
					personality,
					brandHsb,
					neutralMode,
					statusHues,
					darkBgOverrides,
					typography,
					shape,
					shadows,
					adjust
				} = wizardState;
				const tokens = {
					light: getAllTokens('light'),
					dark: getAllTokens('dark')
				};
				sessionStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({
						personality,
						brandHsb,
						neutralMode,
						statusHues,
						darkBgOverrides,
						typography,
						shape,
						shadows,
						adjust,
						tokens
					})
				);
			} catch {
				// storage full or unavailable — ignore
			}
		});
	}, 300);
}

const initial = loadPersistedState();

export const wizardState = $state({
	currentStep: initial.currentStep,
	personality: initial.personality,
	brandHsb: initial.brandHsb,
	neutralMode: initial.neutralMode,
	statusHues: initial.statusHues,
	darkBgOverrides: initial.darkBgOverrides,
	fastTrack: initial.fastTrack,
	typography: initial.typography,
	shape: initial.shape,
	shadows: initial.shadows,
	adjust: initial.adjust
});

// ─── Derived theme ────────────────────────────────────────────────────────────

const derivedTheme: { value: ThemeTokens } = $derived.by(() => {
	return {
		value: generateTheme(wizardState.brandHsb, {
			neutralMode: wizardState.neutralMode,
			statusHues: wizardState.statusHues,
			darkBg: wizardState.darkBgOverrides
		})
	};
});

export function getDerivedTheme(): ThemeTokens {
	return derivedTheme.value;
}

// ─── Exported functions ───────────────────────────────────────────────────────

/** Update the brand color (h: 0-360, s/b: 0-100). */
export function setBrandHsb(h: number, s: number, b: number): void {
	wizardState.brandHsb = { h, s, b };
	persistState();
}

/** Update a single status tone's hue. */
function setStatusHue(tone: 'error' | 'warning' | 'success' | 'info', hue: number): void {
	wizardState.statusHues[tone] = hue;
	persistState();
}

/** Update the neutral palette mode. */
function setNeutralMode(mode: NeutralMode): void {
	wizardState.neutralMode = mode;
	persistState();
}

function resetStyleStateToDefaults(): void {
	wizardState.neutralMode = DEFAULTS.neutralMode;
	wizardState.statusHues = { ...DEFAULTS.statusHues };
	wizardState.darkBgOverrides = { ...DEFAULTS.darkBgOverrides };
	wizardState.typography = { ...DEFAULTS.typography };
	wizardState.shape = { ...DEFAULTS.shape };
	wizardState.shadows = { ...DEFAULTS.shadows };
	wizardState.adjust = { ...DEFAULTS.adjust };
}

/** Set the personality (chrome level) and apply cross-step defaults. */
function applyPersonalityDefaults(p: Personality): void {
	wizardState.personality = p;
	// Cross-step defaults
	const PERSONALITY_SHADOW: Record<Personality, ShadowPreset> = {
		minimal: 'flat',
		clean: 'flat',
		structured: 'elevated',
		rich: 'deep'
	};
	const PERSONALITY_RADIUS: Record<Personality, RadiusPreset> = {
		minimal: 'soft',
		clean: 'soft',
		structured: 'soft',
		rich: 'rounded'
	};
	wizardState.shadows.preset = PERSONALITY_SHADOW[p];
	wizardState.shape.radiusPreset = PERSONALITY_RADIUS[p];
}

/** Set the personality (chrome level) and apply cross-step defaults. */
export function setPersonality(p: Personality): void {
	resetStyleStateToDefaults();
	applyPersonalityDefaults(p);
	persistState();
}

/** Override a dark background level. */
function setDarkBg(level: 'base' | 'raised' | 'overlay', value: string): void {
	wizardState.darkBgOverrides[level] = value;
	persistState();
}

/** Navigate to a specific step (1–5). */
export function setStep(n: number): void {
	wizardState.currentStep = Math.max(1, Math.min(5, n));
}

/** Advance to the next step. */
export function goNextStep(): void {
	setStep(wizardState.currentStep + 1);
}

/** Go back to the previous step. */
export function goPrevStep(): void {
	setStep(wizardState.currentStep - 1);
}

/** Enable fast-track mode and jump to the final step. */
export function activateFastTrack(): void {
	wizardState.fastTrack = true;
	setStep(5);
}

/** Apply a named preset from the PRESETS array. */
export function applyPreset(name: string): void {
	const preset = PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());
	if (!preset) {
		throw new Error(`Unknown preset: "${name}"`);
	}
	wizardState.brandHsb = { ...preset.brandInput };
	persistState();
}

/**
 * Return a CSS custom property string for live preview injection.
 *
 * @param mode - 'light' | 'dark'
 * @returns e.g. `--dry-color-brand: hsl(230, 75%, 60%); ...`
 */
export function getStyleString(mode: 'light' | 'dark'): string {
	return Object.entries(getAllTokens(mode))
		.map(([name, value]) => `${name}: ${value}`)
		.join('; ');
}

/** Update the font preset name. */
export function setFontPreset(preset: FontPreset): void {
	wizardState.typography.fontPreset = preset;
	persistState();
}

/** Update the type scale. */
export function setTypeScale(scale: TypeScale): void {
	wizardState.typography.scale = scale;
	persistState();
}

/** Reset all wizard state to defaults. */
export function resetToDefaults(): void {
	wizardState.currentStep = DEFAULTS.currentStep;
	wizardState.personality = DEFAULTS.personality;
	wizardState.brandHsb = { ...DEFAULTS.brandHsb };
	resetStyleStateToDefaults();
	wizardState.fastTrack = DEFAULTS.fastTrack;
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(STORAGE_KEY);
	}
}

/** Apply a full wizard recipe, using personality defaults before explicit overrides. */
export function applyRecipe(recipe: WizardRecipe): void {
	wizardState.currentStep = DEFAULTS.currentStep;
	wizardState.brandHsb = { ...recipe.brand };
	resetStyleStateToDefaults();
	wizardState.neutralMode = recipe.neutralMode ?? DEFAULTS.neutralMode;
	wizardState.statusHues = { ...DEFAULTS.statusHues, ...recipe.statusHues };
	wizardState.fastTrack = false;
	wizardState.typography = recipe.typography
		? { ...recipe.typography }
		: { ...DEFAULTS.typography };

	applyPersonalityDefaults(recipe.personality ?? DEFAULTS.personality);

	if (recipe.shape) {
		wizardState.shape = { ...recipe.shape };
	}

	if (recipe.shadows) {
		wizardState.shadows = { ...recipe.shadows };
	}

	wizardState.adjust = {
		brightness: recipe.adjust?.brightness ?? DEFAULTS.adjust.brightness,
		contrast: recipe.adjust?.contrast ?? DEFAULTS.adjust.contrast,
		saturate: recipe.adjust?.saturate ?? DEFAULTS.adjust.saturate,
		hueRotate: recipe.adjust?.hueRotate ?? DEFAULTS.adjust.hueRotate
	};

	persistState();
}

// ─── Shape & spacing ─────────────────────────────────────────────────────────

export function setRadiusPreset(preset: RadiusPreset): void {
	wizardState.shape.radiusPreset = preset;
	wizardState.shape.radiusScale = 1;
	persistState();
}

export function setRadiusScale(scale: number): void {
	wizardState.shape.radiusScale = scale;
	persistState();
}

export function setDensity(density: Density): void {
	wizardState.shape.density = density;
	persistState();
}

export const RADIUS_PRESETS: Record<
	RadiusPreset,
	{ sm: number; md: number; lg: number; xl: number; '2xl': number; full: number }
> = {
	sharp: { sm: 0, md: 2, lg: 2, xl: 4, '2xl': 4, full: 9999 },
	soft: { sm: 4, md: 8, lg: 8, xl: 12, '2xl': 16, full: 9999 },
	rounded: { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 },
	pill: { sm: 9999, md: 9999, lg: 16, xl: 20, '2xl': 24, full: 9999 }
};

const DENSITY_FACTORS: Record<Density, number> = {
	compact: 0.85,
	default: 1,
	spacious: 1.15
};

// ─── Shadows & elevation ────────────────────────────────────────────────────

function setShadowPreset(preset: ShadowPreset): void {
	wizardState.shadows.preset = preset;
	persistState();
}

function setShadowIntensity(intensity: number): void {
	wizardState.shadows.intensity = intensity;
	persistState();
}

function setShadowTint(tint: boolean): void {
	wizardState.shadows.tintBrand = tint;
	persistState();
}

type ShadowLayer = { y: number; blur: number; lightA: number; darkA: number };
type ShadowDef = { raised: ShadowLayer[]; overlay: ShadowLayer[] };

const SHADOW_DEFS: Record<ShadowPreset, ShadowDef> = {
	flat: {
		raised: [],
		overlay: []
	},
	subtle: {
		raised: [
			{ y: 1, blur: 3, lightA: 0.06, darkA: 0.5 },
			{ y: 1, blur: 2, lightA: 0.04, darkA: 0.35 }
		],
		overlay: [
			{ y: 4, blur: 16, lightA: 0.1, darkA: 0.6 },
			{ y: 2, blur: 6, lightA: 0.06, darkA: 0.4 }
		]
	},
	elevated: {
		raised: [
			{ y: 2, blur: 6, lightA: 0.1, darkA: 0.65 },
			{ y: 1, blur: 3, lightA: 0.07, darkA: 0.45 }
		],
		overlay: [
			{ y: 8, blur: 28, lightA: 0.14, darkA: 0.7 },
			{ y: 3, blur: 10, lightA: 0.1, darkA: 0.5 }
		]
	},
	deep: {
		raised: [
			{ y: 4, blur: 14, lightA: 0.16, darkA: 0.8 },
			{ y: 2, blur: 5, lightA: 0.1, darkA: 0.55 }
		],
		overlay: [
			{ y: 16, blur: 48, lightA: 0.22, darkA: 0.85 },
			{ y: 6, blur: 18, lightA: 0.14, darkA: 0.6 }
		]
	}
};

function buildShadowValue(
	layers: ShadowLayer[],
	mode: 'light' | 'dark',
	hue: number,
	sat: number,
	lightness: number,
	intensity: number
): string {
	if (layers.length === 0) return 'none';
	return layers
		.map((l) => {
			const a = (mode === 'light' ? l.lightA : l.darkA) * intensity;
			return `0 ${l.y}px ${l.blur}px hsla(${hue}, ${sat}%, ${lightness}%, ${Math.min(a, 1).toFixed(3)})`;
		})
		.join(', ');
}

export function getShadowTokens(
	shadowPreset: ShadowPreset = wizardState.shadows.preset,
	shadowIntensity: number = wizardState.shadows.intensity,
	tintBrand: boolean = wizardState.shadows.tintBrand,
	brandHue: number = wizardState.brandHsb.h
): { light: Record<string, string>; dark: Record<string, string> } {
	const H = Math.round(brandHue);
	const hue = tintBrand ? H : 0;
	const def = SHADOW_DEFS[shadowPreset];

	return {
		light: {
			'--dry-shadow-raised': buildShadowValue(def.raised, 'light', hue, 20, 20, shadowIntensity),
			'--dry-shadow-overlay': buildShadowValue(def.overlay, 'light', hue, 20, 20, shadowIntensity)
		},
		dark: {
			'--dry-shadow-raised': buildShadowValue(def.raised, 'dark', hue, 15, 2, shadowIntensity),
			'--dry-shadow-overlay': buildShadowValue(def.overlay, 'dark', hue, 15, 2, shadowIntensity)
		}
	};
}

const SPACE_SCALE = [
	['0_5', 0.125],
	['1', 0.25],
	['1_5', 0.375],
	['2', 0.5],
	['2_5', 0.625],
	['3', 0.75],
	['3_5', 0.875],
	['4', 1],
	['5', 1.25],
	['6', 1.5],
	['7', 1.75],
	['8', 2],
	['9', 2.25],
	['10', 2.5],
	['11', 2.75],
	['12', 3],
	['14', 3.5],
	['16', 4],
	['20', 5],
	['24', 6],
	['32', 8]
] as const;

export function getShapeTokens(
	radiusPreset: RadiusPreset = wizardState.shape.radiusPreset,
	radiusScale: number = wizardState.shape.radiusScale,
	densityPreset: Density = wizardState.shape.density
): Record<string, string> {
	const preset = RADIUS_PRESETS[radiusPreset];
	const scale = radiusScale;
	const density = DENSITY_FACTORS[densityPreset];

	const tokens: Record<string, string> = {};

	for (const [key, base] of Object.entries(preset)) {
		let px: number;
		if (base >= 9999) {
			px = scale >= 1 ? 9999 : Math.round(24 * scale);
		} else {
			px = Math.round(base * scale);
		}
		tokens[`--dry-radius-${key}`] = `${px}px`;
	}

	for (const [key, rem] of SPACE_SCALE) {
		tokens[`--dry-space-${key}`] = fmtRem(rem * density);
	}

	return tokens;
}

// ─── Personality / chrome ───────────────────────────────────────────────────

const PERSONALITY_TOKENS: Record<Personality, Record<string, string>> = {
	minimal: {
		// Surface role
		'--dry-surface-bg': 'transparent',
		'--dry-surface-border': 'transparent',
		'--dry-surface-shadow': 'none',
		'--dry-surface-radius': '0',
		'--dry-surface-padding': 'var(--dry-space-4)',
		// Chrome role
		'--dry-chrome-bg': 'transparent',
		'--dry-chrome-border': 'transparent',
		'--dry-chrome-shadow': 'none',
		// Overlay role
		'--dry-overlay-bg': 'var(--dry-color-bg-overlay)',
		'--dry-overlay-border': 'var(--dry-color-stroke-weak)',
		'--dry-overlay-shadow': 'var(--dry-shadow-sm)',
		'--dry-overlay-radius': 'var(--dry-radius-lg)',
		// Control role
		'--dry-control-bg': 'transparent',
		'--dry-control-border': 'var(--dry-color-stroke-weak)',
		'--dry-control-radius': 'var(--dry-radius-sm)',
		// Page role
		'--dry-page-bg': 'transparent',
		'--dry-page-border': 'transparent',
		'--dry-page-shadow': 'none',
		'--dry-page-radius': '0'
	},
	clean: {
		// Surface role
		'--dry-surface-bg': 'var(--dry-color-bg-raised)',
		'--dry-surface-border': 'transparent',
		'--dry-surface-shadow': 'none',
		'--dry-surface-radius': 'var(--dry-radius-lg)',
		'--dry-surface-padding': 'var(--dry-space-6)',
		// Chrome role
		'--dry-chrome-bg': 'transparent',
		'--dry-chrome-border': 'var(--dry-color-stroke-weak)',
		'--dry-chrome-shadow': 'none',
		// Overlay role
		'--dry-overlay-bg': 'var(--dry-color-bg-overlay)',
		'--dry-overlay-border': 'var(--dry-color-stroke-weak)',
		'--dry-overlay-shadow': 'var(--dry-shadow-md)',
		'--dry-overlay-radius': 'var(--dry-radius-lg)',
		// Control role
		'--dry-control-bg': 'var(--dry-color-bg-raised)',
		'--dry-control-border': 'var(--dry-color-stroke-strong)',
		'--dry-control-radius': 'var(--dry-radius-md)',
		// Page role
		'--dry-page-bg': 'transparent',
		'--dry-page-border': 'transparent',
		'--dry-page-shadow': 'none',
		'--dry-page-radius': 'var(--dry-radius-lg)'
	},
	structured: {
		// Surface role
		'--dry-surface-bg': 'var(--dry-color-bg-raised)',
		'--dry-surface-border': 'var(--dry-color-stroke-weak)',
		'--dry-surface-shadow': 'var(--dry-shadow-raised)',
		'--dry-surface-radius': 'var(--dry-radius-xl)',
		'--dry-surface-padding': 'var(--dry-space-8)',
		// Chrome role
		'--dry-chrome-bg': 'var(--dry-color-bg-raised)',
		'--dry-chrome-border': 'var(--dry-color-stroke-weak)',
		'--dry-chrome-shadow': 'var(--dry-shadow-sm)',
		// Overlay role
		'--dry-overlay-bg': 'var(--dry-color-bg-overlay)',
		'--dry-overlay-border': 'var(--dry-color-stroke-weak)',
		'--dry-overlay-shadow': 'var(--dry-shadow-lg)',
		'--dry-overlay-radius': 'var(--dry-radius-xl)',
		// Control role
		'--dry-control-bg': 'var(--dry-color-bg-raised)',
		'--dry-control-border': 'var(--dry-color-stroke-strong)',
		'--dry-control-radius': 'var(--dry-radius-md)',
		// Page role
		'--dry-page-bg': 'var(--dry-color-bg-overlay)',
		'--dry-page-border': 'var(--dry-color-stroke-weak)',
		'--dry-page-shadow': 'var(--dry-shadow-sm)',
		'--dry-page-radius': 'var(--dry-radius-xl)'
	},
	rich: {
		// Surface role
		'--dry-surface-bg': 'var(--dry-color-bg-overlay)',
		'--dry-surface-border': 'var(--dry-color-stroke-weak)',
		'--dry-surface-shadow': 'var(--dry-shadow-overlay)',
		'--dry-surface-radius': 'var(--dry-radius-2xl)',
		'--dry-surface-padding': 'var(--dry-space-10)',
		// Chrome role
		'--dry-chrome-bg': 'var(--dry-color-bg-overlay)',
		'--dry-chrome-border': 'var(--dry-color-stroke-weak)',
		'--dry-chrome-shadow': 'var(--dry-shadow-overlay)',
		// Overlay role
		'--dry-overlay-bg': 'var(--dry-color-bg-overlay)',
		'--dry-overlay-border': 'var(--dry-color-stroke-weak)',
		'--dry-overlay-shadow': 'var(--dry-shadow-overlay)',
		'--dry-overlay-radius': 'var(--dry-radius-2xl)',
		// Control role
		'--dry-control-bg': 'var(--dry-color-bg-raised)',
		'--dry-control-border': 'var(--dry-color-stroke-strong)',
		'--dry-control-radius': 'var(--dry-radius-lg)',
		// Page role
		'--dry-page-bg': 'var(--dry-color-bg-raised)',
		'--dry-page-border': 'var(--dry-color-stroke-weak)',
		'--dry-page-shadow': 'var(--dry-shadow-overlay)',
		'--dry-page-radius': 'var(--dry-radius-2xl)'
	}
};

export function getPersonalityTokens(): Record<string, string> {
	return PERSONALITY_TOKENS[wizardState.personality];
}

// ─── Typography tokens ──────────────────────────────────────────────────────

export const FONT_STACKS: Record<FontPreset, string> = {
	System: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
	Humanist: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", sans-serif',
	Geometric: 'Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif',
	Classical: 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif',
	Serif: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
	Mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
};

const TYPE_BASE = {
	display: { size: 3.5, leading: 4 },
	'heading-1': { size: 2.5, leading: 3 },
	'heading-2': { size: 2, leading: 2.5 },
	'heading-3': { size: 1.5, leading: 2 },
	'heading-4': { size: 1.25, leading: 1.75 },
	small: { size: 1, leading: 1.5 },
	tiny: { size: 0.875, leading: 1.25 }
} as const;

const TYPE_SCALE_FACTORS: Record<TypeScale, number> = {
	compact: 0.9,
	default: 1,
	spacious: 1.1
};

function getTypographyTokens(
	fontPreset: FontPreset = wizardState.typography.fontPreset,
	scale: TypeScale = wizardState.typography.scale
): Record<string, string> {
	const factor = TYPE_SCALE_FACTORS[scale];
	const tokens: Record<string, string> = {
		'--dry-font-sans': FONT_STACKS[fontPreset]
	};
	for (const [name, { size, leading }] of Object.entries(TYPE_BASE)) {
		tokens[`--dry-type-${name}-size`] = fmtRem(size * factor);
		tokens[`--dry-type-${name}-leading`] = fmtRem(leading * factor);
	}
	return tokens;
}

/** Return all tokens (color + shape + shadow + personality + typography) merged for a given mode. */
export function getAllTokens(mode: 'light' | 'dark' = 'light'): Record<string, string> {
	const m = mode;
	const theme = derivedTheme.value;
	const colorTokens = m === 'dark' ? theme.dark : theme.light;
	const shapeTokens = getShapeTokens();
	const shadows = getShadowTokens();
	const shadowTokens = shadows[m];
	const personalityTokens = getPersonalityTokens();
	const typographyTokens = getTypographyTokens();
	return {
		...colorTokens,
		...shapeTokens,
		...shadowTokens,
		...personalityTokens,
		...typographyTokens
	};
}

/** Return only tokens that the user has changed from defaults. */
export function getOverrideTokens(mode: 'light' | 'dark' = 'light'): Record<string, string> {
	const all = getAllTokens(mode);
	const m = mode;
	const base = getDefaultAllTokens(m);
	const overrides: Record<string, string> = {};
	for (const k in all) {
		if (all[k] !== base[k]) {
			overrides[k] = all[k]!;
		}
	}
	return overrides;
}

/** getAllTokens computed with DEFAULTS — cached per mode. */
function getDefaultAllTokens(mode: 'light' | 'dark'): Record<string, string> {
	return (defaultAllTokensCache[mode] ??= computeDefaultAllTokens(mode));
}

const defaultAllTokensCache: Partial<Record<'light' | 'dark', Record<string, string>>> = {};

function computeDefaultAllTokens(mode: 'light' | 'dark'): Record<string, string> {
	const theme = generateTheme(DEFAULTS.brandHsb, {
		neutralMode: DEFAULTS.neutralMode,
		statusHues: DEFAULTS.statusHues,
		darkBg: DEFAULTS.darkBgOverrides
	});
	const colorTokens = mode === 'dark' ? theme.dark : theme.light;
	const shapeTokens = getShapeTokens(
		DEFAULTS.shape.radiusPreset,
		DEFAULTS.shape.radiusScale,
		DEFAULTS.shape.density
	);
	const shadowTokens = getShadowTokens(
		DEFAULTS.shadows.preset,
		DEFAULTS.shadows.intensity,
		DEFAULTS.shadows.tintBrand,
		DEFAULTS.brandHsb.h
	)[mode];
	const personalityTokens = PERSONALITY_TOKENS[DEFAULTS.personality];
	const typographyTokens = getTypographyTokens(
		DEFAULTS.typography.fontPreset,
		DEFAULTS.typography.scale
	);

	return {
		...colorTokens,
		...shapeTokens,
		...shadowTokens,
		...personalityTokens,
		...typographyTokens
	};
}
