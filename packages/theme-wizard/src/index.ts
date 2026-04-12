// Re-export all engine functions and types
export * from './engine/index.js';

// Re-export actions
export { bg } from './actions.js';

// Re-export state (Svelte 5 runes)
export {
	wizardState,
	getDerivedTheme,
	setBrandHsb,
	setStep,
	goNextStep,
	goPrevStep,
	activateFastTrack,
	applyPreset,
	getStyleString,
	setFontPreset,
	setTypeScale,
	resetToDefaults,
	applyRecipe,
	setRadiusPreset,
	setRadiusScale,
	setDensity,
	getShadowTokens,
	getShapeTokens,
	setPersonality,
	getPersonalityTokens,
	getAllTokens,
	getOverrideTokens,
	RADIUS_PRESETS,
	FONT_STACKS
} from './state.svelte.js';

export type {
	PreviewMode,
	NeutralMode,
	RadiusPreset,
	Density,
	ShadowPreset,
	Personality,
	TypeScale,
	FontPreset
} from './state.svelte.js';

// Step components
export { default as PersonalityStep } from './steps/Personality.svelte';
export { default as BrandColor } from './steps/BrandColor.svelte';
export { default as Typography } from './steps/Typography.svelte';
export { default as Shape } from './steps/Shape.svelte';
export { default as PreviewExport } from './steps/PreviewExport.svelte';

// UI components
export { default as WizardShell } from './components/WizardShell.svelte';
export { default as HsbPicker } from './components/HsbPicker.svelte';
export { default as ContrastBadge } from './components/ContrastBadge.svelte';
export { default as AlphaSlider } from './components/AlphaSlider.svelte';
export { default as StepIndicator } from './components/StepIndicator.svelte';
export { default as TokenPreview } from './components/TokenPreview.svelte';
