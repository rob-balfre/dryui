import type { BrandInput, ThemeOptions } from './derivation.js';
import type {
	NeutralMode,
	Personality,
	RadiusPreset,
	Density,
	ShadowPreset,
	TypeScale,
	FontPreset
} from '../state.svelte.js';

export interface DecodedTheme {
	brand: BrandInput;
	options?: ThemeOptions;
}

export interface WizardRecipe {
	brand: BrandInput;
	personality?: Personality;
	neutralMode?: NeutralMode;
	statusHues?: { error?: number; warning?: number; success?: number; info?: number };
	typography?: { fontPreset: FontPreset; scale: TypeScale };
	shape?: { radiusPreset: RadiusPreset; radiusScale: number; density: Density };
	shadows?: { preset: ShadowPreset; intensity: number; tintBrand: boolean };
}

/**
 * Encode wizard input state into a compact URL-safe string.
 *
 * Format: `h{hue}s{sat}b{bri}` with optional `-n` neutral-mode flag and
 * `-e{error}w{warning}s{success}i{info}` status suffix.
 *
 * Examples:
 *   Default brand only:             `h230s65b85`
 *   Brand + status hue overrides:   `h230s65b85-e350w45`
 */
export function encodeTheme(input: { brand: BrandInput; options?: ThemeOptions }): string {
	const { brand, options } = input;
	const segments: string[] = [
		`h${Math.round(brand.h)}s${Math.round(brand.s)}b${Math.round(brand.b)}`
	];

	if (options?.neutralMode === 'neutral') {
		segments.push('n');
	}

	const sh = options?.statusHues;
	if (sh && Object.keys(sh).length > 0) {
		const parts: string[] = [];
		if (sh.error !== undefined) parts.push(`e${Math.round(sh.error)}`);
		if (sh.warning !== undefined) parts.push(`w${Math.round(sh.warning)}`);
		if (sh.success !== undefined) parts.push(`s${Math.round(sh.success)}`);
		if (sh.info !== undefined) parts.push(`i${Math.round(sh.info)}`);
		if (parts.length > 0) {
			segments.push(parts.join(''));
		}
	}

	return segments.join('-');
}

/**
 * Decode a compact theme string back into brand input and options.
 *
 * Throws if the string is not a valid encoded theme.
 */
export function decodeTheme(encoded: string): DecodedTheme {
	if (!encoded) {
		throw new Error('Empty encoded theme string');
	}

	// Parse brand: h{hue}s{sat}b{bri}
	const [brandPart, ...segments] = encoded.split('-');
	if (brandPart === undefined) {
		throw new Error('Missing brand segment');
	}
	const brandMatch = brandPart.match(/^h(\d+(?:\.\d+)?)s(\d+(?:\.\d+)?)b(\d+(?:\.\d+)?)$/);
	if (
		!brandMatch ||
		brandMatch[1] === undefined ||
		brandMatch[2] === undefined ||
		brandMatch[3] === undefined
	) {
		throw new Error(`Invalid brand segment: "${brandPart}"`);
	}

	const brand: BrandInput = {
		h: parseFloat(brandMatch[1]),
		s: parseFloat(brandMatch[2]),
		b: parseFloat(brandMatch[3])
	};

	if (segments.length === 0) {
		return { brand };
	}

	const options: ThemeOptions = {};
	const statusHues: NonNullable<ThemeOptions['statusHues']> = {};
	let hasStatusHues = false;

	for (const segment of segments) {
		if (segment === 'n') {
			options.neutralMode = 'neutral';
			continue;
		}

		// Parse status hues: sequences of letter+digits, e.g. e350w45s145i210
		const statusRegex = /([ewsi])(\d+(?:\.\d+)?)/g;
		let match: RegExpExecArray | null;

		while ((match = statusRegex.exec(segment)) !== null) {
			const key = match[1];
			const rawHue = match[2];
			if (key === undefined || rawHue === undefined) continue;
			const hue = parseFloat(rawHue);
			if (key === 'e') statusHues.error = hue;
			else if (key === 'w') statusHues.warning = hue;
			else if (key === 's') statusHues.success = hue;
			else if (key === 'i') statusHues.info = hue;
			hasStatusHues = true;
		}
	}

	if (hasStatusHues) {
		options.statusHues = statusHues;
	}

	if (Object.keys(options).length > 0) {
		return { brand, options };
	}

	return { brand };
}

