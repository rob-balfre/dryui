/**
 * derivation.ts — Color Derivation Engine
 *
 * Pure functions, zero UI dependencies.
 * HSB-first approach: brand input is always HSB (Hue/Saturation/Brightness).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HSL {
	h: number; // 0–360
	s: number; // 0–1
	l: number; // 0–1
}

export interface HSB {
	h: number; // 0–360
	s: number; // 0–1
	b: number; // 0–1 (brightness/value)
}

export interface BrandInput {
	h: number; // 0–360
	s: number; // 0–100
	b: number; // 0–100
}

export interface ThemeOptions {
	neutralMode?: 'monochromatic' | 'neutral';
	/**
	 * Hue used to tint neutrals when neutralMode is 'monochromatic'.
	 * Defaults to the brand hue, so existing themes are unchanged.
	 */
	neutralHue?: number;
	brandCandidates?: BrandInput[];
	statusHues?: {
		error?: number;
		warning?: number;
		success?: number;
		info?: number;
	};
	darkBg?: {
		base?: string;
		raised?: string;
		overlay?: string;
	};
}

export interface ThemeTokens {
	light: Record<string, string>;
	dark: Record<string, string>;
}

export type SystemTone = 'error' | 'warning' | 'success' | 'info';

export interface ThemeReference {
	source: string;
	value: string;
}

export interface ThemeModeLadder<T> {
	light: T;
	dark: T;
}

export interface TransparentNeutralLadder {
	textStrong: string;
	textWeak: string;
	icon: string;
	strokeStrong: string;
	strokeWeak: string;
	fill: string;
	fillHover: string;
	fillActive: string;
}

export interface TransparentBrandLadder {
	brand: string;
	text: string;
	fill: string;
	fillHover: string;
	fillActive: string;
	fillWeak: string;
	stroke: string;
	on: string;
	focusRing: string;
}

export interface TransparentToneLadder {
	text: string;
	fill: string;
	fillHover: string;
	fillWeak: string;
	stroke: string;
	on: string;
}

export interface TransparentPrimitiveLadders {
	neutral: ThemeModeLadder<TransparentNeutralLadder>;
	brand: ThemeModeLadder<TransparentBrandLadder>;
	system: Record<SystemTone, ThemeModeLadder<TransparentToneLadder>>;
}

export interface LiteralTransparentNeutralLadder {
	'1000': string;
	'700': string;
	'500': string;
	'100': string;
	'50': string;
	'25': string;
}

export interface LiteralTransparentToneLadder {
	'1000': string;
	'800': string;
	'200': string;
	'50': string;
}

export interface LiteralTransparentPrimitiveLadders {
	neutral: ThemeModeLadder<LiteralTransparentNeutralLadder>;
	brand: ThemeModeLadder<LiteralTransparentToneLadder>;
	system: Record<SystemTone, ThemeModeLadder<LiteralTransparentToneLadder>>;
}

export interface SolidSurfaceSteps {
	'1000'?: string;
	'900'?: string;
	'850'?: string;
	'800'?: string;
	'50'?: string;
	'0'?: string;
}

export interface SolidSurfaceRoles {
	sunken: string;
	base: string;
	raised?: string;
	overlay?: string;
}

export interface SolidSurfacePalette {
	steps: SolidSurfaceSteps;
	roles: SolidSurfaceRoles;
}

export interface SolidPrimitiveLadders {
	grey: ThemeModeLadder<SolidSurfacePalette>;
	yellow: ThemeModeLadder<{ '1000': string }>;
}

export interface InteractiveStateRecipe {
	baseFill: string;
	hoverOverlay: string;
	activeOverlay: string;
	focusRing: string;
	label: string;
	stroke: string;
	disabledFill: string;
	disabledLabel: string;
	disabledStroke: string;
}

export interface InteractionStateRecipes {
	neutral: ThemeModeLadder<InteractiveStateRecipe>;
	brand: ThemeModeLadder<InteractiveStateRecipe>;
	system: Record<SystemTone, ThemeModeLadder<InteractiveStateRecipe>>;
}

export interface BrandCandidateAssessment {
	id: string;
	label: string;
	input: BrandInput;
	resolvedInput: BrandInput;
	usesHueFallback: boolean;
	lightFill: string;
	darkFill: string;
	lightContrast: number;
	darkContrast: number;
	minContrast: number;
	statusConflict: SystemTone | 'warning' | null;
	score: number;
	role: 'interactive' | 'decorative';
}

export interface BrandPolicy {
	candidates: BrandCandidateAssessment[];
	raw: BrandCandidateAssessment;
	interactive: BrandCandidateAssessment;
	multipleBrand: boolean;
	fallbackTriggered: boolean;
	statusConflictResolved: boolean;
}

export interface ThemeAuditCheck extends ForegroundSurfaceAssessment {
	id: string;
	label: string;
	kind: 'text' | 'stroke' | 'shape';
	contrastThreshold: number;
	apcaThreshold: number;
	passes: boolean;
}

export interface ThemeAudit {
	contextChecks: ThemeAuditCheck[];
	allPass: boolean;
}

export interface PhotoTemperatureGuidance {
	temperature: 'warm' | 'cool' | 'neutral';
	recommendation: string;
	accentDirection: string;
}

export interface ThemeModelLayer {
	light: Record<string, ThemeReference>;
	dark: Record<string, ThemeReference>;
}

export interface ThemeModel {
	primitives: ThemeTokens;
	transparentPrimitives: TransparentPrimitiveLadders;
	literalTransparentPrimitives: LiteralTransparentPrimitiveLadders;
	solidPrimitives: SolidPrimitiveLadders;
	interactionStates: InteractionStateRecipes;
	brandPolicy: BrandPolicy;
	audit: ThemeAudit;
	photoGuidance: PhotoTemperatureGuidance;
	_theme: ThemeModelLayer;
	semantic: ThemeModelLayer;
	tokens: ThemeTokens;
}

interface RGBA {
	r: number;
	g: number;
	b: number;
	a: number;
}

// ─── Color Conversions ────────────────────────────────────────────────────────

/**
 * Convert HSB (Hue/Saturation/Brightness) to HSL.
 * h: 0–360, s: 0–1, b: 0–1
 * Returns { h: 0–360, s: 0–1, l: 0–1 }
 */
export function hsbToHsl(h: number, s: number, b: number): HSL {
	// HSB → HSL conversion
	// l = b * (1 - s/2)
	// s_hsl = (b === l || l === 1) ? 0 : (b - l) / min(l, 1-l)
	const l = b * (1 - s / 2);
	let sHsl: number;
	if (l === 0 || l === 1) {
		sHsl = 0;
	} else {
		sHsl = (b - l) / Math.min(l, 1 - l);
	}
	return { h, s: sHsl, l };
}

/**
 * Convert HSL to HSB.
 * h: 0–360, s: 0–1, l: 0–1
 * Returns { h: 0–360, s: 0–1, b: 0–1 }
 */
export function hslToHsb(h: number, s: number, l: number): HSB {
	// HSL → HSB conversion
	// b = l + s * min(l, 1-l)
	// s_hsb = (b === 0) ? 0 : 2 * (1 - l/b)
	const b = l + s * Math.min(l, 1 - l);
	let sHsb: number;
	if (b === 0) {
		sHsb = 0;
	} else {
		sHsb = 2 * (1 - l / b);
	}
	return { h, s: sHsb, b };
}

/**
 * Convert HSL to RGB.
 * h: 0–360, s: 0–1, l: 0–1
 * Returns [r, g, b] each 0–255
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	if (s === 0) {
		const v = Math.round(l * 255);
		return [v, v, v];
	}

	const hueToRgb = (p: number, q: number, t: number): number => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	const hNorm = h / 360;

	const r = Math.round(hueToRgb(p, q, hNorm + 1 / 3) * 255);
	const g = Math.round(hueToRgb(p, q, hNorm) * 255);
	const b = Math.round(hueToRgb(p, q, hNorm - 1 / 3) * 255);

	return [r, g, b];
}

/**
 * Convert HSL to hex string (#rrggbb).
 * h: 0–360, s: 0–1, l: 0–1
 */
export function hslToHex(h: number, s: number, l: number): string {
	const [r, g, b] = hslToRgb(h, s, l);
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex string (#rrggbb) to HSL.
 */
export function hexToHsl(hex: string): HSL {
	if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
		throw new Error(`Invalid hex color: ${hex}`);
	}
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;

	if (max === min) {
		return { h: 0, s: 0, l };
	}

	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

	let hVal: number;
	switch (max) {
		case r:
			hVal = ((g - b) / d + (g < b ? 6 : 0)) / 6;
			break;
		case g:
			hVal = ((b - r) / d + 2) / 6;
			break;
		default:
			hVal = ((r - g) / d + 4) / 6;
			break;
	}

	return { h: hVal * 360, s, l };
}

export function cssColorToRgb(color: string): [number, number, number] | null {
	const rgba = cssColorToRgba(color);

	if (!rgba) {
		return null;
	}

	return [rgba.r, rgba.g, rgba.b];
}

function cssColorToRgba(color: string): RGBA | null {
	const normalized = color.trim();

	if (normalized.startsWith('#')) {
		try {
			const { h, s, l } = hexToHsl(normalized);
			const [r, g, b] = hslToRgb(h, s, l);
			return { r, g, b, a: 1 };
		} catch {
			return null;
		}
	}

	const match = normalized.match(
		/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)/
	);

	if (!match?.[1] || !match[2] || !match[3]) {
		return null;
	}

	const [r, g, b] = hslToRgb(
		Number.parseFloat(match[1]),
		Number.parseFloat(match[2]) / 100,
		Number.parseFloat(match[3]) / 100
	);

	return {
		r,
		g,
		b,
		a: clamp(match[4] ? Number.parseFloat(match[4]) : 1, 0, 1)
	};
}

function compositeOver(foreground: RGBA, background: RGBA): [number, number, number] {
	const alpha = foreground.a + background.a * (1 - foreground.a);

	if (alpha <= 0) {
		return [0, 0, 0];
	}

	const compositeChannel = (fg: number, bg: number): number =>
		Math.round((fg * foreground.a + bg * background.a * (1 - foreground.a)) / alpha);

	return [
		compositeChannel(foreground.r, background.r),
		compositeChannel(foreground.g, background.g),
		compositeChannel(foreground.b, background.b)
	];
}

function resolveOpaqueBackground(color: RGBA): [number, number, number] {
	if (color.a >= 1) {
		return [color.r, color.g, color.b];
	}

	return compositeOver(color, { r: 255, g: 255, b: 255, a: 1 });
}

function resolveCssPair(
	foreground: string,
	background: string
): [[number, number, number], [number, number, number]] | null {
	const foregroundRgba = cssColorToRgba(foreground);
	const backgroundRgba = cssColorToRgba(background);

	if (!foregroundRgba || !backgroundRgba) {
		return null;
	}

	const backgroundRgb = resolveOpaqueBackground(backgroundRgba);
	const foregroundRgb =
		foregroundRgba.a >= 1
			? ([foregroundRgba.r, foregroundRgba.g, foregroundRgba.b] as [number, number, number])
			: compositeOver(foregroundRgba, {
					r: backgroundRgb[0],
					g: backgroundRgb[1],
					b: backgroundRgb[2],
					a: 1
				});

	return [foregroundRgb, backgroundRgb];
}

// ─── WCAG Contrast ────────────────────────────────────────────────────────────

/**
 * Compute relative luminance from linear RGB channels (each 0–255).
 * Per WCAG 2.1.
 */
