import themeTokensData from './theme-tokens.generated.json';

export interface ThemeTokenRegistryEntry {
	name: string;
	light: string;
	dark: string;
}

export interface ThemeTokenValues {
	light: Record<string, string>;
	dark: Record<string, string>;
}

export const REQUIRED_TOKENS = [
	'--dry-color-text-strong',
	'--dry-color-text-weak',
	'--dry-color-icon',
	'--dry-color-stroke-strong',
	'--dry-color-stroke-weak',
	'--dry-color-fill',
	'--dry-color-fill-hover',
	'--dry-color-fill-active',
	'--dry-color-brand',
	'--dry-color-text-brand',
	'--dry-color-fill-brand',
	'--dry-color-fill-brand-hover',
	'--dry-color-fill-brand-active',
	'--dry-color-fill-brand-weak',
	'--dry-color-stroke-brand',
	'--dry-color-on-brand',
	'--dry-color-focus-ring',
	'--dry-color-bg-base',
	'--dry-color-bg-raised',
	'--dry-color-bg-overlay',
	'--dry-color-text-error',
	'--dry-color-fill-error',
	'--dry-color-fill-error-hover',
	'--dry-color-fill-error-weak',
	'--dry-color-stroke-error',
	'--dry-color-on-error',
	'--dry-color-text-warning',
	'--dry-color-fill-warning',
	'--dry-color-fill-warning-hover',
	'--dry-color-fill-warning-weak',
	'--dry-color-stroke-warning',
	'--dry-color-on-warning',
	'--dry-color-text-success',
	'--dry-color-fill-success',
	'--dry-color-fill-success-hover',
	'--dry-color-fill-success-weak',
	'--dry-color-stroke-success',
	'--dry-color-on-success',
	'--dry-color-text-info',
	'--dry-color-fill-info',
	'--dry-color-fill-info-hover',
	'--dry-color-fill-info-weak',
	'--dry-color-stroke-info',
	'--dry-color-on-info',
	'--dry-shadow-raised',
	'--dry-shadow-overlay',
	'--dry-color-overlay-backdrop',
	'--dry-color-overlay-backdrop-strong'
] as const;

export const SURFACE_TOKENS = [
	'--dry-color-bg-base',
	'--dry-color-bg-raised',
	'--dry-color-bg-overlay'
] as const;

export const COLOR_PAIRINGS = [
	['--dry-color-fill-brand', '--dry-color-on-brand'],
	['--dry-color-fill-error', '--dry-color-on-error'],
	['--dry-color-fill-warning', '--dry-color-on-warning'],
	['--dry-color-fill-success', '--dry-color-on-success'],
	['--dry-color-fill-info', '--dry-color-on-info']
] as const;

export const SIDEBAR_PREVIEW_TOKEN_NAMES = [
	'--dry-color-bg-base',
	'--dry-color-bg-overlay',
	'--dry-color-bg-raised',
	'--dry-color-text-strong',
	'--dry-color-text-weak',
	'--dry-color-text-brand',
	'--dry-color-fill-brand',
	'--dry-color-fill-brand-hover',
	'--dry-color-fill-brand-active',
	'--dry-color-stroke-weak',
	'--dry-color-on-brand',
	'--dry-color-focus-ring'
] as const;

// Theme token values are pre-generated at build time from
// packages/ui/src/themes/{default,dark}.css via generate-theme-tokens.ts.
// Reading CSS at runtime would break the published CLI bundle, which does
// not have @dryui/ui's source themes available in its node_modules tree.
export const THEME_TOKEN_VALUES: ThemeTokenValues = themeTokensData as ThemeTokenValues;

export const THEME_TOKEN_REGISTRY: ThemeTokenRegistryEntry[] = Array.from(
	new Set([...Object.keys(THEME_TOKEN_VALUES.light), ...Object.keys(THEME_TOKEN_VALUES.dark)])
)
	.sort((left, right) => left.localeCompare(right))
	.map((name) => ({
		name,
		light: THEME_TOKEN_VALUES.light[name] ?? '',
		dark: THEME_TOKEN_VALUES.dark[name] ?? THEME_TOKEN_VALUES.light[name] ?? ''
	}));

export function pickThemeTokens(tokenNames: readonly string[]): ThemeTokenValues {
	return {
		light: Object.fromEntries(
			tokenNames.map((name) => [name, THEME_TOKEN_VALUES.light[name] ?? ''])
		),
		dark: Object.fromEntries(tokenNames.map((name) => [name, THEME_TOKEN_VALUES.dark[name] ?? '']))
	};
}
