import {
	apcaContrastBetweenCssColors,
	contrastBetweenCssColors,
	cssColorToRgb,
	meetsApca,
	type ThemeTokens
} from '@dryui/theme-wizard';
import { SIDEBAR_PREVIEW_TOKEN_NAMES } from '../../../../../packages/mcp/src/theme-tokens.js';

export type SidebarRecipeId = 'current' | 'candidate';
export type SidebarContractVariant = 'preview' | 'production';
export type ThemeMode = 'light' | 'dark';

type TokenMap = ThemeTokens[ThemeMode];
export type SidebarNonColorCue = 'weight' | 'indicator';

interface SidebarChecks {
	textOnActive: number;
	textOnActiveApca: number;
	activeVsSurface: number;
	hasReadableText: boolean;
	hasReadableApcaText: boolean;
	hasReadableSurfaceCue: boolean;
	hasReadableAccentCue: boolean;
	hasNonColorCue: boolean;
	cueTypes: SidebarNonColorCue[];
}

export interface SidebarContract {
	mode: ThemeMode;
	recipe: SidebarRecipeId;
	surface: string;
	activeBg: string;
	activeFg: string;
	activeWeight: number;
	activeIndicatorWidth: number;
	activeIndicatorColor: string;
	customProperties: Record<string, string>;
	checks: SidebarChecks;
	passesContract: boolean;
}

function requireToken(tokens: TokenMap, name: string): string {
	const value = tokens[name];

	if (!value) {
		throw new Error(`Missing semantic token ${name}`);
	}

	return value;
}

