// DryUI Theme Diagnosis Engine
// Pure functions, no MCP dependency — same pattern as reviewer.ts.

import { ruleMessage, ruleSuggestedFix } from '@dryui/lint/rule-catalog';
import { buildLineOffsets, lineAtOffset } from './utils.js';
import { COLOR_PAIRINGS, REQUIRED_TOKENS, SURFACE_TOKENS } from './theme-tokens.js';

function capture(match: RegExpMatchArray, index: number): string {
	const value = match[index];
	if (value === undefined) throw new Error(`Missing capture group ${index}`);
	return value;
}

export interface DiagnoseIssue {
	readonly severity: 'error' | 'warning' | 'info';
	readonly code: string;
	readonly variable: string;
	readonly value?: string;
	readonly message: string;
	readonly fix: string | null;
}

export interface DiagnoseResult {
	readonly variables: { readonly found: number; readonly required: number; readonly extra: number };
	readonly issues: DiagnoseIssue[];
	readonly summary: string;
}

interface VarEntry {
	readonly value: string;
	readonly line: number;
}

interface ResolvedVar {
	readonly original: string;
	readonly resolved: string;
	readonly line: number;
}

// Constants

const FULL_THEME_THRESHOLD = 4;

const NAMED_COLORS: ReadonlySet<string> = new Set([
	// CSS Level 1-4 named colors (complete list)
	'aliceblue',
	'antiquewhite',
	'aqua',
	'aquamarine',
	'azure',
	'beige',
	'bisque',
	'black',
	'blanchedalmond',
	'blue',
	'blueviolet',
	'brown',
	'burlywood',
	'cadetblue',
	'chartreuse',
	'chocolate',
	'coral',
	'cornflowerblue',
	'cornsilk',
	'crimson',
	'cyan',
	'darkblue',
	'darkcyan',
	'darkgoldenrod',
	'darkgray',
	'darkgreen',
	'darkgrey',
	'darkkhaki',
	'darkmagenta',
	'darkolivegreen',
	'darkorange',
	'darkorchid',
	'darkred',
	'darksalmon',
	'darkseagreen',
	'darkslateblue',
	'darkslategray',
	'darkslategrey',
	'darkturquoise',
	'darkviolet',
	'deeppink',
	'deepskyblue',
	'dimgray',
	'dimgrey',
	'dodgerblue',
	'firebrick',
	'floralwhite',
	'forestgreen',
	'fuchsia',
	'gainsboro',
	'ghostwhite',
	'gold',
	'goldenrod',
	'gray',
	'green',
	'greenyellow',
	'grey',
	'honeydew',
	'hotpink',
	'indianred',
	'indigo',
	'ivory',
	'khaki',
	'lavender',
	'lavenderblush',
	'lawngreen',
	'lemonchiffon',
	'lightblue',
	'lightcoral',
	'lightcyan',
	'lightgoldenrodyellow',
	'lightgray',
	'lightgreen',
	'lightgrey',
	'lightpink',
	'lightsalmon',
	'lightseagreen',
	'lightskyblue',
	'lightslategray',
	'lightslategrey',
	'lightsteelblue',
	'lightyellow',
	'lime',
	'limegreen',
	'linen',
	'magenta',
	'maroon',
	'mediumaquamarine',
	'mediumblue',
	'mediumorchid',
	'mediumpurple',
	'mediumseagreen',
	'mediumslateblue',
	'mediumspringgreen',
	'mediumturquoise',
	'mediumvioletred',
	'midnightblue',
	'mintcream',
	'mistyrose',
	'moccasin',
	'navajowhite',
	'navy',
	'oldlace',
	'olive',
	'olivedrab',
	'orange',
	'orangered',
	'orchid',
	'palegoldenrod',
	'palegreen',
	'paleturquoise',
	'palevioletred',
	'papayawhip',
	'peachpuff',
	'peru',
	'pink',
	'plum',
	'powderblue',
	'purple',
	'rebeccapurple',
	'red',
	'rosybrown',
	'royalblue',
	'saddlebrown',
	'salmon',
	'sandybrown',
	'seagreen',
	'seashell',
	'sienna',
	'silver',
	'skyblue',
	'slateblue',
	'slategray',
	'slategrey',
	'snow',
	'springgreen',
	'steelblue',
	'tan',
	'teal',
	'thistle',
	'tomato',
	'turquoise',
	'violet',
	'wheat',
	'white',
	'whitesmoke',
	'yellow',
	'yellowgreen',
	// Special values
	'transparent',
	'currentcolor',
	'inherit'
]);

