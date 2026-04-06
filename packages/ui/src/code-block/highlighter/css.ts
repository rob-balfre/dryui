import type { Token, Highlighter } from './types.js';

const AT_RULES = new Set([
	'@media',
	'@container',
	'@keyframes',
	'@font-face',
	'@import',
	'@charset',
	'@supports',
	'@layer',
	'@property',
	'@scope',
	'@starting-style',
	'@counter-style',
	'@page',
	'@namespace'
]);

const CSS_FUNCTIONS = new Set([
	'var',
	'calc',
	'min',
	'max',
	'clamp',
	'repeat',
	'minmax',
	'rgb',
	'rgba',
	'hsl',
	'hsla',
	'oklch',
	'oklab',
	'lch',
	'lab',
	'color',
	'color-mix',
	'linear-gradient',
	'radial-gradient',
	'conic-gradient',
	'repeating-linear-gradient',
	'repeating-radial-gradient',
	'url',
	'attr',
	'env',
	'fit-content',
	'cubic-bezier',
	'steps',
	'counter',
	'counters',
	'image-set',
	'cross-fade',
	'translate',
	'translateX',
	'translateY',
	'translateZ',
	'rotate',
	'rotateX',
	'rotateY',
	'rotateZ',
	'scale',
	'scaleX',
	'scaleY',
	'matrix',
	'matrix3d',
	'perspective',
	'skew',
	'skewX',
	'skewY'
]);

function isAlpha(ch: string | undefined): boolean {
	return !!ch && ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_');
}

function isDigit(ch: string | undefined): boolean {
	return !!ch && ch >= '0' && ch <= '9';
}

function isAlphaNum(ch: string | undefined): boolean {
	return isAlpha(ch) || isDigit(ch);
}

/**
 * Highlights CSS code and returns tokens with positions offset by `base`.
 */