// ─── Full wizard recipe codec ────────────────────────────────────────────────
// Encodes ALL wizard inputs into a single compact hash.
// Format: h{h}s{s}b{b}[-n][-e{h}w{h}s{h}i{h}][-l{0-3}][-f{0-5}c{0-2}][-p{0-3}d{0-2}k{scale*100}][-x{0-3}y{int*100}z{0|1}]
// Example: h230s65b85-e0w40s145i210-l2-f0c1-p1d1k100-x2y100z1

const PERSONALITY_NAMES = ['minimal', 'clean', 'structured', 'rich'] as const;
const PERSONALITY_INDEX = Object.fromEntries(PERSONALITY_NAMES.map((n, i) => [n, i]));
const FONT_NAMES = ['System', 'Humanist', 'Geometric', 'Classical', 'Serif', 'Mono'] as const;
const FONT_INDEX = Object.fromEntries(FONT_NAMES.map((n, i) => [n, i]));
const SCALE_NAMES = ['compact', 'default', 'spacious'] as const;
const SCALE_INDEX = Object.fromEntries(SCALE_NAMES.map((n, i) => [n, i]));
const RADIUS_NAMES = ['sharp', 'soft', 'rounded', 'pill'] as const;
const RADIUS_INDEX = Object.fromEntries(RADIUS_NAMES.map((n, i) => [n, i]));
const SHADOW_NAMES = ['flat', 'subtle', 'elevated', 'deep'] as const;
const SHADOW_INDEX = Object.fromEntries(SHADOW_NAMES.map((n, i) => [n, i]));

export function encodeRecipe(recipe: WizardRecipe): string {
	const { brand } = recipe;
	const parts: string[] = [`h${Math.round(brand.h)}s${Math.round(brand.s)}b${Math.round(brand.b)}`];

	if (recipe.neutralMode === 'neutral') parts.push('n');

	const sh = recipe.statusHues;
	if (sh) {
		const sp: string[] = [];
		if (sh.error !== undefined) sp.push(`e${Math.round(sh.error)}`);
		if (sh.warning !== undefined) sp.push(`w${Math.round(sh.warning)}`);
		if (sh.success !== undefined) sp.push(`s${Math.round(sh.success)}`);
		if (sh.info !== undefined) sp.push(`i${Math.round(sh.info)}`);
		if (sp.length > 0) parts.push(sp.join(''));
	}

	if (recipe.personality) {
		const li = PERSONALITY_INDEX[recipe.personality] ?? 2;
		parts.push(`l${li}`);
	}

	if (recipe.typography) {
		const fi = FONT_INDEX[recipe.typography.fontPreset] ?? 0;
		const si = SCALE_INDEX[recipe.typography.scale] ?? 1;
		parts.push(`f${fi}c${si}`);
	}

	if (recipe.shape) {
		const ri = RADIUS_INDEX[recipe.shape.radiusPreset] ?? 1;
		const di = SCALE_INDEX[recipe.shape.density] ?? 1;
		const ks = Math.round(recipe.shape.radiusScale * 100);
		parts.push(`p${ri}d${di}k${ks}`);
	}

	if (recipe.shadows) {
		const xi = SHADOW_INDEX[recipe.shadows.preset] ?? 2;
		const yi = Math.round(recipe.shadows.intensity * 100);
		const zi = recipe.shadows.tintBrand ? 1 : 0;
		parts.push(`x${xi}y${yi}z${zi}`);
	}

	return parts.join('-');
}