export function relativeLuminance(r: number, g: number, b: number): number {
	const linearize = (c: number): number => {
		const sRGB = c / 255;
		return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Compute WCAG contrast ratio from two luminance values.
 * Returns a value between 1 and 21.
 */
export function contrastRatio(lum1: number, lum2: number): number {
	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two luminance values meet a contrast threshold.
 */
export function meetsContrast(lum1: number, lum2: number, threshold: number): boolean {
	return contrastRatio(lum1, lum2) >= threshold;
}

/**
 * Compute relative luminance from HSL values.
 * h: 0–360, s: 0–1, l: 0–1
 */
export function luminanceFromHsl(h: number, s: number, l: number): number {
	const [r, g, b] = hslToRgb(h, s, l);
	return relativeLuminance(r, g, b);
}

export function contrastBetweenCssColors(first: string, second: string): number | null {
	const pair = resolveCssPair(first, second);

	if (!pair) {
		return null;
	}

	const [firstRgb, secondRgb] = pair;

	return contrastRatio(
		relativeLuminance(firstRgb[0], firstRgb[1], firstRgb[2]),
		relativeLuminance(secondRgb[0], secondRgb[1], secondRgb[2])
	);
}

export interface ForegroundSurfaceThresholds {
	contrast?: number;
	apca?: number;
}

export interface ForegroundSurfaceAssessment {
	foreground: string;
	surface: string;
	contrast: number | null;
	apca: number | null;
	apcaMagnitude: number | null;
	passesContrast: boolean;
	passesApca: boolean;
}

export interface ForegroundSurfaceComparison {
	foreground: string;
	assessments: ForegroundSurfaceAssessment[];
	contrastSpread: number | null;
	apcaMagnitudeSpread: number | null;
}

function spread(values: readonly (number | null)[]): number | null {
	const numericValues = values.filter((value): value is number => value != null);

	if (numericValues.length < 2) {
		return null;
	}

	return Math.max(...numericValues) - Math.min(...numericValues);
}

export function measureForegroundOnSurface(
	foreground: string,
	surface: string,
	thresholds?: ForegroundSurfaceThresholds
): ForegroundSurfaceAssessment {
	const contrast = contrastBetweenCssColors(foreground, surface);
	const apca = apcaContrastBetweenCssColors(foreground, surface);
	const apcaMagnitude = apca == null ? null : Math.abs(apca);
	const contrastThreshold = thresholds?.contrast ?? 4.5;
	const apcaThreshold = thresholds?.apca ?? 60;

	return {
		foreground,
		surface,
		contrast,
		apca,
		apcaMagnitude,
		passesContrast: contrast != null && contrast >= contrastThreshold,
		passesApca: apcaMagnitude != null && apcaMagnitude >= apcaThreshold
	};
}

export function compareForegroundAcrossSurfaces(
	foreground: string,
	surfaces: readonly string[],
	thresholds?: ForegroundSurfaceThresholds
): ForegroundSurfaceComparison {
	const assessments = surfaces.map((surface) =>
		measureForegroundOnSurface(foreground, surface, thresholds)
	);

	return {
		foreground,
		assessments,
		contrastSpread: spread(assessments.map((assessment) => assessment.contrast)),
		apcaMagnitudeSpread: spread(assessments.map((assessment) => assessment.apcaMagnitude))
	};
}

// ─── APCA Contrast ───────────────────────────────────────────────────────────

const APCA_CONSTANTS = {
	mainTRC: 2.4,
	sRco: 0.2126729,
	sGco: 0.7151522,
	sBco: 0.072175,
	normBG: 0.56,
	normTXT: 0.57,
	revTXT: 0.62,
	revBG: 0.65,
	blkThrs: 0.022,
	blkClmp: 1.414,
	scaleBoW: 1.14,
	scaleWoB: 1.14,
	loBoWoffset: 0.027,
	loWoBoffset: 0.027,
	deltaYmin: 0.0005,
	loClip: 0.1
} as const;

export function apcaSrgbToY(rgb: [number, number, number]): number {
	const channelToY = (channel: number): number =>
		Math.pow(clamp(channel, 0, 255) / 255, APCA_CONSTANTS.mainTRC);

	return (
		APCA_CONSTANTS.sRco * channelToY(rgb[0]) +
		APCA_CONSTANTS.sGco * channelToY(rgb[1]) +
		APCA_CONSTANTS.sBco * channelToY(rgb[2])
	);
}

export function apcaContrast(textY: number, backgroundY: number): number {
	if (
		Number.isNaN(textY) ||
		Number.isNaN(backgroundY) ||
		Math.min(textY, backgroundY) < 0 ||
		Math.max(textY, backgroundY) > 1.1
	) {
		return 0;
	}

	const clampBlack = (value: number): number =>
		value > APCA_CONSTANTS.blkThrs
			? value
			: value + Math.pow(APCA_CONSTANTS.blkThrs - value, APCA_CONSTANTS.blkClmp);

	const text = clampBlack(textY);
	const background = clampBlack(backgroundY);

	if (Math.abs(background - text) < APCA_CONSTANTS.deltaYmin) {
		return 0;
	}

	if (background > text) {
		const raw =
			(Math.pow(background, APCA_CONSTANTS.normBG) - Math.pow(text, APCA_CONSTANTS.normTXT)) *
			APCA_CONSTANTS.scaleBoW;

		if (raw < APCA_CONSTANTS.loClip) {
			return 0;
		}

		return (raw - APCA_CONSTANTS.loBoWoffset) * 100;
	}

	const raw =
		(Math.pow(background, APCA_CONSTANTS.revBG) - Math.pow(text, APCA_CONSTANTS.revTXT)) *
		APCA_CONSTANTS.scaleWoB;

	if (raw > -APCA_CONSTANTS.loClip) {
		return 0;
	}

	return (raw + APCA_CONSTANTS.loWoBoffset) * 100;
}

export function apcaContrastBetweenCssColors(text: string, background: string): number | null {
	const pair = resolveCssPair(text, background);

	if (!pair) {
		return null;
	}

	const [textRgb, backgroundRgb] = pair;

	return apcaContrast(apcaSrgbToY(textRgb), apcaSrgbToY(backgroundRgb));
}

export function meetsApca(lc: number | null, threshold: number): boolean {
	return lc !== null && Math.abs(lc) >= threshold;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/** Clamp a value between min and max. */
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function requireLayerValue(values: Record<string, string>, name: string): string {
	const value = values[name];

	if (!value) {
		throw new Error(`Missing layer value ${name}`);
	}

	return value;
}

/** Format an HSL value as a CSS hsl() string. */
function hsl(h: number, s: number, l: number): string {
	return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/** Format as CSS hsla() string. */
function hsla(h: number, s: number, l: number, a: number): string {
	return `hsla(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})`;
}

/**
 * Iteratively adjust lightness until contrast >= threshold.
 * direction: 'darken' or 'lighten'
 * Returns the adjusted HSL object.
 */
function adjustForContrast(
	h: number,
	s: number,
	l: number,
	bgLuminance: number,
	threshold: number,
	direction: 'darken' | 'lighten',
	floorL: number,
	ceilL: number
): HSL {
	const step = 0.05;
	let currentL = l;

	for (let i = 0; i < 40; i++) {
		const lum = luminanceFromHsl(h, s, currentL);
		if (meetsContrast(lum, bgLuminance, threshold)) {
			return { h, s, l: currentL };
		}
		if (direction === 'darken') {
			currentL = Math.max(floorL, currentL - step);
			if (currentL <= floorL) break;
		} else {
			currentL = Math.min(ceilL, currentL + step);
			if (currentL >= ceilL) break;
		}
	}
	return { h, s, l: currentL };
}

function adjustCssColorForReadability(
	h: number,
	s: number,
	l: number,
	background: string,
	contrastThreshold: number,
	apcaThreshold: number,
	direction: 'darken' | 'lighten',
	floorL: number,
	ceilL: number
): HSL {
	const step = 0.05;
	let currentL = l;

	for (let i = 0; i < 40; i++) {
		const current = hsl(h, s, currentL);
		const contrast = contrastBetweenCssColors(current, background);
		const apca = apcaContrastBetweenCssColors(current, background);
		const passesContrast = contrast != null && contrast >= contrastThreshold;
		const passesApca = apca != null && Math.abs(apca) >= apcaThreshold;

		if (passesContrast && passesApca) {
			return { h, s, l: currentL };
		}

		if (direction === 'darken') {
			currentL = Math.max(floorL, currentL - step);
			if (currentL <= floorL) break;
		} else {
			currentL = Math.min(ceilL, currentL + step);
			if (currentL >= ceilL) break;
		}
	}

	return { h, s, l: currentL };
}

function passesCssReadability(
	foreground: string,
	background: string,
	contrastThreshold: number,
	apcaThreshold: number
): boolean {
	const contrast = contrastBetweenCssColors(foreground, background);
	const apca = apcaContrastBetweenCssColors(foreground, background);

	return (
		contrast != null &&
		contrast >= contrastThreshold &&
		apca != null &&
		Math.abs(apca) >= apcaThreshold
	);
}

function chooseAccessibleOnColor(fill: HSL): { color: string; passes: boolean } {
	const fillCss = hsl(fill.h, fill.s, fill.l);
	const darkTint = adjustCssColorForReadability(
		fill.h,
		clamp(fill.s * 0.3, 0, 1),
		0.12,
		fillCss,
		4.5,
		60,
		'darken',
		0,
		0.4
	);
	const darkTintCss = hsl(darkTint.h, darkTint.s, darkTint.l);
	const whiteContrast = contrastBetweenCssColors('#ffffff', fillCss) ?? 0;
	const darkContrast = contrastBetweenCssColors(darkTintCss, fillCss) ?? 0;
	const whiteApca = Math.abs(apcaContrastBetweenCssColors('#ffffff', fillCss) ?? 0);
	const darkApca = Math.abs(apcaContrastBetweenCssColors(darkTintCss, fillCss) ?? 0);
	const whitePasses = whiteContrast >= 4.5 && whiteApca >= 60;
	const darkPasses = darkContrast >= 4.5 && darkApca >= 60;

	if (whitePasses) {
		return { color: '#ffffff', passes: true };
	}

	if (darkPasses) {
		return { color: darkTintCss, passes: true };
	}

	const candidates = [
		{ color: '#ffffff', contrast: whiteContrast, apca: whiteApca },
		{ color: darkTintCss, contrast: darkContrast, apca: darkApca }
	].sort((left, right) => right.contrast - left.contrast || right.apca - left.apca);

	return { color: candidates[0]?.color ?? '#ffffff', passes: false };
}

function adjustFillForOnColor(
	fill: HSL,
	surface: string,
	surfaceContrastThreshold: number,
	surfaceApcaThreshold: number,
	direction: 'darken' | 'lighten',
	floorL: number,
	ceilL: number
): { fill: HSL; onColor: string; onPasses: boolean } {
	let current = fill;
	let choice = chooseAccessibleOnColor(current);

	for (let i = 0; i < 40; i++) {
		const fillCss = hsl(current.h, current.s, current.l);
		const fillPasses = passesCssReadability(
			fillCss,
			surface,
			surfaceContrastThreshold,
			surfaceApcaThreshold
		);

		if (fillPasses && choice.passes) {
			return { fill: current, onColor: choice.color, onPasses: true };
		}

		const nextL =
			direction === 'darken'
				? Math.max(floorL, current.l - 0.04)
				: Math.min(ceilL, current.l + 0.04);

		if (nextL === current.l) {
			break;
		}

		current = { ...current, l: nextL };
		choice = chooseAccessibleOnColor(current);
	}

	return { fill: current, onColor: choice.color, onPasses: choice.passes };
}

/**
 * Pick white or a dark tint for on-color text, choosing whichever meets 4.5:1
 * contrast against the given fill. Returns a CSS color string.
 */
function pickOnColor(fillH: number, fillS: number, fillL: number): string {
	return chooseAccessibleOnColor({ h: fillH, s: fillS, l: fillL }).color;
}

function deriveDarkModeAccent(h: number, s: number, b: number): HSL {
	const adjustedSaturation = clamp(s * 0.55, 0, 0.65);
	const adjustedBrightness = clamp(Math.max(b + 0.18, 0.78), 0, 1);
	return hsbToHsl(h, adjustedSaturation, adjustedBrightness);
}

function normalizeHue(hue: number): number {
	const wrapped = hue % 360;
	return wrapped < 0 ? wrapped + 360 : wrapped;
}

function hueDistance(a: number, b: number): number {
	const diff = Math.abs(a - b);
	return Math.min(diff, 360 - diff);
}

function lightenOrDarkenFillForContrast(
	h: number,
	s: number,
	l: number,
	backgroundLuminance: number,
	threshold: number,
	direction: 'darken' | 'lighten'
): HSL {
	return adjustForContrast(h, s, l, backgroundLuminance, threshold, direction, 0.08, 0.92);
}

function findStatusConflict(
	hue: number,
	statusHues: Pick<NonNullable<ThemeOptions['statusHues']>, 'error' | 'warning' | 'success'>
): 'error' | 'warning' | 'success' | null {
	const entries: Array<['error' | 'warning' | 'success', number]> = [
		['error', statusHues.error ?? 0],
		['warning', statusHues.warning ?? 40],
		['success', statusHues.success ?? 145]
	];
	const closest = entries
		.map(([tone, toneHue]) => ({ tone, toneHue, distance: hueDistance(hue, toneHue) }))
		.sort((left, right) => left.distance - right.distance)[0];

	if (!closest || closest.distance > 18) {
		return null;
	}

	return closest.tone;
}

function resolveBrandHue(
	hue: number,
	statusHues: Pick<NonNullable<ThemeOptions['statusHues']>, 'error' | 'warning' | 'success'>
): { hue: number; conflict: 'error' | 'warning' | 'success' | null; usesHueFallback: boolean } {
	const conflict = findStatusConflict(hue, statusHues);

	if (!conflict) {
		return { hue: normalizeHue(hue), conflict: null, usesHueFallback: false };
	}

	const conflictHue = statusHues[conflict] ?? 0;
	const direction = hue === conflictHue ? 1 : Math.sign(hue - conflictHue);

	return {
		hue: normalizeHue(conflictHue + direction * 24),
		conflict,
		usesHueFallback: true
	};
}

function assessBrandCandidate(
	id: string,
	label: string,
	input: BrandInput,
	neutralMode: ThemeOptions['neutralMode'],
	statusHues: NonNullable<ThemeOptions['statusHues']>
): BrandCandidateAssessment {
	const resolvedHue = resolveBrandHue(input.h, {
		error: statusHues.error ?? 0,
		warning: statusHues.warning ?? 40,
		success: statusHues.success ?? 145
	});
	const resolvedInput: BrandInput = {
		h: resolvedHue.hue,
		s: input.s,
		b: input.b
	};
	const lightBase = hsbToHsl(resolvedInput.h, resolvedInput.s / 100, resolvedInput.b / 100);
	const lightFill = lightenOrDarkenFillForContrast(
		lightBase.h,
		lightBase.s,
		lightBase.l,
		1,
		3,
		'darken'
	);
	const darkBase = deriveDarkModeAccent(
		resolvedInput.h,
		resolvedInput.s / 100,
		resolvedInput.b / 100
	);
	const darkBackgroundLuminance =
		neutralMode === 'neutral'
			? luminanceFromHsl(0, 0, 0.1)
			: luminanceFromHsl(resolvedInput.h, 0.3, 0.1);
	const darkFill = lightenOrDarkenFillForContrast(
		darkBase.h,
		darkBase.s,
		darkBase.l,
		darkBackgroundLuminance,
		3,
		'lighten'
	);
	const lightContrast = contrastRatio(luminanceFromHsl(lightFill.h, lightFill.s, lightFill.l), 1);
	const darkContrast = contrastRatio(
		luminanceFromHsl(darkFill.h, darkFill.s, darkFill.l),
		darkBackgroundLuminance
	);
	const minContrast = Math.min(lightContrast, darkContrast);
	const score = minContrast - (resolvedHue.conflict ? 1.5 : 0);

	return {
		id,
		label,
		input,
		resolvedInput,
		usesHueFallback: resolvedHue.usesHueFallback,
		lightFill: hsl(lightFill.h, lightFill.s, lightFill.l),
		darkFill: hsl(darkFill.h, darkFill.s, darkFill.l),
		lightContrast,
		darkContrast,
		minContrast,
		statusConflict: resolvedHue.conflict,
		score,
		role: 'decorative'
	};
}

function buildBrandPolicy(brand: BrandInput, options?: ThemeOptions): BrandPolicy {
	const neutralMode = options?.neutralMode ?? 'monochromatic';
	const statusHues: NonNullable<ThemeOptions['statusHues']> = {
		error: options?.statusHues?.error ?? 0,
		warning: options?.statusHues?.warning ?? 40,
		success: options?.statusHues?.success ?? 145,
		info: options?.statusHues?.info ?? 210
	};
	const candidateInputs = [
		{ id: 'primary', label: 'Primary', input: brand },
		...(options?.brandCandidates ?? []).map((candidate, index) => ({
			id: `accent-${index + 1}`,
			label: `Accent ${index + 1}`,
			input: candidate
		}))
	];
	const assessments = candidateInputs.map((candidate) =>
		assessBrandCandidate(candidate.id, candidate.label, candidate.input, neutralMode, statusHues)
	);
	const interactive =
		[...assessments].sort((left, right) => right.score - left.score)[0] ?? assessments[0];
	const raw = assessments[0] ?? interactive;

	if (!interactive || !raw) {
		throw new Error('Brand policy requires at least one brand candidate');
	}

	return {
		candidates: assessments.map((assessment) => ({
			...assessment,
			role: assessment.id === interactive.id ? 'interactive' : 'decorative'
		})),
		raw,
		interactive: {
			...interactive,
			role: 'interactive'
		},
		multipleBrand: assessments.length > 1,
		fallbackTriggered:
			interactive.id !== raw.id ||
			raw.statusConflict != null ||
			raw.minContrast < 3 ||
			raw.usesHueFallback,
		statusConflictResolved:
			raw.statusConflict != null && (interactive.id !== raw.id || interactive.usesHueFallback)
	};
}

function buildLiteralNeutralSteps(
	hue: number,
	neutralMode: ThemeOptions['neutralMode'],
	mode: 'light' | 'dark'
): LiteralTransparentNeutralLadder {
	if (mode === 'dark') {
		return {
			'1000': '#ffffff',
			'700': hsla(0, 0, 1, 0.78),
			'500': hsla(0, 0, 1, 0.6),
			'100': hsla(0, 0, 1, 0.12),
			'50': hsla(0, 0, 1, 0.06),
			'25': hsla(0, 0, 1, 0.03)
		};
	}

	const lightHue = neutralMode === 'neutral' ? 0 : hue;
	const lightSaturation = neutralMode === 'neutral' ? 0 : 1;

	return {
		'1000': hsla(lightHue, lightSaturation, 0.15, 0.9),
		'700': hsla(lightHue, lightSaturation, 0.2, 0.65),
		'500': hsla(lightHue, lightSaturation, 0.2, 0.46),
		'100': hsla(lightHue, lightSaturation, 0.2, 0.1),
		'50': hsla(lightHue, lightSaturation, 0.2, 0.04),
		'25': hsla(lightHue, lightSaturation, 0.2, 0.02)
	};
}

function buildLiteralToneSteps(fill: HSL): LiteralTransparentToneLadder {
	return {
		'1000': hsl(fill.h, fill.s, fill.l),
		'800': hsla(fill.h, fill.s, fill.l, 0.8),
		'200': hsla(fill.h, fill.s, fill.l, 0.2),
		'50': hsla(fill.h, fill.s, fill.l, 0.05)
	};
}

function buildLiteralTransparentPrimitiveLadders(
	brandPolicy: BrandPolicy,
	options?: ThemeOptions
): LiteralTransparentPrimitiveLadders {
	const neutralMode = options?.neutralMode ?? 'monochromatic';
	const interactiveBrand = brandPolicy.interactive.resolvedInput;
	const neutralHue = normalizeHue(options?.neutralHue ?? interactiveBrand.h);
	const statusHues = {
		error: options?.statusHues?.error ?? 0,
		warning: options?.statusHues?.warning ?? 40,
		success: options?.statusHues?.success ?? 145,
		info: options?.statusHues?.info ?? 210
	};
	const brandLight = hsbToHsl(
		interactiveBrand.h,
		interactiveBrand.s / 100,
		interactiveBrand.b / 100
	);
	const brandDark = deriveDarkModeAccent(
		interactiveBrand.h,
		interactiveBrand.s / 100,
		interactiveBrand.b / 100
	);

	return {
		neutral: {
			light: buildLiteralNeutralSteps(neutralHue, neutralMode, 'light'),
			dark: buildLiteralNeutralSteps(neutralHue, neutralMode, 'dark')
		},
		brand: {
			light: buildLiteralToneSteps(brandLight),
			dark: buildLiteralToneSteps(brandDark)
		},
		system: {
			error: {
				light: buildLiteralToneSteps(hsbToHsl(statusHues.error, 0.7, 0.5)),
				dark: buildLiteralToneSteps(hsbToHsl(statusHues.error, 0.65, 0.55))
			},
			warning: {
				light: buildLiteralToneSteps(hsbToHsl(statusHues.warning, 0.7, 0.5)),
				dark: buildLiteralToneSteps(hsbToHsl(statusHues.warning, 0.65, 0.55))
			},
			success: {
				light: buildLiteralToneSteps(hsbToHsl(statusHues.success, 0.7, 0.5)),
				dark: buildLiteralToneSteps(hsbToHsl(statusHues.success, 0.65, 0.55))
			},
			info: {
				light: buildLiteralToneSteps(hsbToHsl(statusHues.info, 0.7, 0.5)),
				dark: buildLiteralToneSteps(hsbToHsl(statusHues.info, 0.65, 0.55))
			}
		}
	};
}

function buildSolidPrimitiveLadders(
	hue: number,
	neutralMode: ThemeOptions['neutralMode']
): SolidPrimitiveLadders {
	const lightHue = neutralMode === 'neutral' ? 0 : hue;
	const lightSaturation = neutralMode === 'neutral' ? 0 : 0.02;
	const lightSunken = hsbToHsl(lightHue, lightSaturation, 0.98);
	const darkBaseCss = neutralMode === 'neutral' ? hsl(0, 0, 0.1) : hsl(hue, 0.3, 0.1);
	const darkRaisedCss = neutralMode === 'neutral' ? hsl(0, 0, 0.15) : hsl(hue, 0.25, 0.15);
	const darkOverlayCss = neutralMode === 'neutral' ? hsl(0, 0, 0.2) : hsl(hue, 0.2, 0.2);
	const yellow = '#fec62e';
	const lightSunkenCss = hsl(lightSunken.h, lightSunken.s, lightSunken.l);

	return {
		grey: {
			light: {
				steps: {
					'50': lightSunkenCss,
					'0': '#ffffff'
				},
				roles: {
					sunken: lightSunkenCss,
					base: '#ffffff'
				}
			},
			dark: {
				steps: {
					'1000': '#000000',
					'900': darkBaseCss,
					'850': darkRaisedCss,
					'800': darkOverlayCss
				},
				roles: {
					sunken: '#000000',
					base: darkBaseCss,
					raised: darkRaisedCss,
					overlay: darkOverlayCss
				}
			}
		},
		yellow: {
			light: { '1000': yellow },
			dark: { '1000': yellow }
		}
	};
}

function buildInteractionStateRecipes(tokens: ThemeTokens): InteractionStateRecipes {
	const buildModeRecipe = (mode: Record<string, string>) => ({
		neutral: {
			baseFill: requireLayerValue(mode, '--dry-color-fill'),
			hoverOverlay: requireLayerValue(mode, '--dry-color-fill-hover'),
			activeOverlay: requireLayerValue(mode, '--dry-color-fill-active'),
			focusRing: requireLayerValue(mode, '--dry-color-focus-ring'),
			label: requireLayerValue(mode, '--dry-color-text-strong'),
			stroke: requireLayerValue(mode, '--dry-color-stroke-strong'),
			disabledFill: requireLayerValue(mode, '--dry-color-fill'),
			disabledLabel: requireLayerValue(mode, '--dry-color-text-weak'),
			disabledStroke: requireLayerValue(mode, '--dry-color-stroke-weak')
		},
		brand: {
			baseFill: requireLayerValue(mode, '--dry-color-fill-brand'),
			hoverOverlay: requireLayerValue(mode, '--dry-color-fill-hover'),
			activeOverlay: requireLayerValue(mode, '--dry-color-fill-active'),
			focusRing: requireLayerValue(mode, '--dry-color-focus-ring'),
			label: requireLayerValue(mode, '--dry-color-on-brand'),
			stroke: requireLayerValue(mode, '--dry-color-stroke-brand'),
			disabledFill: requireLayerValue(mode, '--dry-color-fill-brand-weak'),
			disabledLabel: requireLayerValue(mode, '--dry-color-text-weak'),
			disabledStroke: requireLayerValue(mode, '--dry-color-stroke-weak')
		},
		system: Object.fromEntries(
			(['error', 'warning', 'success', 'info'] as const).map((tone) => [
				tone,
				{
					baseFill: requireLayerValue(mode, `--dry-color-fill-${tone}`),
					hoverOverlay: requireLayerValue(mode, '--dry-color-fill-hover'),
					activeOverlay: requireLayerValue(mode, '--dry-color-fill-active'),
					focusRing: requireLayerValue(mode, '--dry-color-focus-ring'),
					label: requireLayerValue(mode, `--dry-color-on-${tone}`),
					stroke: requireLayerValue(mode, `--dry-color-stroke-${tone}`),
					disabledFill: requireLayerValue(mode, `--dry-color-fill-${tone}-weak`),
					disabledLabel: requireLayerValue(mode, '--dry-color-text-weak'),
					disabledStroke: requireLayerValue(mode, '--dry-color-stroke-weak')
				}
			])
		) as Record<SystemTone, InteractiveStateRecipe>
	});

	return {
		neutral: {
			light: buildModeRecipe(tokens.light).neutral,
			dark: buildModeRecipe(tokens.dark).neutral
		},
		brand: {
			light: buildModeRecipe(tokens.light).brand,
			dark: buildModeRecipe(tokens.dark).brand
		},
		system: {
			error: {
				light: buildModeRecipe(tokens.light).system.error,
				dark: buildModeRecipe(tokens.dark).system.error
			},
			warning: {
				light: buildModeRecipe(tokens.light).system.warning,
				dark: buildModeRecipe(tokens.dark).system.warning
			},
			success: {
				light: buildModeRecipe(tokens.light).system.success,
				dark: buildModeRecipe(tokens.dark).system.success
			},
			info: {
				light: buildModeRecipe(tokens.light).system.info,
				dark: buildModeRecipe(tokens.dark).system.info
			}
		}
	};
}

function createAuditCheck(
	id: string,
	label: string,
	kind: 'text' | 'stroke' | 'shape',
	foreground: string,
	background: string,
	contrastThreshold: number,
	apcaThreshold: number
): ThemeAuditCheck {
	const assessment = measureForegroundOnSurface(foreground, background, {
		contrast: contrastThreshold,
		apca: apcaThreshold
	});

	return {
		...assessment,
		id,
		label,
		kind,
		contrastThreshold,
		apcaThreshold,
		passes: assessment.passesContrast && assessment.passesApca
	};
}

function buildThemeAudit(tokens: ThemeTokens): ThemeAudit {
	const lightBase = requireLayerValue(tokens.light, '--dry-color-bg-base');
	const darkBase = requireLayerValue(tokens.dark, '--dry-color-bg-base');
	const darkRaised = requireLayerValue(tokens.dark, '--dry-color-bg-raised');
	const darkOverlay = requireLayerValue(tokens.dark, '--dry-color-bg-overlay');
	const checks: ThemeAuditCheck[] = [
		createAuditCheck(
			'light-text-strong',
			'Text strong on light base',
			'text',
			requireLayerValue(tokens.light, '--dry-color-text-strong'),
			lightBase,
			4.5,
			60
		),
		createAuditCheck(
			'light-text-weak',
			'Text weak on light base',
			'text',
			requireLayerValue(tokens.light, '--dry-color-text-weak'),
			lightBase,
			4.5,
			60
		),
		createAuditCheck(
			'light-stroke-strong',
			'Stroke strong on light base',
			'stroke',
			requireLayerValue(tokens.light, '--dry-color-stroke-strong'),
			lightBase,
			3,
			45
		),
		createAuditCheck(
			'dark-text-strong-base',
			'Text strong on dark base',
			'text',
			requireLayerValue(tokens.dark, '--dry-color-text-strong'),
			darkBase,
			4.5,
			60
		),
		createAuditCheck(
			'dark-text-strong-raised',
			'Text strong on dark raised',
			'text',
			requireLayerValue(tokens.dark, '--dry-color-text-strong'),
			darkRaised,
			4.5,
			60
		),
		createAuditCheck(
			'dark-text-strong-overlay',
			'Text strong on dark overlay',
			'text',
			requireLayerValue(tokens.dark, '--dry-color-text-strong'),
			darkOverlay,
			4.5,
			60
		),
		createAuditCheck(
			'dark-text-weak-base',
			'Text weak on dark base',
			'text',
			requireLayerValue(tokens.dark, '--dry-color-text-weak'),
			darkBase,
			4.5,
			60
		),
		createAuditCheck(
			'dark-stroke-strong-base',
			'Stroke strong on dark base',
			'stroke',
			requireLayerValue(tokens.dark, '--dry-color-stroke-strong'),
			darkBase,
			3,
			45
		),
		createAuditCheck(
			'brand-shape-light',
			'Brand fill on light base',
			'shape',
			requireLayerValue(tokens.light, '--dry-color-fill-brand'),
			lightBase,
			3,
			45
		),
		createAuditCheck(
			'brand-shape-dark',
			'Brand fill on dark base',
			'shape',
			requireLayerValue(tokens.dark, '--dry-color-fill-brand'),
			darkBase,
			3,
			45
		),
		createAuditCheck(
			'brand-on-light',
			'On-brand text on brand fill (light)',
			'text',
			requireLayerValue(tokens.light, '--dry-color-on-brand'),
			requireLayerValue(tokens.light, '--dry-color-fill-brand'),
			4.5,
			60
		),
		createAuditCheck(
			'brand-on-dark',
			'On-brand text on brand fill (dark)',
			'text',
			requireLayerValue(tokens.dark, '--dry-color-on-brand'),
			requireLayerValue(tokens.dark, '--dry-color-fill-brand'),
			4.5,
			60
		)
	];

	for (const tone of ['error', 'warning', 'success', 'info'] as const) {
		checks.push(
			createAuditCheck(
				`${tone}-text-light`,
				`${tone} text on light base`,
				'text',
				requireLayerValue(tokens.light, `--dry-color-text-${tone}`),
				lightBase,
				4.5,
				60
			),
			createAuditCheck(
				`${tone}-text-dark`,
				`${tone} text on dark base`,
				'text',
				requireLayerValue(tokens.dark, `--dry-color-text-${tone}`),
				darkBase,
				4.5,
				60
			),
			createAuditCheck(
				`${tone}-shape-light`,
				`${tone} fill on light base`,
				'shape',
				requireLayerValue(tokens.light, `--dry-color-fill-${tone}`),
				lightBase,
				3,
				45
			),
			createAuditCheck(
				`${tone}-shape-dark`,
				`${tone} fill on dark base`,
				'shape',
				requireLayerValue(tokens.dark, `--dry-color-fill-${tone}`),
				darkBase,
				3,
				45
			),
			createAuditCheck(
				`${tone}-on-light`,
				`On-${tone} text on ${tone} fill (light)`,
				'text',
				requireLayerValue(tokens.light, `--dry-color-on-${tone}`),
				requireLayerValue(tokens.light, `--dry-color-fill-${tone}`),
				4.5,
				60
			),
			createAuditCheck(
				`${tone}-on-dark`,
				`On-${tone} text on ${tone} fill (dark)`,
				'text',
				requireLayerValue(tokens.dark, `--dry-color-on-${tone}`),
				requireLayerValue(tokens.dark, `--dry-color-fill-${tone}`),
				4.5,
				60
			)
		);
	}

	return {
		contextChecks: checks,
		allPass: checks.every((check) => check.passes)
	};
}

function buildPhotoTemperatureGuidance(hue: number): PhotoTemperatureGuidance {
	if (hue >= 330 || hue <= 90) {
		return {
			temperature: 'warm',
			recommendation:
				'Use warmer photography or golden grading so imagery feels consistent with the palette instead of fighting it.',
			accentDirection: 'Warm daylight, amber practicals, or subtle golden highlights.'
		};
	}

	if (hue >= 150 && hue <= 270) {
		return {
			temperature: 'cool',
			recommendation:
				'Lean towards cooler imagery and cleaner grading so the palette and photos share the same temperature.',
			accentDirection: 'Cool daylight, steel blues, cyan skies, or cooler interior lighting.'
		};
	}

	return {
		temperature: 'neutral',
		recommendation:
			'Keep photography temperature restrained and let the interface colour do the branding work.',
		accentDirection: 'Balanced whites, restrained colour casts, and minimal grading bias.'
	};
}

const THEME_ALIAS_MAP = {
	'Theme/Neutral/Text/Strong': 'neutral.text.strong',
	'Theme/Neutral/Text/Weak': 'neutral.text.weak',
	'Theme/Neutral/Text/Disabled': 'neutral.text.disabled',
	'Theme/Neutral/Icon': 'neutral.icon',
	'Theme/Neutral/Icon/Disabled': 'neutral.icon.disabled',
	'Theme/Neutral/Stroke/Strong': 'neutral.stroke.strong',
	'Theme/Neutral/Stroke/Weak': 'neutral.stroke.weak',
	'Theme/Neutral/Stroke/Focus': 'neutral.stroke.focus',
	'Theme/Neutral/Stroke/Selected': 'neutral.stroke.selected',
	'Theme/Neutral/Stroke/Disabled': 'neutral.stroke.disabled',
	'Theme/Neutral/Fill/Strong': 'neutral.fill.strong',
	'Theme/Neutral/Fill': 'neutral.fill.default',
	'Theme/Neutral/Fill/Weak': 'neutral.fill.weak',
	'Theme/Neutral/Fill/Weaker': 'neutral.fill.weaker',
	'Theme/Neutral/Fill/Hover': 'neutral.fill.hover',
	'Theme/Neutral/Fill/Active': 'neutral.fill.active',
	'Theme/Neutral/Fill/Selected': 'neutral.fill.selected',
	'Theme/Neutral/Fill/Disabled': 'neutral.fill.disabled',
	'Theme/Neutral/Fill/Overlay': 'neutral.fill.overlay',
	'Theme/Neutral/Inverse/Text': 'neutral.inverse.text.default',
	'Theme/Neutral/Inverse/Text/Weak': 'neutral.inverse.text.weak',
	'Theme/Neutral/Inverse/Text/Disabled': 'neutral.inverse.text.disabled',
	'Theme/Neutral/Inverse/Icon': 'neutral.inverse.icon.default',
	'Theme/Neutral/Inverse/Icon/Strong': 'neutral.inverse.icon.strong',
	'Theme/Neutral/Inverse/Icon/Weak': 'neutral.inverse.icon.weak',
	'Theme/Neutral/Inverse/Icon/Disabled': 'neutral.inverse.icon.disabled',
	'Theme/Neutral/Inverse/Stroke': 'neutral.inverse.stroke.default',
	'Theme/Neutral/Inverse/Stroke/Weak': 'neutral.inverse.stroke.weak',
	'Theme/Neutral/Inverse/Fill': 'neutral.inverse.fill.default',
	'Theme/Neutral/Inverse/Fill/Weak': 'neutral.inverse.fill.weak',
	'Theme/Neutral/Inverse/Fill/Hover': 'neutral.inverse.fill.hover',
	'Theme/Neutral/Inverse/Fill/Active': 'neutral.inverse.fill.active',
	'Theme/Neutral/Inverse/Fill/Disabled': 'neutral.inverse.fill.disabled',
	'Theme/Surface/Sunken': 'surface.sunken',
	'Theme/Surface/Base': 'surface.base',
	'Theme/Surface/Alternate': 'surface.alternate',
	'Theme/Surface/Raised': 'surface.raised',
	'Theme/Surface/Overlay': 'surface.overlay',
	'Theme/Surface/Brand': 'surface.brand',
	'Theme/Surface/Inverse': 'surface.inverse',
	'Theme/Surface/Utility/White': 'surface.utility.white',
	'Theme/Surface/Utility/Yellow': 'surface.utility.yellow',
	'Theme/Brand/Base': 'brand.base',
	'Theme/Brand/Text': 'brand.text',
	'Theme/Brand/Icon': 'brand.icon',
	'Theme/Brand/Fill': 'brand.fill',
	'Theme/Brand/Fill/Hover': 'brand.fill.hover',
	'Theme/Brand/Fill/Active': 'brand.fill.active',
	'Theme/Brand/Fill/Weak': 'brand.fill.weak',
	'Theme/Brand/Stroke': 'brand.stroke',
	'Theme/Brand/Stroke/Strong': 'brand.stroke.strong',
	'Theme/Brand/On': 'brand.on',
	'Theme/Brand/FocusRing': 'brand.focus-ring',
	'Theme/Error/Text': 'tone.error.text',
	'Theme/Error/Icon': 'tone.error.icon',
	'Theme/Error/Fill': 'tone.error.fill',
	'Theme/Error/Fill/Hover': 'tone.error.fill.hover',
	'Theme/Error/Fill/Weak': 'tone.error.fill.weak',
	'Theme/Error/Stroke': 'tone.error.stroke',
	'Theme/Error/Stroke/Strong': 'tone.error.stroke.strong',
	'Theme/Error/On': 'tone.error.on',
	'Theme/Warning/Text': 'tone.warning.text',
	'Theme/Warning/Icon': 'tone.warning.icon',
	'Theme/Warning/Fill': 'tone.warning.fill',
	'Theme/Warning/Fill/Hover': 'tone.warning.fill.hover',
	'Theme/Warning/Fill/Weak': 'tone.warning.fill.weak',
	'Theme/Warning/Stroke': 'tone.warning.stroke',
	'Theme/Warning/Stroke/Strong': 'tone.warning.stroke.strong',
	'Theme/Warning/On': 'tone.warning.on',
	'Theme/Success/Text': 'tone.success.text',
	'Theme/Success/Icon': 'tone.success.icon',
	'Theme/Success/Fill': 'tone.success.fill',
	'Theme/Success/Fill/Hover': 'tone.success.fill.hover',
	'Theme/Success/Fill/Weak': 'tone.success.fill.weak',
	'Theme/Success/Stroke': 'tone.success.stroke',
	'Theme/Success/Stroke/Strong': 'tone.success.stroke.strong',
	'Theme/Success/On': 'tone.success.on',
	'Theme/Info/Text': 'tone.info.text',
	'Theme/Info/Icon': 'tone.info.icon',
	'Theme/Info/Fill': 'tone.info.fill',
	'Theme/Info/Fill/Hover': 'tone.info.fill.hover',
	'Theme/Info/Fill/Weak': 'tone.info.fill.weak',
	'Theme/Info/Stroke': 'tone.info.stroke',
	'Theme/Info/Stroke/Strong': 'tone.info.stroke.strong',
	'Theme/Info/On': 'tone.info.on',
	'Theme/Shadow/Raised': 'shadow.raised',
	'Theme/Shadow/Overlay': 'shadow.overlay',
	'Theme/Overlay/Backdrop': 'overlay.backdrop',
	'Theme/Overlay/Backdrop/Strong': 'overlay.backdrop.strong'
} as const;

const SEMANTIC_ALIAS_MAP = {
	'--dry-color-text-strong': 'Theme/Neutral/Text/Strong',
	'--dry-color-text-weak': 'Theme/Neutral/Text/Weak',
	'--dry-color-text-disabled': 'Theme/Neutral/Text/Disabled',
	'--dry-color-icon': 'Theme/Neutral/Icon',
	'--dry-color-icon-disabled': 'Theme/Neutral/Icon/Disabled',
	'--dry-color-stroke-strong': 'Theme/Neutral/Stroke/Strong',
	'--dry-color-stroke-weak': 'Theme/Neutral/Stroke/Weak',
	'--dry-color-stroke-focus': 'Theme/Neutral/Stroke/Focus',
	'--dry-color-stroke-selected': 'Theme/Neutral/Stroke/Selected',
	'--dry-color-stroke-disabled': 'Theme/Neutral/Stroke/Disabled',
	'--dry-color-fill-strong': 'Theme/Neutral/Fill/Strong',
	'--dry-color-fill': 'Theme/Neutral/Fill',
	'--dry-color-fill-weak': 'Theme/Neutral/Fill/Weak',
	'--dry-color-fill-weaker': 'Theme/Neutral/Fill/Weaker',
	'--dry-color-fill-hover': 'Theme/Neutral/Fill/Hover',
	'--dry-color-fill-active': 'Theme/Neutral/Fill/Active',
	'--dry-color-fill-selected': 'Theme/Neutral/Fill/Selected',
	'--dry-color-fill-disabled': 'Theme/Neutral/Fill/Disabled',
	'--dry-color-fill-overlay': 'Theme/Neutral/Fill/Overlay',
	'--dry-color-text-inverse': 'Theme/Neutral/Inverse/Text',
	'--dry-color-text-inverse-weak': 'Theme/Neutral/Inverse/Text/Weak',
	'--dry-color-text-inverse-disabled': 'Theme/Neutral/Inverse/Text/Disabled',
	'--dry-color-icon-inverse': 'Theme/Neutral/Inverse/Icon',
	'--dry-color-icon-inverse-strong': 'Theme/Neutral/Inverse/Icon/Strong',
	'--dry-color-icon-inverse-weak': 'Theme/Neutral/Inverse/Icon/Weak',
	'--dry-color-icon-inverse-disabled': 'Theme/Neutral/Inverse/Icon/Disabled',
	'--dry-color-stroke-inverse': 'Theme/Neutral/Inverse/Stroke',
	'--dry-color-stroke-inverse-weak': 'Theme/Neutral/Inverse/Stroke/Weak',
	'--dry-color-fill-inverse': 'Theme/Neutral/Inverse/Fill',
	'--dry-color-fill-inverse-weak': 'Theme/Neutral/Inverse/Fill/Weak',
	'--dry-color-fill-inverse-hover': 'Theme/Neutral/Inverse/Fill/Hover',
	'--dry-color-fill-inverse-active': 'Theme/Neutral/Inverse/Fill/Active',
	'--dry-color-fill-inverse-disabled': 'Theme/Neutral/Inverse/Fill/Disabled',
	'--dry-color-bg-sunken': 'Theme/Surface/Sunken',
	'--dry-color-bg-base': 'Theme/Surface/Base',
	'--dry-color-bg-alternate': 'Theme/Surface/Alternate',
	'--dry-color-bg-raised': 'Theme/Surface/Raised',
	'--dry-color-bg-overlay': 'Theme/Surface/Overlay',
	'--dry-color-bg-brand': 'Theme/Surface/Brand',
	'--dry-color-bg-inverse': 'Theme/Surface/Inverse',
	'--dry-color-fill-white': 'Theme/Surface/Utility/White',
	'--dry-color-fill-yellow': 'Theme/Surface/Utility/Yellow',
	'--dry-color-brand': 'Theme/Brand/Base',
	'--dry-color-text-brand': 'Theme/Brand/Text',
	'--dry-color-icon-brand': 'Theme/Brand/Icon',
	'--dry-color-fill-brand': 'Theme/Brand/Fill',
	'--dry-color-fill-brand-hover': 'Theme/Brand/Fill/Hover',
	'--dry-color-fill-brand-active': 'Theme/Brand/Fill/Active',
	'--dry-color-fill-brand-weak': 'Theme/Brand/Fill/Weak',
	'--dry-color-stroke-brand': 'Theme/Brand/Stroke',
	'--dry-color-stroke-brand-strong': 'Theme/Brand/Stroke/Strong',
	'--dry-color-on-brand': 'Theme/Brand/On',
	'--dry-color-focus-ring': 'Theme/Brand/FocusRing',
	'--dry-color-text-error': 'Theme/Error/Text',
	'--dry-color-icon-error': 'Theme/Error/Icon',
	'--dry-color-fill-error': 'Theme/Error/Fill',
	'--dry-color-fill-error-hover': 'Theme/Error/Fill/Hover',
	'--dry-color-fill-error-weak': 'Theme/Error/Fill/Weak',
	'--dry-color-stroke-error': 'Theme/Error/Stroke',
	'--dry-color-stroke-error-strong': 'Theme/Error/Stroke/Strong',
	'--dry-color-on-error': 'Theme/Error/On',
	'--dry-color-text-warning': 'Theme/Warning/Text',
	'--dry-color-icon-warning': 'Theme/Warning/Icon',
	'--dry-color-fill-warning': 'Theme/Warning/Fill',
	'--dry-color-fill-warning-hover': 'Theme/Warning/Fill/Hover',
	'--dry-color-fill-warning-weak': 'Theme/Warning/Fill/Weak',
	'--dry-color-stroke-warning': 'Theme/Warning/Stroke',
	'--dry-color-stroke-warning-strong': 'Theme/Warning/Stroke/Strong',
	'--dry-color-on-warning': 'Theme/Warning/On',
	'--dry-color-text-success': 'Theme/Success/Text',
	'--dry-color-icon-success': 'Theme/Success/Icon',
	'--dry-color-fill-success': 'Theme/Success/Fill',
	'--dry-color-fill-success-hover': 'Theme/Success/Fill/Hover',
	'--dry-color-fill-success-weak': 'Theme/Success/Fill/Weak',
	'--dry-color-stroke-success': 'Theme/Success/Stroke',
	'--dry-color-stroke-success-strong': 'Theme/Success/Stroke/Strong',
	'--dry-color-on-success': 'Theme/Success/On',
	'--dry-color-text-info': 'Theme/Info/Text',
	'--dry-color-icon-info': 'Theme/Info/Icon',
	'--dry-color-fill-info': 'Theme/Info/Fill',
	'--dry-color-fill-info-hover': 'Theme/Info/Fill/Hover',
	'--dry-color-fill-info-weak': 'Theme/Info/Fill/Weak',
	'--dry-color-stroke-info': 'Theme/Info/Stroke',
	'--dry-color-stroke-info-strong': 'Theme/Info/Stroke/Strong',
	'--dry-color-on-info': 'Theme/Info/On',
	'--dry-shadow-raised': 'Theme/Shadow/Raised',
	'--dry-shadow-overlay': 'Theme/Shadow/Overlay',
	'--dry-color-overlay-backdrop': 'Theme/Overlay/Backdrop',
	'--dry-color-overlay-backdrop-strong': 'Theme/Overlay/Backdrop/Strong'
} as const;

function buildPrimitiveLayer(tokens: Record<string, string>): Record<string, string> {
	const primitives: Record<string, string> = {
		'neutral.text.strong': requireLayerValue(tokens, '--dry-color-text-strong'),
		'neutral.text.weak': requireLayerValue(tokens, '--dry-color-text-weak'),
		'neutral.text.disabled': requireLayerValue(tokens, '--dry-color-text-disabled'),
		'neutral.icon': requireLayerValue(tokens, '--dry-color-icon'),
		'neutral.icon.disabled': requireLayerValue(tokens, '--dry-color-icon-disabled'),
		'neutral.stroke.strong': requireLayerValue(tokens, '--dry-color-stroke-strong'),
		'neutral.stroke.weak': requireLayerValue(tokens, '--dry-color-stroke-weak'),
		'neutral.stroke.focus': requireLayerValue(tokens, '--dry-color-stroke-focus'),
		'neutral.stroke.selected': requireLayerValue(tokens, '--dry-color-stroke-selected'),
		'neutral.stroke.disabled': requireLayerValue(tokens, '--dry-color-stroke-disabled'),
		'neutral.fill.strong': requireLayerValue(tokens, '--dry-color-fill-strong'),
		'neutral.fill.default': requireLayerValue(tokens, '--dry-color-fill'),
		'neutral.fill.weak': requireLayerValue(tokens, '--dry-color-fill-weak'),
		'neutral.fill.weaker': requireLayerValue(tokens, '--dry-color-fill-weaker'),
		'neutral.fill.hover': requireLayerValue(tokens, '--dry-color-fill-hover'),
		'neutral.fill.active': requireLayerValue(tokens, '--dry-color-fill-active'),
		'neutral.fill.selected': requireLayerValue(tokens, '--dry-color-fill-selected'),
		'neutral.fill.disabled': requireLayerValue(tokens, '--dry-color-fill-disabled'),
		'neutral.fill.overlay': requireLayerValue(tokens, '--dry-color-fill-overlay'),
		'neutral.inverse.text.default': requireLayerValue(tokens, '--dry-color-text-inverse'),
		'neutral.inverse.text.weak': requireLayerValue(tokens, '--dry-color-text-inverse-weak'),
		'neutral.inverse.text.disabled': requireLayerValue(tokens, '--dry-color-text-inverse-disabled'),
		'neutral.inverse.icon.default': requireLayerValue(tokens, '--dry-color-icon-inverse'),
		'neutral.inverse.icon.strong': requireLayerValue(tokens, '--dry-color-icon-inverse-strong'),
		'neutral.inverse.icon.weak': requireLayerValue(tokens, '--dry-color-icon-inverse-weak'),
		'neutral.inverse.icon.disabled': requireLayerValue(tokens, '--dry-color-icon-inverse-disabled'),
		'neutral.inverse.stroke.default': requireLayerValue(tokens, '--dry-color-stroke-inverse'),
		'neutral.inverse.stroke.weak': requireLayerValue(tokens, '--dry-color-stroke-inverse-weak'),
		'neutral.inverse.fill.default': requireLayerValue(tokens, '--dry-color-fill-inverse'),
		'neutral.inverse.fill.weak': requireLayerValue(tokens, '--dry-color-fill-inverse-weak'),
		'neutral.inverse.fill.hover': requireLayerValue(tokens, '--dry-color-fill-inverse-hover'),
		'neutral.inverse.fill.active': requireLayerValue(tokens, '--dry-color-fill-inverse-active'),
		'neutral.inverse.fill.disabled': requireLayerValue(tokens, '--dry-color-fill-inverse-disabled'),
		'surface.sunken': requireLayerValue(tokens, '--dry-color-bg-sunken'),
		'surface.base': requireLayerValue(tokens, '--dry-color-bg-base'),
		'surface.alternate': requireLayerValue(tokens, '--dry-color-bg-alternate'),
		'surface.raised': requireLayerValue(tokens, '--dry-color-bg-raised'),
		'surface.overlay': requireLayerValue(tokens, '--dry-color-bg-overlay'),
		'surface.brand': requireLayerValue(tokens, '--dry-color-bg-brand'),
		'surface.inverse': requireLayerValue(tokens, '--dry-color-bg-inverse'),
		'surface.utility.white': requireLayerValue(tokens, '--dry-color-fill-white'),
		'surface.utility.yellow': requireLayerValue(tokens, '--dry-color-fill-yellow'),
		'brand.base': requireLayerValue(tokens, '--dry-color-brand'),
		'brand.text': requireLayerValue(tokens, '--dry-color-text-brand'),
		'brand.icon': requireLayerValue(tokens, '--dry-color-icon-brand'),
		'brand.fill': requireLayerValue(tokens, '--dry-color-fill-brand'),
		'brand.fill.hover': requireLayerValue(tokens, '--dry-color-fill-brand-hover'),
		'brand.fill.active': requireLayerValue(tokens, '--dry-color-fill-brand-active'),
		'brand.fill.weak': requireLayerValue(tokens, '--dry-color-fill-brand-weak'),
		'brand.stroke': requireLayerValue(tokens, '--dry-color-stroke-brand'),
		'brand.stroke.strong': requireLayerValue(tokens, '--dry-color-stroke-brand-strong'),
		'brand.on': requireLayerValue(tokens, '--dry-color-on-brand'),
		'brand.focus-ring': requireLayerValue(tokens, '--dry-color-focus-ring'),
		'shadow.raised': requireLayerValue(tokens, '--dry-shadow-raised'),
		'shadow.overlay': requireLayerValue(tokens, '--dry-shadow-overlay'),
		'overlay.backdrop': requireLayerValue(tokens, '--dry-color-overlay-backdrop'),
		'overlay.backdrop.strong': requireLayerValue(tokens, '--dry-color-overlay-backdrop-strong')
	};

	for (const tone of ['error', 'warning', 'success', 'info'] as const) {
		primitives[`tone.${tone}.text`] = requireLayerValue(tokens, `--dry-color-text-${tone}`);
		primitives[`tone.${tone}.icon`] = requireLayerValue(tokens, `--dry-color-icon-${tone}`);
		primitives[`tone.${tone}.fill`] = requireLayerValue(tokens, `--dry-color-fill-${tone}`);
		primitives[`tone.${tone}.fill.hover`] = requireLayerValue(
			tokens,
			`--dry-color-fill-${tone}-hover`
		);
		primitives[`tone.${tone}.fill.weak`] = requireLayerValue(
			tokens,
			`--dry-color-fill-${tone}-weak`
		);
		primitives[`tone.${tone}.stroke`] = requireLayerValue(tokens, `--dry-color-stroke-${tone}`);
		primitives[`tone.${tone}.stroke.strong`] = requireLayerValue(
			tokens,
			`--dry-color-stroke-${tone}-strong`
		);
		primitives[`tone.${tone}.on`] = requireLayerValue(tokens, `--dry-color-on-${tone}`);
	}

	return primitives;
}

function buildTransparentNeutralLadder(tokens: Record<string, string>): TransparentNeutralLadder {
	return {
		textStrong: requireLayerValue(tokens, '--dry-color-text-strong'),
		textWeak: requireLayerValue(tokens, '--dry-color-text-weak'),
		icon: requireLayerValue(tokens, '--dry-color-icon'),
		strokeStrong: requireLayerValue(tokens, '--dry-color-stroke-strong'),
		strokeWeak: requireLayerValue(tokens, '--dry-color-stroke-weak'),
		fill: requireLayerValue(tokens, '--dry-color-fill'),
		fillHover: requireLayerValue(tokens, '--dry-color-fill-hover'),
		fillActive: requireLayerValue(tokens, '--dry-color-fill-active')
	};
}

function buildTransparentBrandLadder(tokens: Record<string, string>): TransparentBrandLadder {
	return {
		brand: requireLayerValue(tokens, '--dry-color-brand'),
		text: requireLayerValue(tokens, '--dry-color-text-brand'),
		fill: requireLayerValue(tokens, '--dry-color-fill-brand'),
		fillHover: requireLayerValue(tokens, '--dry-color-fill-brand-hover'),
		fillActive: requireLayerValue(tokens, '--dry-color-fill-brand-active'),
		fillWeak: requireLayerValue(tokens, '--dry-color-fill-brand-weak'),
		stroke: requireLayerValue(tokens, '--dry-color-stroke-brand'),
		on: requireLayerValue(tokens, '--dry-color-on-brand'),
		focusRing: requireLayerValue(tokens, '--dry-color-focus-ring')
	};
}

function buildTransparentToneLadder(
	tokens: Record<string, string>,
	tone: SystemTone
): TransparentToneLadder {
	return {
		text: requireLayerValue(tokens, `--dry-color-text-${tone}`),
		fill: requireLayerValue(tokens, `--dry-color-fill-${tone}`),
		fillHover: requireLayerValue(tokens, `--dry-color-fill-${tone}-hover`),
		fillWeak: requireLayerValue(tokens, `--dry-color-fill-${tone}-weak`),
		stroke: requireLayerValue(tokens, `--dry-color-stroke-${tone}`),
		on: requireLayerValue(tokens, `--dry-color-on-${tone}`)
	};
}

function buildTransparentPrimitiveLadders(tokens: ThemeTokens): TransparentPrimitiveLadders {
	return {
		neutral: {
			light: buildTransparentNeutralLadder(tokens.light),
			dark: buildTransparentNeutralLadder(tokens.dark)
		},
		brand: {
			light: buildTransparentBrandLadder(tokens.light),
			dark: buildTransparentBrandLadder(tokens.dark)
		},
		system: {
			error: {
				light: buildTransparentToneLadder(tokens.light, 'error'),
				dark: buildTransparentToneLadder(tokens.dark, 'error')
			},
			warning: {
				light: buildTransparentToneLadder(tokens.light, 'warning'),
				dark: buildTransparentToneLadder(tokens.dark, 'warning')
			},
			success: {
				light: buildTransparentToneLadder(tokens.light, 'success'),
				dark: buildTransparentToneLadder(tokens.dark, 'success')
			},
			info: {
				light: buildTransparentToneLadder(tokens.light, 'info'),
				dark: buildTransparentToneLadder(tokens.dark, 'info')
			}
		}
	};
}

function resolveLayer(
	sources: Record<string, string>,
	mapping: Record<string, string>
): Record<string, ThemeReference> {
	const resolved: Record<string, ThemeReference> = {};

	for (const [name, source] of Object.entries(mapping)) {
		resolved[name] = {
			source,
			value: requireLayerValue(sources, source)
		};
	}

	return resolved;
}

function flattenResolvedLayer(layer: Record<string, ThemeReference>): Record<string, string> {
	const flattened: Record<string, string> = {};

	for (const [name, reference] of Object.entries(layer)) {
		flattened[name] = reference.value;
	}

	return flattened;
}

export function generateThemeModel(brand: BrandInput, options?: ThemeOptions): ThemeModel {
	const tokens = generateTheme(brand, options);
	const brandPolicy = buildBrandPolicy(brand, options);
	const primitives = {
		light: buildPrimitiveLayer(tokens.light),
		dark: buildPrimitiveLayer(tokens.dark)
	};
	const transparentPrimitives = buildTransparentPrimitiveLadders(tokens);
	const literalTransparentPrimitives = buildLiteralTransparentPrimitiveLadders(
		brandPolicy,
		options
	);
	const neutralHue = normalizeHue(options?.neutralHue ?? brandPolicy.interactive.resolvedInput.h);
	const solidPrimitives = buildSolidPrimitiveLadders(
		neutralHue,
		options?.neutralMode ?? 'monochromatic'
	);
	const interactionStates = buildInteractionStateRecipes(tokens);
	const audit = buildThemeAudit(tokens);
	const themeAliases = {
		light: resolveLayer(primitives.light, THEME_ALIAS_MAP),
		dark: resolveLayer(primitives.dark, THEME_ALIAS_MAP)
	};
	const semantic = {
		light: resolveLayer(flattenResolvedLayer(themeAliases.light), SEMANTIC_ALIAS_MAP),
		dark: resolveLayer(flattenResolvedLayer(themeAliases.dark), SEMANTIC_ALIAS_MAP)
	};

	return {
		primitives,
		transparentPrimitives,
		literalTransparentPrimitives,
		solidPrimitives,
		interactionStates,
		brandPolicy,
		audit,
		photoGuidance: buildPhotoTemperatureGuidance(brandPolicy.interactive.resolvedInput.h),
		_theme: themeAliases,
		semantic,
		tokens
	};
}

// ─── Full Palette Generation ──────────────────────────────────────────────────

/**
 * Generate a complete design token set for light and dark modes
 * from a brand color specified in HSB.
 *
 * @param brand.h  Hue, 0–360
 * @param brand.s  Saturation, 0–100
 * @param brand.b  Brightness, 0–100
 */
export function generateTheme(brand: BrandInput, options?: ThemeOptions): ThemeTokens {
	// Validate input ranges
	if (brand.h < 0 || brand.h > 360) throw new Error(`brand.h must be 0–360, got ${brand.h}`);
	if (brand.s < 0 || brand.s > 100) throw new Error(`brand.s must be 0–100, got ${brand.s}`);
	if (brand.b < 0 || brand.b > 100) throw new Error(`brand.b must be 0–100, got ${brand.b}`);

	const brandPolicy = buildBrandPolicy(brand, options);
	const interactiveBrand = brandPolicy.interactive.resolvedInput;

	// Normalize 0-100 → 0-1 for s and b; wrap hue into [0, 360)
	const normH = normalizeHue(interactiveBrand.h);
	const normS = interactiveBrand.s / 100;
	const normB = interactiveBrand.b / 100;

	// Convert brand HSB → HSL
	const brandHsl = hsbToHsl(normH, normS, normB);
	const H = brandHsl.h;
	const S = brandHsl.s;
	const L = brandHsl.l;
	const darkBrandBase = deriveDarkModeAccent(normH, normS, normB);
	const neutralMode = options?.neutralMode ?? 'monochromatic';
	// Hue used to tint neutrals — falls back to brand hue when not set.
	const neutralH = normalizeHue(options?.neutralHue ?? interactiveBrand.h);

	const light: Record<string, string> = {};
	const dark: Record<string, string> = {};

	// ── Neutrals (8 tokens) ──────────────────────────────────────────────────
	// Light: brand-hue-tinted for monochromatic mode, neutral black for neutral mode
	// Dark: white-based, hsla(0, 0%, 100%, alpha)
	// text-strong uses lightness 0.15; all others use 0.20
	const neutralAlphas = {
		'text-strong': { light: 0.9, dark: 1.0 },
		'text-weak': { light: 0.65, dark: 0.78 },
		icon: { light: 0.7, dark: 0.6 },
		'stroke-strong': { light: 0.7, dark: 0.6 },
		'stroke-weak': { light: 0.1, dark: 0.12 },
		fill: { light: 0.04, dark: 0.06 },
		'fill-hover': { light: 0.04, dark: 0.06 },
		'fill-active': { light: 0.1, dark: 0.12 }
	};

	for (const [name, alphas] of Object.entries(neutralAlphas)) {
		const lightness = name === 'text-strong' ? 0.15 : 0.2;
		const lightHue = neutralMode === 'neutral' ? 0 : neutralH;
		const lightSaturation = neutralMode === 'neutral' ? 0 : 1.0;
		light[`--dry-color-${name}`] = hsla(lightHue, lightSaturation, lightness, alphas.light);
		dark[`--dry-color-${name}`] = hsla(0, 0, 1.0, alphas.dark);
	}

	// ── Brand core and semantic helpers ──────────────────────────────────────

	// text-brand: iteratively darken (light) or lighten (dark) for 4.5:1 contrast
	const whiteLum = 1.0;
	const darkBgCss = neutralMode === 'neutral' ? hsl(0, 0, 0.1) : hsl(H, 0.3, 0.1);
	const darkBgLum =
		neutralMode === 'neutral' ? luminanceFromHsl(0, 0, 0.1) : luminanceFromHsl(H, 0.3, 0.1);

	const textBrandLight = adjustCssColorForReadability(
		H,
		S,
		L,
		'#ffffff',
		4.5,
		60,
		'darken',
		0.25,
		0.8
	);
	light['--dry-color-text-brand'] = hsl(textBrandLight.h, textBrandLight.s, textBrandLight.l);

	const textBrandDark = adjustCssColorForReadability(
		darkBrandBase.h,
		darkBrandBase.s,
		darkBrandBase.l,
		darkBgCss,
		4.5,
		60,
		'lighten',
		0.25,
		0.88
	);
	dark['--dry-color-text-brand'] = hsl(textBrandDark.h, textBrandDark.s, textBrandDark.l);

	const fillBrandLight = lightenOrDarkenFillForContrast(H, S, L, whiteLum, 3, 'darken');
	const fillBrandDark = lightenOrDarkenFillForContrast(
		darkBrandBase.h,
		darkBrandBase.s,
		darkBrandBase.l,
		darkBgLum,
		3,
		'lighten'
	);

	// fill-brand: use the resolved interactive brand and enforce a minimum 3:1 shape contrast.
	light['--dry-color-brand'] = hsl(fillBrandLight.h, fillBrandLight.s, fillBrandLight.l);
	dark['--dry-color-brand'] = hsl(fillBrandDark.h, fillBrandDark.s, fillBrandDark.l);
	light['--dry-color-fill-brand'] = hsl(fillBrandLight.h, fillBrandLight.s, fillBrandLight.l);
	dark['--dry-color-fill-brand'] = hsl(fillBrandDark.h, fillBrandDark.s, fillBrandDark.l);
	// fill-brand-hover: darken in light mode, lighten in dark mode.
	light['--dry-color-fill-brand-hover'] = hsl(
		fillBrandLight.h,
		fillBrandLight.s,
		clamp(fillBrandLight.l - 0.08, 0, 1)
	);
	dark['--dry-color-fill-brand-hover'] = hsl(
		fillBrandDark.h,
		fillBrandDark.s,
		clamp(fillBrandDark.l + 0.08, 0, 1)
	);

	// fill-brand-active: L-14% light, L-6% dark (pressed darkens in both modes)
	light['--dry-color-fill-brand-active'] = hsl(
		fillBrandLight.h,
		fillBrandLight.s,
		clamp(fillBrandLight.l - 0.14, 0, 1)
	);
	dark['--dry-color-fill-brand-active'] = hsl(
		fillBrandDark.h,
		fillBrandDark.s,
		clamp(fillBrandDark.l - 0.06, 0, 1)
	);

	// fill-brand-weak: keep the semantic weak brand background separate from the literal primitive ladder.
	light['--dry-color-fill-brand-weak'] = hsla(
		fillBrandLight.h,
		fillBrandLight.s,
		fillBrandLight.l,
		0.1
	);
	dark['--dry-color-fill-brand-weak'] = hsla(
		fillBrandDark.h,
		fillBrandDark.s,
		fillBrandDark.l,
		0.15
	);

	// stroke-brand: keep the brand outline visible against both base surfaces.
	light['--dry-color-stroke-brand'] = hsla(
		fillBrandLight.h,
		fillBrandLight.s,
		fillBrandLight.l,
		0.5
	);
	dark['--dry-color-stroke-brand'] = hsla(fillBrandDark.h, fillBrandDark.s, fillBrandDark.l, 0.5);

	// on-brand: white if whiteContrast>=4.5, else dark tint
	light['--dry-color-on-brand'] = pickOnColor(fillBrandLight.h, fillBrandLight.s, fillBrandLight.l);
	dark['--dry-color-on-brand'] = pickOnColor(fillBrandDark.h, fillBrandDark.s, fillBrandDark.l);

	// focus-ring: light uses hsla(H,S,L,0.4); dark bumps L by +10%
	light['--dry-color-focus-ring'] = hsla(fillBrandLight.h, fillBrandLight.s, fillBrandLight.l, 0.4);
	dark['--dry-color-focus-ring'] = hsla(
		fillBrandDark.h,
		fillBrandDark.s,
		clamp(fillBrandDark.l + 0.1, 0, 1),
		0.4
	);
	light['--dry-color-stroke-brand-strong'] = hsla(
		fillBrandLight.h,
		fillBrandLight.s,
		fillBrandLight.l,
		0.8
	);
	dark['--dry-color-stroke-brand-strong'] = hsla(
		fillBrandDark.h,
		fillBrandDark.s,
		fillBrandDark.l,
		0.8
	);
	light['--dry-color-icon-brand'] = light['--dry-color-stroke-brand-strong'];
	dark['--dry-color-icon-brand'] = dark['--dry-color-stroke-brand-strong'];

	// ── Background core plus semantic surface helpers ────────────────────────
	light['--dry-color-bg-base'] = '#ffffff';
	light['--dry-color-bg-raised'] = '#ffffff';
	light['--dry-color-bg-overlay'] = '#ffffff';

	if (options?.darkBg?.base) {
		dark['--dry-color-bg-base'] = options.darkBg.base;
	} else {
		dark['--dry-color-bg-base'] =
			neutralMode === 'neutral' ? hsl(0, 0, 0.1) : hsl(neutralH, 0.3, 0.1);
	}
	if (options?.darkBg?.raised) {
		dark['--dry-color-bg-raised'] = options.darkBg.raised;
	} else {
		dark['--dry-color-bg-raised'] =
			neutralMode === 'neutral' ? hsl(0, 0, 0.15) : hsl(neutralH, 0.25, 0.15);
	}
	if (options?.darkBg?.overlay) {
		dark['--dry-color-bg-overlay'] = options.darkBg.overlay;
	} else {
		dark['--dry-color-bg-overlay'] =
			neutralMode === 'neutral' ? hsl(0, 0, 0.2) : hsl(neutralH, 0.2, 0.2);
	}

	const solidPrimitives = buildSolidPrimitiveLadders(neutralH, neutralMode);
	const lightTextStrong = requireLayerValue(light, '--dry-color-text-strong');
	const lightTextWeak = requireLayerValue(light, '--dry-color-text-weak');
	const lightStrokeStrong = requireLayerValue(light, '--dry-color-stroke-strong');
	const lightStrokeWeak = requireLayerValue(light, '--dry-color-stroke-weak');
	const lightFill = requireLayerValue(light, '--dry-color-fill');
	const lightBrand = requireLayerValue(light, '--dry-color-brand');
	const lightFillBrand = requireLayerValue(light, '--dry-color-fill-brand');
	const darkTextStrong = requireLayerValue(dark, '--dry-color-text-strong');
	const darkTextWeak = requireLayerValue(dark, '--dry-color-text-weak');
	const darkStrokeStrong = requireLayerValue(dark, '--dry-color-stroke-strong');
	const darkStrokeWeak = requireLayerValue(dark, '--dry-color-stroke-weak');
	const darkFill = requireLayerValue(dark, '--dry-color-fill');
	const darkBrand = requireLayerValue(dark, '--dry-color-brand');
	const darkFillBrand = requireLayerValue(dark, '--dry-color-fill-brand');
	const darkBgBase = requireLayerValue(dark, '--dry-color-bg-base');
	const lightBgBase = requireLayerValue(light, '--dry-color-bg-base');

	light['--dry-color-bg-sunken'] = solidPrimitives.grey.light.roles.sunken;
	light['--dry-color-bg-alternate'] = solidPrimitives.grey.light.roles.sunken;
	light['--dry-color-bg-brand'] = lightFillBrand;
	light['--dry-color-bg-inverse'] = darkBgBase;

	dark['--dry-color-bg-sunken'] = solidPrimitives.grey.dark.roles.sunken;
	dark['--dry-color-bg-alternate'] = solidPrimitives.grey.dark.roles.sunken;
	dark['--dry-color-bg-brand'] = darkFillBrand;
	dark['--dry-color-bg-inverse'] = lightBgBase;

	const lightNeutralHue = neutralMode === 'neutral' ? 0 : H;
	const lightNeutralSaturation = neutralMode === 'neutral' ? 0 : 1.0;
	const lightWeakerFill = hsla(lightNeutralHue, lightNeutralSaturation, 0.2, 0.02);
	const darkWeakerFill = hsla(0, 0, 1.0, 0.03);

	light['--dry-color-text-disabled'] = lightStrokeWeak;
	dark['--dry-color-text-disabled'] = darkStrokeWeak;
	light['--dry-color-text-inverse'] = darkTextStrong;
	light['--dry-color-text-inverse-weak'] = darkTextWeak;
	light['--dry-color-text-inverse-disabled'] = darkStrokeWeak;
	dark['--dry-color-text-inverse'] = lightTextStrong;
	dark['--dry-color-text-inverse-weak'] = lightTextWeak;
	dark['--dry-color-text-inverse-disabled'] = lightStrokeWeak;

	light['--dry-color-icon-disabled'] = lightStrokeWeak;
	dark['--dry-color-icon-disabled'] = darkStrokeWeak;
	light['--dry-color-icon-inverse'] = darkStrokeStrong;
	light['--dry-color-icon-inverse-strong'] = darkTextStrong;
	light['--dry-color-icon-inverse-weak'] = darkTextWeak;
	light['--dry-color-icon-inverse-disabled'] = darkStrokeWeak;
	dark['--dry-color-icon-inverse'] = lightStrokeStrong;
	dark['--dry-color-icon-inverse-strong'] = lightTextStrong;
	dark['--dry-color-icon-inverse-weak'] = lightTextWeak;
	dark['--dry-color-icon-inverse-disabled'] = lightStrokeWeak;

	light['--dry-color-stroke-focus'] = lightBrand;
	light['--dry-color-stroke-selected'] = lightBrand;
	light['--dry-color-stroke-disabled'] = lightStrokeWeak;
	light['--dry-color-stroke-inverse'] = darkStrokeStrong;
	light['--dry-color-stroke-inverse-weak'] = darkStrokeWeak;
	dark['--dry-color-stroke-focus'] = darkBrand;
	dark['--dry-color-stroke-selected'] = darkBrand;
	dark['--dry-color-stroke-disabled'] = darkStrokeWeak;
	dark['--dry-color-stroke-inverse'] = lightStrokeStrong;
	dark['--dry-color-stroke-inverse-weak'] = lightStrokeWeak;

	light['--dry-color-fill-strong'] = lightTextStrong;
	light['--dry-color-fill-weak'] = lightFill;
	light['--dry-color-fill-weaker'] = lightWeakerFill;
	light['--dry-color-fill-selected'] = lightFillBrand;
	light['--dry-color-fill-disabled'] = lightStrokeWeak;
	light['--dry-color-fill-overlay'] = lightStrokeStrong;
	light['--dry-color-fill-inverse'] = darkTextStrong;
	light['--dry-color-fill-inverse-weak'] = darkFill;
	light['--dry-color-fill-inverse-hover'] = darkFill;
	light['--dry-color-fill-inverse-active'] = darkStrokeWeak;
	light['--dry-color-fill-inverse-disabled'] = darkWeakerFill;
	light['--dry-color-fill-white'] = '#ffffff';
	light['--dry-color-fill-yellow'] = solidPrimitives.yellow.light['1000'];

	dark['--dry-color-fill-strong'] = darkTextStrong;
	dark['--dry-color-fill-weak'] = darkFill;
	dark['--dry-color-fill-weaker'] = darkWeakerFill;
	dark['--dry-color-fill-selected'] = darkFillBrand;
	dark['--dry-color-fill-disabled'] = darkStrokeWeak;
	dark['--dry-color-fill-overlay'] = darkStrokeStrong;
	dark['--dry-color-fill-inverse'] = lightTextStrong;
	dark['--dry-color-fill-inverse-weak'] = lightFill;
	dark['--dry-color-fill-inverse-hover'] = lightFill;
	dark['--dry-color-fill-inverse-active'] = lightStrokeWeak;
	dark['--dry-color-fill-inverse-disabled'] = lightWeakerFill;
	dark['--dry-color-fill-white'] = '#ffffff';
	dark['--dry-color-fill-yellow'] = solidPrimitives.yellow.dark['1000'];

	// ── Status core plus semantic helpers ────────────────────────────────────
	const statusHues = {
		error: options?.statusHues?.error ?? 0,
		warning: options?.statusHues?.warning ?? 40,
		success: options?.statusHues?.success ?? 145,
		info: options?.statusHues?.info ?? 210
	};

	const bgLumLight = 1.0; // white background
	const bgLumDark =
		neutralMode === 'neutral' ? luminanceFromHsl(0, 0, 0.1) : luminanceFromHsl(H, 0.3, 0.1);

	for (const [tone, hue] of Object.entries(statusHues)) {
		// fill-{tone}: start from the Practical UI hue family, then enforce minimum shape contrast.
		const fillLightBase = adjustCssColorForReadability(
			hue,
			0.7,
			0.5,
			'#ffffff',
			3,
			45,
			'darken',
			0.1,
			0.8
		);
		const fillLightPair = adjustFillForOnColor(
			fillLightBase,
			'#ffffff',
			3,
			45,
			'darken',
			0.08,
			0.8
		);

		const fillDarkBase = adjustCssColorForReadability(
			hue,
			0.65,
			0.55,
			darkBgCss,
			3,
			45,
			'lighten',
			0.2,
			0.92
		);
		const fillDarkPair = adjustFillForOnColor(fillDarkBase, darkBgCss, 3, 45, 'lighten', 0.2, 0.96);
		const fillLight = fillLightPair.fill;
		const fillDark = fillDarkPair.fill;

		light[`--dry-color-fill-${tone}`] = hsl(fillLight.h, fillLight.s, fillLight.l);
		dark[`--dry-color-fill-${tone}`] = hsl(fillDark.h, fillDark.s, fillDark.l);

		// text-{tone}: meet both WCAG and APCA on the surrounding surface.
		const textLight = adjustCssColorForReadability(
			hue,
			fillLight.s,
			fillLight.l,
			'#ffffff',
			4.5,
			60,
			'darken',
			0.1,
			0.8
		);
		light[`--dry-color-text-${tone}`] = hsl(textLight.h, textLight.s, textLight.l);

		const textDark = adjustCssColorForReadability(
			hue,
			fillDark.s,
			fillDark.l,
			darkBgCss,
			4.5,
			60,
			'lighten',
			0.2,
			0.92
		);
		dark[`--dry-color-text-${tone}`] = hsl(textDark.h, textDark.s, textDark.l);

		// fill-{tone}-hover: 8% darker light, 7% darker dark
		light[`--dry-color-fill-${tone}-hover`] = hsl(
			fillLight.h,
			fillLight.s,
			clamp(fillLight.l - 0.08, 0, 1)
		);
		dark[`--dry-color-fill-${tone}-hover`] = hsl(
			fillDark.h,
			fillDark.s,
			clamp(fillDark.l - 0.07, 0, 1)
		);

		// fill-{tone}-weak: hsla with 0.10/0.15 alpha
		light[`--dry-color-fill-${tone}-weak`] = hsla(fillLight.h, fillLight.s, fillLight.l, 0.1);
		dark[`--dry-color-fill-${tone}-weak`] = hsla(fillDark.h, fillDark.s, fillDark.l, 0.15);

		// stroke-{tone}: use a readable outline colour close to the tone family.
		const strokeLight = adjustCssColorForReadability(
			hue,
			0.5,
			0.7,
			'#ffffff',
			3,
			30,
			'darken',
			0.18,
			0.8
		);
		const strokeDark = adjustCssColorForReadability(
			hue,
			0.45,
			0.55,
			darkBgCss,
			3,
			30,
			'lighten',
			0.2,
			0.92
		);
		light[`--dry-color-stroke-${tone}`] = hsl(strokeLight.h, strokeLight.s, strokeLight.l);
		dark[`--dry-color-stroke-${tone}`] = hsl(strokeDark.h, strokeDark.s, strokeDark.l);
		const lightToneStrokeStrong = hsla(fillLight.h, fillLight.s, fillLight.l, 0.8);
		const darkToneStrokeStrong = hsla(fillDark.h, fillDark.s, fillDark.l, 0.8);
		light[`--dry-color-stroke-${tone}-strong`] = lightToneStrokeStrong;
		dark[`--dry-color-stroke-${tone}-strong`] = darkToneStrokeStrong;
		light[`--dry-color-icon-${tone}`] = lightToneStrokeStrong;
		dark[`--dry-color-icon-${tone}`] = darkToneStrokeStrong;

		// on-{tone}: white if contrast >= 4.5 vs fill, else dark tint
		light[`--dry-color-on-${tone}`] = fillLightPair.onColor;
		dark[`--dry-color-on-${tone}`] = fillDarkPair.onColor;
	}

	// ── Shadows (2 tokens) ───────────────────────────────────────────────────
	// Full box-shadow shorthand with brand-hue-tinted colors.
	// Light: subtle alpha. Dark: stronger alpha.
	light['--dry-shadow-raised'] =
		`0 1px 3px hsla(${Math.round(H)}, 20%, 20%, 0.08), 0 1px 2px hsla(${Math.round(H)}, 20%, 20%, 0.06)`;
	light['--dry-shadow-overlay'] =
		`0 8px 24px hsla(${Math.round(H)}, 20%, 20%, 0.12), 0 2px 8px hsla(${Math.round(H)}, 20%, 20%, 0.08)`;
	dark['--dry-shadow-raised'] =
		`0 1px 3px hsla(${Math.round(H)}, 30%, 5%, 0.4), 0 1px 2px hsla(${Math.round(H)}, 30%, 5%, 0.3)`;
	dark['--dry-shadow-overlay'] =
		`0 8px 24px hsla(${Math.round(H)}, 30%, 5%, 0.5), 0 2px 8px hsla(${Math.round(H)}, 30%, 5%, 0.4)`;

	// ── Overlay Backdrops (2 tokens) ─────────────────────────────────────────
	light['--dry-color-overlay-backdrop'] = 'hsla(0, 0%, 0%, 0.4)';
	light['--dry-color-overlay-backdrop-strong'] = 'hsla(0, 0%, 0%, 0.6)';
	dark['--dry-color-overlay-backdrop'] = 'hsla(0, 0%, 0%, 0.6)';
	dark['--dry-color-overlay-backdrop-strong'] = 'hsla(0, 0%, 0%, 0.75)';

	return { light, dark };
}