// CSS preprocessing

function stripComments(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Variable extraction

function extractDryVariables(cleaned: string): Map<string, VarEntry> {
	const vars = new Map<string, VarEntry>();
	const regex = /(--dry-[a-zA-Z0-9-]+)\s*:\s*([^;]*);/g;

	const lineOffsets = buildLineOffsets(cleaned);

	for (const match of cleaned.matchAll(regex)) {
		const name = capture(match, 1);
		const value = (match[2] ?? '').trim();
		const line = lineAtOffset(lineOffsets, match.index ?? 0);
		vars.set(name, { value, line });
	}

	return vars;
}

function extractAllVariables(cleaned: string): Map<string, string> {
	const vars = new Map<string, string>();
	const regex = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]*);/g;

	for (const match of cleaned.matchAll(regex)) {
		const name = capture(match, 1);
		const value = (match[2] ?? '').trim();
		vars.set(name, value);
	}

	return vars;
}

// Var resolution

/**
 * Parse `var(--name)` or `var(--name, fallback)` handling nested parentheses
 * in the fallback (e.g., `var(--x, rgba(0,0,0,0.5))`).
 */
function parseVarFunc(value: string): { refName: string; fallback: string | null } | null {
	const prefix = /^var\(\s*/.exec(value);
	if (!prefix) return null;

	let pos = prefix[0].length;
	// Extract --name
	const nameMatch = /^(--[a-zA-Z0-9-]+)/.exec(value.slice(pos));
	if (!nameMatch) return null;

	const refName = capture(nameMatch, 1);
	pos += refName.length;

	// Skip whitespace
	while (pos < value.length && /\s/.test(value[pos]!)) pos++;

	// No fallback — just closing paren
	if (value[pos] === ')') return { refName, fallback: null };

	// Expect comma for fallback
	if (value[pos] !== ',') return { refName, fallback: null };
	pos++; // skip comma

	// Skip whitespace
	while (pos < value.length && /\s/.test(value[pos]!)) pos++;

	// Extract fallback respecting nested parentheses
	let depth = 1; // we're inside the outer var(
	const fallbackStart = pos;
	while (pos < value.length && depth > 0) {
		if (value[pos] === '(') depth++;
		else if (value[pos] === ')') depth--;
		if (depth > 0) pos++;
	}

	const fallback = value.slice(fallbackStart, pos).trim();
	return { refName, fallback: fallback || null };
}

function resolveVarReferences(
	dryVars: Map<string, VarEntry>,
	allVars: Map<string, string>
): Map<string, ResolvedVar> {
	const resolved = new Map<string, ResolvedVar>();

	for (const [name, entry] of dryVars) {
		const parsed = parseVarFunc(entry.value);
		if (!parsed) {
			resolved.set(name, { original: entry.value, resolved: entry.value, line: entry.line });
			continue;
		}

		const { refName, fallback } = parsed;
		const refValue = allVars.get(refName);

		if (refValue !== undefined) {
			resolved.set(name, { original: entry.value, resolved: refValue, line: entry.line });
		} else if (fallback !== null) {
			resolved.set(name, { original: entry.value, resolved: fallback, line: entry.line });
		} else {
			// Unresolvable — keep original
			resolved.set(name, { original: entry.value, resolved: entry.value, line: entry.line });
		}
	}

	return resolved;
}

// Value classification

type ValueType = 'color' | 'length' | 'time' | 'shadow' | 'font' | 'other';

function classifyValue(value: string): ValueType {
	const v = value.trim();
	if (!v) return 'other';

	// Color checks
	if (/^#([0-9a-fA-F]{3,8})$/.test(v)) return 'color';
	if (/^rgba?\s*\(/.test(v)) return 'color';
	if (/^hsla?\s*\(/.test(v)) return 'color';
	if (/^color-mix\s*\(/.test(v)) return 'color';
	if (NAMED_COLORS.has(v.toLowerCase())) return 'color';
	if (/^(?:oklch|lch|lab|oklab|color)\s*\(/.test(v)) return 'color';

	// Length checks
	if (/^-?[\d.]+(?:px|rem|em|%|vw|vh)$/.test(v)) return 'length';

	// Time checks
	if (/^-?[\d.]+(?:ms|s)$/.test(v)) return 'time';

	// Shadow: multiple length values (simplified heuristic for shadow shorthand)
	if (/^-?[\d.]+(?:px|rem|em)\s+-?[\d.]+(?:px|rem|em)/.test(v)) return 'shadow';

	// Font: quoted strings or comma-separated names
	if (/^["']/.test(v)) return 'font';
	if (/,\s*["']?[a-zA-Z]/.test(v) && !/^(rgb|hsl)/.test(v)) return 'font';

	return 'other';
}

// Color parsing

interface RGB {
	readonly r: number;
	readonly g: number;
	readonly b: number;
}

function parseColor(value: string): RGB | null {
	const v = value.trim();

	// Hex: #rgb, #rrggbb, #rrggbbaa
	const hexMatch = v.match(/^#([0-9a-fA-F]{3,8})$/);
	if (hexMatch) {
		const hex = capture(hexMatch, 1);
		if (hex.length === 3) {
			return {
				r: parseInt(hex.charAt(0) + hex.charAt(0), 16),
				g: parseInt(hex.charAt(1) + hex.charAt(1), 16),
				b: parseInt(hex.charAt(2) + hex.charAt(2), 16)
			};
		}
		if (hex.length === 6 || hex.length === 8) {
			return {
				r: parseInt(hex.slice(0, 2), 16),
				g: parseInt(hex.slice(2, 4), 16),
				b: parseInt(hex.slice(4, 6), 16)
			};
		}
		return null;
	}

	// rgb() / rgba()
	const rgbMatch = v.match(/^rgba?\(\s*(\d+)\s*[,/]\s*(\d+)\s*[,/]\s*(\d+)/);
	if (rgbMatch) {
		return {
			r: parseInt(capture(rgbMatch, 1), 10),
			g: parseInt(capture(rgbMatch, 2), 10),
			b: parseInt(capture(rgbMatch, 3), 10)
		};
	}

	// hsl() / hsla()
	const hslMatch = v.match(/^hsla?\(\s*(\d+)\s*[,/]\s*([\d.]+)%?\s*[,/]\s*([\d.]+)%?/);
	if (hslMatch) {
		const h = parseInt(capture(hslMatch, 1), 10);
		const s = parseFloat(capture(hslMatch, 2)) / 100;
		const l = parseFloat(capture(hslMatch, 3)) / 100;
		return hslToRgb(h, s, l);
	}

	// Modern rgb: rgb(255 0 0) or rgb(255 0 0 / 0.5)
	const modernRgbMatch = v.match(/^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)/);
	if (modernRgbMatch) {
		return {
			r: parseInt(capture(modernRgbMatch, 1), 10),
			g: parseInt(capture(modernRgbMatch, 2), 10),
			b: parseInt(capture(modernRgbMatch, 3), 10)
		};
	}

	// Modern hsl: hsl(217 91% 60%) or hsl(217 91% 60% / 0.5)
	const modernHslMatch = v.match(/^hsla?\(\s*(\d+)\s+([\d.]+)%?\s+([\d.]+)%?/);
	if (modernHslMatch) {
		const h = parseInt(capture(modernHslMatch, 1), 10);
		const s = parseFloat(capture(modernHslMatch, 2)) / 100;
		const l = parseFloat(capture(modernHslMatch, 3)) / 100;
		return hslToRgb(h, s, l);
	}

	// Unparseable (color-mix, var(), etc.)
	return null;
}

function hslToRgb(h: number, s: number, l: number): RGB {
	const hue = ((h % 360) + 360) % 360;

	if (s === 0) {
		const val = Math.round(l * 255);
		return { r: val, g: val, b: val };
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;

	function hueToChannel(t: number): number {
		let tc = t;
		if (tc < 0) tc += 1;
		if (tc > 1) tc -= 1;
		if (tc < 1 / 6) return p + (q - p) * 6 * tc;
		if (tc < 1 / 2) return q;
		if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
		return p;
	}

	return {
		r: Math.round(hueToChannel(hue / 360 + 1 / 3) * 255),
		g: Math.round(hueToChannel(hue / 360) * 255),
		b: Math.round(hueToChannel(hue / 360 - 1 / 3) * 255)
	};
}

function brightness(r: number, g: number, b: number): number {
	return (r * 299 + g * 587 + b * 114) / 1000;
}

// Alpha extraction

function extractAlpha(value: string): number {
	const v = value.trim();

	// Modern rgb/rgba: rgb(255 0 0 / 0.5)
	const modernRgbMatch = v.match(/^rgba?\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\/\s*([\d.]+%?)\s*\)/);
	if (modernRgbMatch) {
		const val = capture(modernRgbMatch, 1);
		return val.endsWith('%') ? parseFloat(val) / 100 : parseFloat(val);
	}

	// Modern hsl/hsla: hsl(217 91% 60% / 0.5)
	const modernHslMatch = v.match(/^hsla?\(\s*[\d.]+\s+[\d.]+%?\s+[\d.]+%?\s*\/\s*([\d.]+%?)\s*\)/);
	if (modernHslMatch) {
		const val = capture(modernHslMatch, 1);
		return val.endsWith('%') ? parseFloat(val) / 100 : parseFloat(val);
	}

	// rgba(r, g, b, a) or rgba(r g b / a)
	const rgbaMatch = v.match(/^rgba\(\s*\d+\s*[,/]\s*\d+\s*[,/]\s*\d+\s*[,/]\s*([\d.]+)\s*\)/);
	if (rgbaMatch) {
		return parseFloat(capture(rgbaMatch, 1));
	}

	// hsla(h, s%, l%, a) or hsla(h s% l% / a)
	const hslaMatch = v.match(
		/^hsla\(\s*\d+\s*[,/]\s*[\d.]+%?\s*[,/]\s*[\d.]+%?\s*[,/]\s*([\d.]+)\s*\)/
	);
	if (hslaMatch) {
		return parseFloat(capture(hslaMatch, 1));
	}

	// 8-digit hex: #rrggbbaa
	const hex8Match = v.match(/^#[0-9a-fA-F]{8}$/);
	if (hex8Match) {
		const alphaHex = v.slice(7, 9);
		return parseInt(alphaHex, 16) / 255;
	}

	// Fully opaque for all other formats
	return 1.0;
}

// Tier 1: Missing tokens

function checkMissingTokens(vars: Map<string, ResolvedVar>): DiagnoseIssue[] {
	// Count how many semantic color tokens are defined.
	const semanticCount = REQUIRED_TOKENS.filter((t) => vars.has(t)).length;

	// If fewer than threshold, this is targeted customization — skip.
	if (semanticCount < FULL_THEME_THRESHOLD) return [];

	const issues: DiagnoseIssue[] = [];
	for (const token of REQUIRED_TOKENS) {
		if (!vars.has(token)) {
			issues.push({
				severity: 'error',
				code: 'missing-token',
				variable: token,
				message: ruleMessage('missing-token', { variable: token }),
				fix: ruleSuggestedFix('missing-token', { variable: token })
			});
		}
	}

	return issues;
}

// Tier 2: Value type validation

function checkValueTypes(vars: Map<string, ResolvedVar>): DiagnoseIssue[] {
	const issues: DiagnoseIssue[] = [];

	for (const [name, entry] of vars) {
		const val = entry.resolved;

		// Skip unresolved var() references
		if (/^var\(\s*--/.test(val)) continue;

		const classified = classifyValue(val);

		// --dry-color-* should be color
		if (/^--dry-color-/.test(name) && classified !== 'color' && classified !== 'other') {
			issues.push({
				severity: 'error',
				code: 'wrong-type',
				variable: name,
				value: entry.original,
				message: ruleMessage('wrong-type', {
					variable: name,
					expectedType: 'color',
					actual: val,
					classified,
					expectedTypeExample: 'color value (e.g., #2563eb, rgb(37,99,235), hsl(217,91%,60%))'
				}),
				fix: ruleSuggestedFix('wrong-type', {
					expectedTypeExample: 'color value (e.g., #2563eb, rgb(37,99,235), hsl(217,91%,60%))'
				})
			});
		}

		// --dry-space-* should be length
		if (/^--dry-space-/.test(name) && classified !== 'length' && classified !== 'other') {
			issues.push({
				severity: 'error',
				code: 'wrong-type',
				variable: name,
				value: entry.original,
				message: ruleMessage('wrong-type', {
					variable: name,
					expectedType: 'length',
					actual: val,
					classified,
					expectedTypeExample: 'length value (e.g., 0.5rem, 4px, 1em)'
				}),
				fix: ruleSuggestedFix('wrong-type', {
					expectedTypeExample: 'length value (e.g., 0.5rem, 4px, 1em)'
				})
			});
		}

		// --dry-radius-* should be length
		if (/^--dry-radius-/.test(name) && classified !== 'length' && classified !== 'other') {
			issues.push({
				severity: 'error',
				code: 'wrong-type',
				variable: name,
				value: entry.original,
				message: ruleMessage('wrong-type', {
					variable: name,
					expectedType: 'length',
					actual: val,
					classified,
					expectedTypeExample: 'length value (e.g., 4px, 0.375rem)'
				}),
				fix: ruleSuggestedFix('wrong-type', {
					expectedTypeExample: 'length value (e.g., 4px, 0.375rem)'
				})
			});
		}

		// --dry-duration-* should be time
		if (/^--dry-duration-/.test(name) && classified !== 'time' && classified !== 'other') {
			issues.push({
				severity: 'error',
				code: 'wrong-type',
				variable: name,
				value: entry.original,
				message: ruleMessage('wrong-type', {
					variable: name,
					expectedType: 'time',
					actual: val,
					classified,
					expectedTypeExample: 'time value (e.g., 100ms, 0.2s)'
				}),
				fix: ruleSuggestedFix('wrong-type', {
					expectedTypeExample: 'time value (e.g., 100ms, 0.2s)'
				})
			});
		}
	}

	return issues;
}

// Tier 3: Contrast heuristics

function checkContrastHeuristics(vars: Map<string, ResolvedVar>): DiagnoseIssue[] {
	const issues: DiagnoseIssue[] = [];

	// transparent-surface: Flag surface/bg tokens with alpha < 0.3
	for (const token of SURFACE_TOKENS) {
		const entry = vars.get(token);
		if (!entry) continue;
		const alpha = extractAlpha(entry.resolved);
		if (alpha < 0.3) {
			issues.push({
				severity: 'warning',
				code: 'transparent-surface',
				variable: token,
				value: entry.original,
				message: ruleMessage('transparent-surface', { alpha }),
				fix: ruleSuggestedFix('transparent-surface')
			});
		}
	}

	// low-contrast-text: Brightness diff between text-strong and bg-base < 125
	const textStrongEntry = vars.get('--dry-color-text-strong');
	const textWeakEntry = vars.get('--dry-color-text-weak');
	const textBrandEntry = vars.get('--dry-color-text-brand');
	const bgBaseEntry = vars.get('--dry-color-bg-base');

	if (bgBaseEntry) {
		const bgRgb = parseColor(bgBaseEntry.resolved);
		if (bgRgb) {
			const bgBrightness = brightness(bgRgb.r, bgRgb.g, bgRgb.b);

			const textPairs: [string, typeof textStrongEntry][] = [
				['--dry-color-text-strong', textStrongEntry],
				['--dry-color-text-weak', textWeakEntry],
				['--dry-color-text-brand', textBrandEntry]
			];

			for (const [tokenName, textEntry] of textPairs) {
				if (!textEntry) continue;
				const textRgb = parseColor(textEntry.resolved);
				if (!textRgb) continue;
				const textBrightness = brightness(textRgb.r, textRgb.g, textRgb.b);
				if (Math.abs(textBrightness - bgBrightness) < 125) {
					issues.push({
						severity: 'warning',
						code: 'low-contrast-text',
						variable: tokenName,
						value: textEntry.original,
						message: ruleMessage('low-contrast-text', {
							variable: tokenName,
							difference: Math.round(Math.abs(textBrightness - bgBrightness))
						}),
						fix: ruleSuggestedFix('low-contrast-text')
					});
				}
			}
		}
	}

	// no-elevation: bg-base, bg-raised, and bg-overlay too similar
	const bgRaisedEntry = vars.get('--dry-color-bg-raised');
	const bgOverlayEntry = vars.get('--dry-color-bg-overlay');

	if (bgBaseEntry && bgRaisedEntry) {
		const baseRgb = parseColor(bgBaseEntry.resolved);
		const raisedRgb = parseColor(bgRaisedEntry.resolved);
		if (baseRgb && raisedRgb) {
			const baseBr = brightness(baseRgb.r, baseRgb.g, baseRgb.b);
			const raisedBr = brightness(raisedRgb.r, raisedRgb.g, raisedRgb.b);
			if (Math.abs(baseBr - raisedBr) < 3) {
				issues.push({
					severity: 'warning',
					code: 'no-elevation',
					variable: '--dry-color-bg-raised',
					value: bgRaisedEntry.original,
					message: ruleMessage('no-elevation', {
						left: '--dry-color-bg-base',
						right: '--dry-color-bg-raised',
						difference: Math.round(Math.abs(baseBr - raisedBr)),
						surfaceHint: "raised surfaces won't have visual separation"
					}),
					fix: 'Make --dry-color-bg-raised 1-2 steps lighter/darker than --dry-color-bg-base'
				});
			}
		}
	}

	if (bgRaisedEntry && bgOverlayEntry) {
		const raisedRgb = parseColor(bgRaisedEntry.resolved);
		const overlayRgb = parseColor(bgOverlayEntry.resolved);
		if (raisedRgb && overlayRgb) {
			const raisedBr = brightness(raisedRgb.r, raisedRgb.g, raisedRgb.b);
			const overlayBr = brightness(overlayRgb.r, overlayRgb.g, overlayRgb.b);
			if (Math.abs(raisedBr - overlayBr) < 3) {
				issues.push({
					severity: 'warning',
					code: 'no-elevation',
					variable: '--dry-color-bg-overlay',
					value: bgOverlayEntry.original,
					message: ruleMessage('no-elevation', {
						left: '--dry-color-bg-raised',
						right: '--dry-color-bg-overlay',
						difference: Math.round(Math.abs(raisedBr - overlayBr)),
						surfaceHint: "overlay surfaces won't have visual separation"
					}),
					fix: 'Make --dry-color-bg-overlay 1-2 steps lighter/darker than --dry-color-bg-raised'
				});
			}
		}
	}

	// missing-pairing: on-brand without fill-brand, on-{tone} without fill-{tone}
	for (const [a, b] of COLOR_PAIRINGS) {
		if (vars.has(a) && !vars.has(b)) {
			issues.push({
				severity: 'warning',
				code: 'missing-pairing',
				variable: b,
				message: ruleMessage('missing-pairing', {
					source: a,
					missing: b
				}),
				fix: ruleSuggestedFix('missing-pairing', { missing: b })
			});
		}
		if (vars.has(b) && !vars.has(a)) {
			issues.push({
				severity: 'warning',
				code: 'missing-pairing',
				variable: a,
				message: ruleMessage('missing-pairing', {
					source: b,
					missing: a
				}),
				fix: ruleSuggestedFix('missing-pairing', { missing: a })
			});
		}
	}

	return issues;
}

// Tier 4: Component token audit

function checkComponentTokens(
	vars: Map<string, ResolvedVar>,
	spec: { components: Record<string, { cssVars: Record<string, string> }> }
): DiagnoseIssue[] {
	const issues: DiagnoseIssue[] = [];

	// Build a set of all valid component CSS vars from the spec.
	const validComponentVars = new Set<string>();
	for (const comp of Object.values(spec.components)) {
		for (const varName of Object.keys(comp.cssVars)) {
			validComponentVars.add(varName);
		}
	}

	for (const [name, entry] of vars) {
		// Skip semantic tokens (--dry-color-*, --dry-space-*, etc.) — only check component tokens.
		// Component tokens follow the pattern --dry-{component}-{property} where the second segment
		// is a component name (not a known primitive category).
		if (/^--dry-(?:color|space|radius|duration|shadow|text|font)-/.test(name)) continue;

		// This is a component-level token.
		if (!validComponentVars.has(name)) {
			issues.push({
				severity: 'warning',
				code: 'unknown-component-token',
				variable: name,
				value: entry.original,
				message: ruleMessage('unknown-component-token', { variable: name }),
				fix: ruleSuggestedFix('unknown-component-token')
			});
			continue;
		}

		// Check for transparent/low-alpha component background tokens.
		if (/-bg$/.test(name)) {
			const lower = entry.resolved.toLowerCase();
			if (lower === 'transparent') {
				issues.push({
					severity: 'warning',
					code: 'transparent-component-bg',
					variable: name,
					value: entry.original,
					message: ruleMessage('transparent-component-bg', {
						variable: name,
						detail: 'is set to transparent — the component background will be invisible'
					}),
					fix: ruleSuggestedFix('transparent-component-bg')
				});
			} else {
				const alpha = extractAlpha(entry.resolved);
				if (alpha < 0.3) {
					issues.push({
						severity: 'warning',
						code: 'transparent-component-bg',
						variable: name,
						value: entry.original,
						message: ruleMessage('transparent-component-bg', {
							variable: name,
							detail: `has very low opacity (${alpha}) — the component background will be nearly invisible`
						}),
						fix: ruleSuggestedFix('transparent-component-bg')
					});
				}
			}
		}
	}

	return issues;
}

// Dark scheme detection (for CSS with no --dry-* overrides)

function detectDarkScheme(css: string, allVars: Map<string, string>): DiagnoseIssue[] {
	const issues: DiagnoseIssue[] = [];
	const signals: string[] = [];

	// Check for color-scheme: dark
	if (/color-scheme\s*:\s*dark/i.test(css)) {
		signals.push('color-scheme: dark');
	}

	// Check for dark background colors in common variables
	const bgVarNames = ['--bg', '--background', '--bg-color', '--background-color', '--bg-base'];
	for (const name of bgVarNames) {
		const value = allVars.get(name);
		if (value) {
			const rgb = parseColor(value);
			if (rgb && brightness(rgb.r, rgb.g, rgb.b) < 50) {
				signals.push(`${name}: ${value} (dark)`);
			}
		}
	}

	// Check for dark background in body/html rules
	const bgPropMatch = css.match(
		/(?:html|body|\*|:root)\s*\{[^}]*background(?:-color)?\s*:\s*([^;]+)/i
	);
	if (bgPropMatch) {
		const val = (bgPropMatch[1] ?? '').trim();
		// Try to resolve var() reference
		const varRef = val.match(/var\(\s*(--[a-zA-Z0-9-]+)/);
		const resolvedVal = varRef?.[1] ? allVars.get(varRef[1]) : undefined;
		const colorStr = resolvedVal ?? val;
		const rgb = parseColor(colorStr);
		if (rgb && brightness(rgb.r, rgb.g, rgb.b) < 50) {
			signals.push(`background: ${val} (dark)`);
		}
	}

	if (signals.length > 0) {
		issues.push({
			severity: 'warning',
			code: 'dark-scheme-no-overrides',
			variable: '--dry-color-*',
			message: ruleMessage('dark-scheme-no-overrides', {
				signals: signals.join(', ')
			}),
			fix: ruleSuggestedFix('dark-scheme-no-overrides')
		});
	}

	return issues;
}

// Orchestrator

export function diagnoseTheme(
	css: string,
	spec: { components: Record<string, { cssVars: Record<string, string> }> }
): DiagnoseResult {
	const cleaned = stripComments(css);
	const dryVars = extractDryVariables(cleaned);
	const allVars = extractAllVariables(cleaned);

	// 3. Resolve var references
	const resolved = resolveVarReferences(dryVars, allVars);

	// Emit info-level notes for unresolvable var() references
	const infoIssues: DiagnoseIssue[] = [];
	for (const [name, entry] of resolved) {
		if (/^var\(\s*--/.test(entry.resolved) && entry.resolved === entry.original) {
			// The value is still a var() reference after resolution — unresolvable
			const varRefMatch = entry.original.match(/var\(\s*(--[a-zA-Z0-9-]+)/);
			const refName = varRefMatch?.[1] ?? 'unknown';
			infoIssues.push({
				severity: 'info',
				code: 'unresolvable-var',
				variable: name,
				value: entry.original,
				message: ruleMessage('unresolvable-var', {
					variable: name,
					reference: refName
				}),
				fix: null
			});
		}
	}

	// 4. Run tiers 1-4
	const tier1 = checkMissingTokens(resolved);
	const tier2 = checkValueTypes(resolved);
	const tier3 = checkContrastHeuristics(resolved);
	const tier4 = checkComponentTokens(resolved, spec);

	// 4b. If no --dry-* overrides found, check for dark scheme mismatch
	const darkSchemeIssues = dryVars.size === 0 ? detectDarkScheme(css, allVars) : [];

	const allIssues = [...tier1, ...tier2, ...tier3, ...tier4, ...darkSchemeIssues, ...infoIssues];

	const severityOrder: Record<string, number> = { error: 0, warning: 1, info: 2 };
	allIssues.sort((a, b) => (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2));

	let errors = 0;
	let warnings = 0;
	let infos = 0;
	for (const issue of allIssues) {
		if (issue.severity === 'error') errors += 1;
		else if (issue.severity === 'warning') warnings += 1;
		else infos += 1;
	}
	const summary =
		allIssues.length === 0
			? 'No issues found'
			: `${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}, ${infos} info`;

	// 7. Count variables
	const found = dryVars.size;
	const requiredSet = new Set<string>(REQUIRED_TOKENS);
	const requiredFound = [...dryVars.keys()].filter((k) => requiredSet.has(k)).length;
	const extra = found - requiredFound;

	return {
		variables: { found, required: requiredFound, extra },
		issues: allIssues,
		summary
	};
}