export function highlightCSS(code: string, base = 0): Token[] {
	const tokens: Token[] = [];
	const len = code.length;
	let i = 0;

	// Track context: are we inside a declaration block reading property names or values?
	let inBlock = 0; // nesting depth inside { }
	let afterColon = false; // true when we've seen `:` (reading a value)

	function push(type: string, start: number, end: number): void {
		tokens.push({ type, start: base + start, end: base + end });
	}

	function peek(offset = 0): string {
		return code[i + offset] ?? '';
	}

	function readString(quote: string): void {
		const start = i;
		i++; // skip opening quote
		while (i < len && code[i] !== quote) {
			if (code[i] === '\\' && i + 1 < len) i++;
			i++;
		}
		if (i < len) i++; // skip closing quote
		push('string', start, i);
	}

	function readIdent(): string {
		const start = i;
		while (i < len && (isAlphaNum(code[i]) || code[i] === '-' || code[i] === '_')) {
			i++;
		}
		return code.slice(start, i);
	}

	function skipWhitespace(): void {
		while (
			i < len &&
			(code[i] === ' ' || code[i] === '\t' || code[i] === '\n' || code[i] === '\r')
		) {
			i++;
		}
	}

	function readNumber(): void {
		const start = i;
		// Optional leading sign already consumed or not present
		while (i < len && (isDigit(code[i]) || code[i] === '.')) {
			i++;
		}
		// Unit suffix (px, em, rem, %, fr, vw, vh, ms, s, deg, etc.)
		const unitStart = i;
		while (i < len && isAlpha(code[i])) {
			i++;
		}
		// Also handle %
		if (i < len && code[i] === '%') {
			i++;
		}
		push('number', start, i);
	}

	while (i < len) {
		const ch = code[i];

		// Whitespace
		if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
			i++;
			continue;
		}

		// Block comment
		if (ch === '/' && peek(1) === '*') {
			const start = i;
			i += 2;
			while (i < len && !(code[i] === '*' && peek(1) === '/')) {
				i++;
			}
			if (i < len) i += 2;
			push('comment', start, i);
			continue;
		}

		// Line comment (SCSS / non-standard but common)
		if (ch === '/' && peek(1) === '/') {
			const start = i;
			while (i < len && code[i] !== '\n') {
				i++;
			}
			push('comment', start, i);
			continue;
		}

		// Strings
		if (ch === '"' || ch === "'") {
			readString(ch);
			continue;
		}

		// At-rules
		if (ch === '@') {
			const start = i;
			i++; // skip @
			const kwStart = i;
			while (i < len && (isAlphaNum(code[i]) || code[i] === '-')) {
				i++;
			}
			const rule = code.slice(start, i);
			if (AT_RULES.has(rule)) {
				push('keyword', start, i);
			} else {
				push('keyword', start, i); // still highlight unknown at-rules
			}
			continue;
		}

		// Opening brace
		if (ch === '{') {
			push('punctuation', i, i + 1);
			i++;
			inBlock++;
			afterColon = false;
			continue;
		}

		// Closing brace
		if (ch === '}') {
			push('punctuation', i, i + 1);
			i++;
			if (inBlock > 0) inBlock--;
			afterColon = false;
			continue;
		}

		// Semicolon — resets to property-name context
		if (ch === ';') {
			push('punctuation', i, i + 1);
			i++;
			afterColon = false;
			continue;
		}

		// Colon — could be pseudo-selector or property/value separator
		if (ch === ':') {
			if (inBlock > 0) {
				// Inside a block: this is a property:value separator
				push('punctuation', i, i + 1);
				i++;
				afterColon = true;
				continue;
			}
			// Outside block or could be pseudo-selector like :hover, ::before
			// Check if followed by a known pseudo pattern
			push('punctuation', i, i + 1);
			i++;
			continue;
		}

		// Comma
		if (ch === ',') {
			push('punctuation', i, i + 1);
			i++;
			continue;
		}

		// Parentheses
		if (ch === '(' || ch === ')') {
			push('punctuation', i, i + 1);
			i++;
			continue;
		}

		// Square brackets (attribute selectors)
		if (ch === '[' || ch === ']') {
			push('punctuation', i, i + 1);
			i++;
			continue;
		}

		// Numbers (including negative/dot-leading)
		if (isDigit(ch) || (ch === '.' && isDigit(peek(1)))) {
			readNumber();
			continue;
		}

		// Negative number
		if (ch === '-' && (isDigit(peek(1)) || (peek(1) === '.' && isDigit(peek(2))))) {
			const start = i;
			i++; // skip -
			readNumber();
			// Adjust the start of the last token to include the minus
			const lastToken = tokens[tokens.length - 1];
			if (lastToken) {
				lastToken.start = base + start;
			}
			continue;
		}

		// Hash (ID selector or hex color)
		if (ch === '#') {
			const start = i;
			i++; // skip #
			while (i < len && (isAlphaNum(code[i]) || code[i] === '-' || code[i] === '_')) {
				i++;
			}
			const value = code.slice(start + 1, i);
			// Hex color: 3, 4, 6, or 8 hex digits
			if (/^[0-9a-fA-F]{3,8}$/.test(value)) {
				push('number', start, i);
			} else {
				push('tag', start, i);
			}
			continue;
		}

		// Class selector
		if (
			ch === '.' &&
			!isDigit(peek(1)) &&
			(isAlpha(peek(1)) || peek(1) === '-' || peek(1) === '_')
		) {
			const start = i;
			i++; // skip .
			readIdent();
			push('tag', start, i);
			continue;
		}

		// & (parent selector in nesting)
		if (ch === '&') {
			const start = i;
			i++;
			push('tag', start, i);
			continue;
		}

		// * (universal selector or multiplication)
		if (ch === '*') {
			push('punctuation', i, i + 1);
			i++;
			continue;
		}

		// > + ~ combinators
		if (ch === '>' || ch === '+' || ch === '~') {
			push('operator', i, i + 1);
			i++;
			continue;
		}

		// ! (for !important)
		if (
			ch === '!' &&
			code
				.slice(i, i + 10)
				.toLowerCase()
				.startsWith('!important')
		) {
			push('keyword', i, i + 10);
			i += 10;
			continue;
		}

		// Identifiers: property names, values, selectors, functions
		if (isAlpha(ch) || ch === '-' || ch === '_') {
			const start = i;
			const ident = readIdent();

			// Check if it's a function call
			if (i < len && code[i] === '(') {
				push('function', start, i);
				continue;
			}

			// Inside a block
			if (inBlock > 0) {
				if (afterColon) {
					// Value context — leave plain identifiers unhighlighted
					// But highlight known CSS-wide values
				} else {
					// Property name
					push('attribute', start, i);
				}
			} else {
				// Selector context — element selectors
				push('tag', start, i);
			}
			continue;
		}

		// Skip any other character
		i++;
	}

	return tokens;
}

export const cssHighlighter: Highlighter = (code: string): Token[] => {
	return highlightCSS(code, 0);
};