function rgbToHslString(r: number, g: number, b: number): string {
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;

	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const delta = max - min;
	const lightness = (max + min) / 2;

	let hue = 0;
	let saturation = 0;

	if (delta !== 0) {
		saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

		switch (max) {
			case red:
				hue = (green - blue) / delta + (green < blue ? 6 : 0);
				break;
			case green:
				hue = (blue - red) / delta + 2;
				break;
			default:
				hue = (red - green) / delta + 4;
				break;
		}

		hue *= 60;
	}

	return `hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
}

function mixOver(base: string, accent: string, amount: number): string {
	const baseRgb = cssColorToRgb(base);
	const accentRgb = cssColorToRgb(accent);

	if (!baseRgb || !accentRgb) {
		return base;
	}

	const mixedR = Math.round(accentRgb[0] * amount + baseRgb[0] * (1 - amount));
	const mixedG = Math.round(accentRgb[1] * amount + baseRgb[1] * (1 - amount));
	const mixedB = Math.round(accentRgb[2] * amount + baseRgb[2] * (1 - amount));

	return rgbToHslString(mixedR, mixedG, mixedB);
}

export function contrastBetween(first: string, second: string): number {
	return contrastBetweenCssColors(first, second) ?? 1;
}

function buildPreviewProperties(
	tokens: TokenMap,
	componentProperties: Record<string, string>,
	mode: ThemeMode,
	variant: SidebarContractVariant
): Record<string, string> {
	const properties: Record<string, string> = {};

	for (const tokenName of SIDEBAR_PREVIEW_TOKEN_NAMES) {
		properties[tokenName] = requireToken(tokens, tokenName);
	}

	properties['--dry-sidebar-shadow'] =
		variant === 'preview'
			? 'none'
			: mode === 'dark'
				? 'var(--dry-shadow-md)'
				: 'var(--dry-shadow-sm)';

	return { ...properties, ...componentProperties };
}

function getCueTypes(activeWeight: number, activeIndicatorWidth: number): SidebarNonColorCue[] {
	const cueTypes: SidebarNonColorCue[] = [];

	if (activeWeight >= 600) {
		cueTypes.push('weight');
	}

	if (activeIndicatorWidth >= 2) {
		cueTypes.push('indicator');
	}

	return cueTypes;
}

interface RecipeStyle {
	activeBg: string;
	activeFg: string;
	activeWeight: number;
	activeIndicatorWidth: number;
	activeIndicatorColor: string;
}

function resolveRecipeStyle(
	tokens: TokenMap,
	mode: ThemeMode,
	recipe: SidebarRecipeId,
	surface: string
): RecipeStyle {
	if (recipe === 'current') {
		const activeFg = requireToken(tokens, '--dry-color-fill-brand');
		return {
			activeFg,
			activeBg: mixOver(surface, activeFg, mode === 'light' ? 0.12 : 0.14),
			activeWeight: 500,
			activeIndicatorWidth: 0,
			activeIndicatorColor: 'currentColor'
		};
	}

	return {
		activeBg:
			mode === 'light'
				? requireToken(tokens, '--dry-color-fill-brand-active')
				: requireToken(tokens, '--dry-color-fill-brand-hover'),
		activeFg:
			mode === 'light'
				? requireToken(tokens, '--dry-color-on-brand')
				: requireToken(tokens, '--dry-color-bg-base'),
		activeWeight: 600,
		activeIndicatorWidth: 3,
		activeIndicatorColor: 'currentColor'
	};
}

function buildContract(
	tokens: TokenMap,
	mode: ThemeMode,
	recipe: SidebarRecipeId,
	variant: SidebarContractVariant,
	surface: string,
	border: string,
	style: RecipeStyle
): SidebarContract {
	const { activeBg, activeFg, activeWeight, activeIndicatorWidth, activeIndicatorColor } = style;
	const cueTypes = getCueTypes(activeWeight, activeIndicatorWidth);
	const textOnActiveApca = apcaContrastBetweenCssColors(activeFg, activeBg) ?? 0;
	const checks: SidebarChecks = {
		textOnActive: contrastBetween(activeFg, activeBg),
		textOnActiveApca,
		activeVsSurface: contrastBetween(activeBg, surface),
		hasReadableText: contrastBetween(activeFg, activeBg) >= 4.5,
		hasReadableApcaText: meetsApca(textOnActiveApca, 60),
		hasReadableSurfaceCue: contrastBetween(activeBg, surface) >= 3,
		hasReadableAccentCue: false,
		hasNonColorCue: cueTypes.length > 0,
		cueTypes
	};

	return {
		mode,
		recipe,
		surface,
		activeBg,
		activeFg,
		activeWeight,
		activeIndicatorWidth,
		activeIndicatorColor,
		customProperties: buildPreviewProperties(
			tokens,
			{
				'--dry-sidebar-bg': surface,
				'--dry-sidebar-border': border,
				'--dry-sidebar-active-bg': activeBg,
				'--dry-sidebar-active-color': activeFg,
				'--dry-sidebar-active-weight': String(activeWeight),
				'--dry-sidebar-active-indicator-width': `${activeIndicatorWidth}px`,
				'--dry-sidebar-active-indicator-color': activeIndicatorColor
			},
			mode,
			variant
		),
		checks,
		passesContract:
			checks.hasReadableText &&
			checks.hasReadableApcaText &&
			(checks.hasReadableSurfaceCue || checks.hasReadableAccentCue) &&
			checks.hasNonColorCue
	};
}

export function computeSidebarContract(
	theme: ThemeTokens,
	mode: ThemeMode,
	recipe: SidebarRecipeId,
	variant: SidebarContractVariant = 'preview'
): SidebarContract {
	const tokens = theme[mode];
	const surface = requireToken(tokens, '--dry-color-bg-overlay');
	const border =
		variant === 'preview' ? 'transparent' : requireToken(tokens, '--dry-color-stroke-weak');
	const style = resolveRecipeStyle(tokens, mode, recipe, surface);

	return buildContract(tokens, mode, recipe, variant, surface, border, style);
}

export function serializeCustomProperties(properties: Record<string, string>): string {
	return Object.entries(properties)
		.map(([name, value]) => `${name}: ${value}`)
		.join('; ');
}
