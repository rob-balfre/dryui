import { describe, expect, it } from 'bun:test';
import type { Token } from '../../../packages/ui/src/code-block/highlighter/types.js';
import {
	cssHighlighter,
	highlightCSS
} from '../../../packages/ui/src/code-block/highlighter/css.js';

function textOf(code: string, token: Token): string {
	return code.slice(token.start, token.end);
}

function textsOf(code: string, tokens: Token[], type: string): string[] {
	return tokens.filter((token) => token.type === type).map((token) => textOf(code, token));
}

describe('highlightCSS', () => {
	it('highlights nested selectors, at-rules, functions, comments, and values', () => {
		const code = `/* banner */
@media screen and (min-width: 40rem) {
  #hero,
  .card:hover[data-state='open'] > button {
    color: color-mix(in oklch, #ff00aa 50%, var(--accent));
    margin: -0.5rem;
    background-image: url("/asset.png");
    animation: fade 200ms steps(2) !important;
  }
}`;

		const tokens = highlightCSS(code);

		expect(textsOf(code, tokens, 'comment')).toContain('/* banner */');
		expect(textsOf(code, tokens, 'keyword')).toEqual(
			expect.arrayContaining(['@media', '!important'])
		);
		expect(textsOf(code, tokens, 'tag')).toEqual(expect.arrayContaining(['#hero', '.card']));
		expect(textsOf(code, tokens, 'attribute')).toEqual(
			expect.arrayContaining(['color', 'margin', 'background-image', 'animation'])
		);
		expect(textsOf(code, tokens, 'function')).toEqual(
			expect.arrayContaining(['color-mix', 'var', 'url', 'steps'])
		);
		expect(textsOf(code, tokens, 'number')).toEqual(
			expect.arrayContaining(['40rem', '#ff00aa', '50%', '-0.5rem', '200ms', '2'])
		);
		expect(textsOf(code, tokens, 'string')).toContain("'open'");
		expect(textsOf(code, tokens, 'operator')).toContain('>');
	});

	it('offsets token positions by base and distinguishes ids from hex colors', () => {
		const code = '#hero { color: #abc123; opacity: .5; }';
		const plainTokens = highlightCSS(code);
		const tokens = highlightCSS(code, 10);
		const idToken = tokens.find((token) => token.type === 'tag');
		const colorToken = plainTokens.find(
			(token) => token.type === 'number' && textOf(code, token) === '#abc123'
		);
		const decimalToken = plainTokens.find(
			(token) => token.type === 'number' && textOf(code, token) === '.5'
		);

		expect(idToken).toBeDefined();
		expect(idToken?.start).toBe(10);
		expect(idToken?.end).toBe(15);
		expect(colorToken).toBeDefined();
		expect(
			tokens.some(
				(token) =>
					token.type === 'number' &&
					token.start === (colorToken?.start ?? 0) + 10 &&
					token.end === (colorToken?.end ?? 0) + 10
			)
		).toBe(true);
		expect(
			tokens.some(
				(token) =>
					token.type === 'number' &&
					token.start === (decimalToken?.start ?? 0) + 10 &&
					token.end === (decimalToken?.end ?? 0) + 10
			)
		).toBe(true);
	});

	it('leaves plain identifiers in declaration values unhighlighted while keeping unknown at-rules as keywords', () => {
		const code = `@theme demo {
  background: solid center;
}`;
		const tokens = cssHighlighter(code);

		expect(textsOf(code, tokens, 'keyword')).toContain('@theme');
		expect(textsOf(code, tokens, 'attribute')).toEqual(['background']);
		expect(tokens.some((token) => textOf(code, token) === 'solid')).toBe(false);
		expect(tokens.some((token) => textOf(code, token) === 'center')).toBe(false);
	});
});
