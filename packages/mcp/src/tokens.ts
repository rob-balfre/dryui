// Token discovery backed by the official theme registry.
// Shared between @dryui/mcp (MCP tool) and @dryui/cli (CLI command).

import { THEME_TOKEN_REGISTRY } from './theme-tokens.js';

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

// ── Cache ────────────────────────────────────────────────

let allTokensCache: TokenResult | null = null;

function getAllTokens(): TokenResult {
	if (allTokensCache) return allTokensCache;

	const tokens: Token[] = [];
	for (const token of THEME_TOKEN_REGISTRY) {
		tokens.push({
			name: token.name,
			category: categorize(token.name),
			light: token.light,
			dark: token.dark
		});
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
