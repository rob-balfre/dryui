import type { Token, Highlighter } from './types.js';
import { genericHighlighter } from './generic.js';

export type { Token, Highlighter };

const registry = new Map<string, Highlighter>();

export function registerHighlighter(languages: string[], highlighter: Highlighter): void {
	for (const lang of languages) {
		registry.set(lang.toLowerCase(), highlighter);
	}
}

const noHighlight: Highlighter = () => [];

export function highlight(code: string, language?: string): Token[] {
	const lang = language?.toLowerCase();
	if (lang === 'text') return noHighlight(code);
	const highlighter = (lang && registry.get(lang)) || genericHighlighter;
	return highlighter(code);
}

// Register generic for common languages
registerHighlighter(['javascript', 'js', 'typescript', 'ts', 'python', 'py'], genericHighlighter);

import { svelteHighlighter } from './svelte.js';
import { cssHighlighter } from './css.js';

registerHighlighter(['svelte', 'html'], svelteHighlighter);
registerHighlighter(['css', 'scss'], cssHighlighter);
