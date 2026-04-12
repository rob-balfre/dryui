// Engine — pure functions, zero Svelte/rune dependencies. Safe for server-side use.

export {
	hsbToHsl,
	hslToHsb,
	hslToRgb,
	hslToHex,
	hexToHsl,
	cssColorToRgb,
	relativeLuminance,
	contrastRatio,
	meetsContrast,
	luminanceFromHsl,
	contrastBetweenCssColors,
	measureForegroundOnSurface,
	compareForegroundAcrossSurfaces,
	apcaSrgbToY,
	apcaContrast,
	apcaContrastBetweenCssColors,
	meetsApca,
	generateThemeModel,
	generateTheme
} from './derivation.js';

export type {
	HSL,
	HSB,
	BrandInput,
	ThemeOptions,
	ThemeTokens,
	SystemTone,
	ThemeReference,
	ThemeModeLadder,
	TransparentNeutralLadder,
	TransparentBrandLadder,
	TransparentToneLadder,
	TransparentPrimitiveLadders,
	LiteralTransparentNeutralLadder,
	LiteralTransparentToneLadder,
	LiteralTransparentPrimitiveLadders,
	SolidSurfaceSteps,
	SolidSurfaceRoles,
	SolidSurfacePalette,
	SolidPrimitiveLadders,
	InteractiveStateRecipe,
	InteractionStateRecipes,
	BrandCandidateAssessment,
	BrandPolicy,
	ForegroundSurfaceThresholds,
	ForegroundSurfaceAssessment,
	ForegroundSurfaceComparison,
	ThemeAuditCheck,
	ThemeAudit,
	PhotoTemperatureGuidance,
	ThemeModelLayer,
	ThemeModel
} from './derivation.js';

export { generateCss, downloadCss, copyCss, exportJson } from './export-css.js';
export type { GenerateCssOptions } from './export-css.js';

export { encodeTheme, decodeTheme, encodeRecipe, decodeRecipe } from './url-codec.js';
export type { DecodedTheme, WizardRecipe } from './url-codec.js';

export { generatePalette, textToBrand } from './palette.js';
export type { PaletteResult } from './palette.js';

export { PRESETS, RECIPE_PRESETS } from './presets.js';
export type { Preset, RecipePreset } from './presets.js';