export function decodeRecipe(encoded: string): WizardRecipe {
	if (!encoded) throw new Error('Empty recipe string');

	const [brandPart, ...segments] = encoded.split('-');
	if (!brandPart) throw new Error('Missing brand segment');

	const brandMatch = brandPart.match(/^h(\d+(?:\.\d+)?)s(\d+(?:\.\d+)?)b(\d+(?:\.\d+)?)$/);
	if (!brandMatch || !brandMatch[1] || !brandMatch[2] || !brandMatch[3]) {
		throw new Error(`Invalid brand segment: "${brandPart}"`);
	}

	const recipe: WizardRecipe = {
		brand: {
			h: parseFloat(brandMatch[1]),
			s: parseFloat(brandMatch[2]),
			b: parseFloat(brandMatch[3])
		}
	};

	const statusHues: NonNullable<WizardRecipe['statusHues']> = {};
	let hasStatus = false;

	for (const seg of segments) {
		if (seg === 'n') {
			recipe.neutralMode = 'neutral';
			continue;
		}

		// Personality: l{0-3}
		const personalityMatch = seg.match(/^l([0-3])$/);
		if (personalityMatch && personalityMatch[1] !== undefined) {
			recipe.personality = (PERSONALITY_NAMES[parseInt(personalityMatch[1])] ??
				'structured') as Personality;
			continue;
		}

		// Typography: f{idx}c{idx}
		const typoMatch = seg.match(/^f(\d)c(\d)$/);
		if (typoMatch && typoMatch[1] !== undefined && typoMatch[2] !== undefined) {
			recipe.typography = {
				fontPreset: FONT_NAMES[parseInt(typoMatch[1])] ?? 'System',
				scale: (SCALE_NAMES[parseInt(typoMatch[2])] ?? 'default') as TypeScale
			};
			continue;
		}

		// Shape: p{idx}d{idx}k{scale*100}
		const shapeMatch = seg.match(/^p(\d)d(\d)k(\d+)$/);
		if (
			shapeMatch &&
			shapeMatch[1] !== undefined &&
			shapeMatch[2] !== undefined &&
			shapeMatch[3] !== undefined
		) {
			recipe.shape = {
				radiusPreset: (RADIUS_NAMES[parseInt(shapeMatch[1])] ?? 'soft') as RadiusPreset,
				density: (SCALE_NAMES[parseInt(shapeMatch[2])] ?? 'default') as Density,
				radiusScale: parseInt(shapeMatch[3]) / 100
			};
			continue;
		}

		// Shadows: x{idx}y{int*100}z{0|1}
		const shadowMatch = seg.match(/^x(\d)y(\d+)z([01])$/);
		if (
			shadowMatch &&
			shadowMatch[1] !== undefined &&
			shadowMatch[2] !== undefined &&
			shadowMatch[3] !== undefined
		) {
			recipe.shadows = {
				preset: (SHADOW_NAMES[parseInt(shadowMatch[1])] ?? 'elevated') as ShadowPreset,
				intensity: parseInt(shadowMatch[2]) / 100,
				tintBrand: shadowMatch[3] === '1'
			};
			continue;
		}

		// Status hues: e{h}w{h}s{h}i{h}
		const statusRegex = /([ewsi])(\d+(?:\.\d+)?)/g;
		let match: RegExpExecArray | null;
		while ((match = statusRegex.exec(seg)) !== null) {
			const key = match[1];
			const hue = parseFloat(match[2]!);
			if (key === 'e') statusHues.error = hue;
			else if (key === 'w') statusHues.warning = hue;
			else if (key === 's') statusHues.success = hue;
			else if (key === 'i') statusHues.info = hue;
			hasStatus = true;
		}
	}

	if (hasStatus) recipe.statusHues = statusHues;
	return recipe;
}
