// Token discovery: parse --dry-* CSS variables from theme files.
// Shared between @dryui/mcp (MCP tool) and @dryui/cli (CLI command).

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Types ─────────────────────────────────────────────────

export type TokenCategory =
	| 'color'
	| 'space'
	| 'radius'
	| 'shadow'
	| 'font'
	| 'type'
	| 'toggle'
	| 'duration'
	| 'ease'
	| 'motion'
	| 'glass'
	| 'glow'
	| 'layer'
	| 'scrollbar'
	| 'tracking'
	| 'text'
	| 'beam'
	| 'other';

export interface Token {
	name: string;
	category: TokenCategory;
	light: string;
	dark: string;
}

export interface TokenResult {
	tokens: Token[];
	counts: Record<TokenCategory, number>;
	total: number;
}

// ── Categorization ────────────────────────────────────────

const CATEGORY_PREFIXES: Array<[string, TokenCategory]> = [
	['--dry-color-', 'color'],
	['--dry-space-', 'space'],
	['--dry-radius-', 'radius'],
	['--dry-shadow-', 'shadow'],
	['--dry-font-', 'font'],
	['--dry-type-', 'type'],
	['--dry-text-', 'text'],
	['--dry-toggle-', 'toggle'],
	['--dry-duration-', 'duration'],
	['--dry-ease-', 'ease'],
	['--dry-motion-', 'motion'],
	['--dry-glass-', 'glass'],
	['--dry-glow-', 'glow'],
	['--dry-layer-', 'layer'],
	['--dry-scrollbar-', 'scrollbar'],
	['--dry-tracking-', 'tracking'],
	['--dry-beam-', 'beam']
];

function categorize(name: string): TokenCategory {
	for (const [prefix, category] of CATEGORY_PREFIXES) {
		if (name.startsWith(prefix)) return category;
	}
	return 'other';
}

// ── Parsing ───────────────────────────────────────────────

/** Parse --dry-* variable declarations from a CSS string. Returns a map of name -> value. */
function parseTokens(css: string): Map<string, string> {
	const tokens = new Map<string, string>();
	// Match --dry-<name>: <value>; across single or multiline declarations
	const regex = /(--dry-[\w-]+)\s*:\s*([^;]+);/g;
	let match: RegExpExecArray | null;
	while ((match = regex.exec(css)) !== null) {
		const name = match[1]!.trim();
		const value = match[2]!.trim();
		// First occurrence wins (`:root` appears before data-dry-type-mode blocks)
		if (!tokens.has(name)) {
			tokens.set(name, value);
		}
	}
	return tokens;
}

// ── Theme file resolution ─────────────────────────────────

function themeDir(): string {
	const here = dirname(fileURLToPath(import.meta.url));
	// From packages/mcp/src/ -> packages/ui/src/themes/
	return resolve(here, '../../ui/src/themes');
}

/** Read and parse the default (light) theme. */
function loadLightTokens(): Map<string, string> {
	const css = readFileSync(resolve(themeDir(), 'default.css'), 'utf-8');
	return parseTokens(css);
}

/** Read and parse the dark theme overrides. */
function loadDarkTokens(): Map<string, string> {
	const css = readFileSync(resolve(themeDir(), 'dark.css'), 'utf-8');
	return parseTokens(css);
}

// ── Cache ────────────────────────────────────────────────

let allTokensCache: TokenResult | null = null;

function getAllTokens(): TokenResult {
	if (allTokensCache) return allTokensCache;

	const light = loadLightTokens();
	const dark = loadDarkTokens();

	const allNames = new Set([...light.keys(), ...dark.keys()]);

	const tokens: Token[] = [];
	for (const name of allNames) {
		const lightVal = light.get(name) ?? '';
		const darkVal = dark.get(name) || lightVal;
		const cat = categorize(name);
		tokens.push({ name, category: cat, light: lightVal, dark: darkVal });
	}

	tokens.sort((a, b) => {
		if (a.category !== b.category) return a.category.localeCompare(b.category);
		return a.name.localeCompare(b.name);
	});

	const counts = {} as Record<TokenCategory, number>;
	for (const t of tokens) {
		counts[t.category] = (counts[t.category] ?? 0) + 1;
	}

	allTokensCache = { tokens, counts, total: tokens.length };
	return allTokensCache;
}

// ── Public API ────────────────────────────────────────────

/**
 * Extract all --dry-* tokens from the theme files.
 * Optionally filter by category. Results are cached after first read.
 */
export function extractTokens(category?: string): TokenResult {
	const all = getAllTokens();

	if (!category) return all;

	const lc = category.toLowerCase();
	const filtered = all.tokens.filter((t) => t.category === lc);
	const counts = {} as Record<TokenCategory, number>;
	for (const t of filtered) {
		counts[t.category] = (counts[t.category] ?? 0) + 1;
	}
	return { tokens: filtered, counts, total: filtered.length };
}

/** List all available token categories (derived from cached full set). */
export function getTokenCategories(): TokenCategory[] {
	const all = getAllTokens();
	return Object.keys(all.counts).sort() as TokenCategory[];
}
