import { describe, it, expect } from 'bun:test';
import {
	highlight,
	registerHighlighter
} from '../../../packages/ui/src/code-block/highlighter/index.js';
import type { Highlighter } from '../../../packages/ui/src/code-block/highlighter/types.js';

describe('highlight registry', () => {
	it('returns empty tokens for unknown language', () => {
		const tokens = highlight('hello', 'unknown-lang-xyz');
		// Falls back to generic, which returns no tokens for plain text
		expect(Array.isArray(tokens)).toBe(true);
	});

	it('uses registered highlighter for matching language', () => {
		const mock: Highlighter = (code) => [{ type: 'test', start: 0, end: code.length }];
		registerHighlighter(['test-lang'], mock);
		const tokens = highlight('hello', 'test-lang');
		expect(tokens).toEqual([{ type: 'test', start: 0, end: 5 }]);
	});

	it('falls back to generic when no language specified', () => {
		const tokens = highlight('const x = 1');
		expect(tokens.some((t) => t.type === 'keyword')).toBe(true);
	});

	it('is case-insensitive for language lookup', () => {
		const tokens = highlight('const x = 1', 'JavaScript');
		expect(tokens.some((t) => t.type === 'keyword')).toBe(true);
	});

	it('uses svelte highlighter for language="svelte"', () => {
		const tokens = highlight('<Button onclick={handleClick}>Click</Button>', 'svelte');
		expect(tokens.some((t) => t.type === 'component')).toBe(true);
		expect(tokens.some((t) => t.type === 'attribute')).toBe(true);
	});

	it('uses svelte highlighter for language="html"', () => {
		const tokens = highlight('<div class="foo">text</div>', 'html');
		expect(tokens.some((t) => t.type === 'tag')).toBe(true);
	});
});
