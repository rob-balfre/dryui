import type { Token, Highlighter } from './types.js';
import { highlightCSS } from './css.js';

const KEYWORDS = new Set([
	'const',
	'let',
	'var',
	'function',
	'return',
	'if',
	'else',
	'for',
	'while',
	'do',
	'switch',
	'case',
	'break',
	'continue',
	'new',
	'this',
	'class',
	'extends',
	'import',
	'export',
	'from',
	'default',
	'async',
	'await',
	'try',
	'catch',
	'finally',
	'throw',
	'typeof',
	'instanceof',
	'in',
	'of',
	'void',
	'delete',
	'yield',
	'true',
	'false',
	'null',
	'undefined',
	'interface',
	'type',
	'enum',
	'implements',
	'as'
]);

const TYPE_DEFINING_KEYWORDS = new Set(['interface', 'type', 'class', 'extends', 'implements']);

const RUNES = new Set([
	'$state',
	'$derived',
	'$effect',
	'$props',
	'$bindable',
	'$inspect',
	'$host'
]);

const RUNE_METHODS: Record<string, Set<string>> = {
	$derived: new Set(['by']),
	$effect: new Set(['pre', 'root', 'tracking']),
	$state: new Set(['raw', 'snapshot'])
};

const MULTI_CHAR_OPERATORS = new Set([
	'=>',
	'===',
	'!==',
	'==',
	'!=',
	'>=',
	'<=',
	'&&',
	'||',
	'??',
	'**',
	'+=',
	'-=',
	'*=',
	'/=',
	'%=',
	'++',
	'--',
	'...',
	'?.'
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

function isUpperCase(ch: string | undefined): boolean {
	return !!ch && ch >= 'A' && ch <= 'Z';
}

function isOperatorChar(ch: string | undefined): boolean {
	return !!ch && '=!<>+-*/%&|?^~:.'.includes(ch);
}

export const svelteHighlighter: Highlighter = (code: string): Token[] => {
	const tokens: Token[] = [];
	const len = code.length;
	let i = 0;

	function push(type: string, start: number, end: number): void {
		tokens.push({ type, start, end });
	}

	function peek(offset = 0): string {
		return code[i + offset] ?? '';
	}

	function readString(quote: string): void {
		const start = i;
		i++; // skip opening quote
		while (i < len && code[i] !== quote) {
			if (code[i] === '\\' && i + 1 < len) i++; // skip escaped char
			i++;
		}
		if (i < len) i++; // skip closing quote
		push('string', start, i);
	}

	function readIdentifier(): string {
		const start = i;
		while (i < len && (isAlphaNum(code[i]) || code[i] === '$')) {
			i++;
		}
		return code.slice(start, i);
	}

	function readTagName(): string {
		const start = i;
		while (
			i < len &&
			(isAlphaNum(code[i]) || code[i] === '.' || code[i] === '-' || code[i] === ':')
		) {
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

	function readTagBody(): void {
		while (i < len) {
			skipWhitespace();
			if (i >= len) break;

			const ch = code[i];

			// End of tag
			if (ch === '>') {
				push('punctuation', i, i + 1);
				i++;
				return;
			}

			// Self-closing />
			if (ch === '/' && peek(1) === '>') {
				push('punctuation', i, i + 1);
				i++;
				push('punctuation', i, i + 1);
				i++;
				return;
			}

			// String attribute value
			if (ch === '"' || ch === "'" || ch === '`') {
				readString(ch);
				continue;
			}

			// = operator
			if (ch === '=') {
				// Check for =>
				if (peek(1) === '>') {
					push('operator', i, i + 2);
					i += 2;
				} else {
					push('operator', i, i + 1);
					i++;
				}
				continue;
			}

			// Expression block in attribute
			if (ch === '{') {
				readExpressionBlock();
				continue;
			}

			// Attribute name or identifier (supports hyphenated names like data-id, aria-label)
			if (isAlpha(ch)) {
				const start = i;
				readIdentifier();
				// consume any hyphenated segments (data-*, aria-*)
				while (i < len && code[i] === '-' && i + 1 < len && isAlpha(code[i + 1])) {
					i++; // skip hyphen
					readIdentifier();
				}
				push('attribute', start, i);
				continue;
			}

			// Skip other characters
			i++;
		}
	}

	function readExpressionBlock(): void {
		// `{` is current char
		push('punctuation', i, i + 1);
		i++; // skip {

		let depth = 1;
		while (i < len && depth > 0) {
			if (code[i] === '}') {
				depth--;
				if (depth === 0) {
					push('punctuation', i, i + 1);
					i++;
					return;
				}
				push('punctuation', i, i + 1);
				i++;
				continue;
			}

			if (code[i] === '{') {
				depth++;
				push('punctuation', i, i + 1);
				i++;
				continue;
			}

			readDefaultToken();
		}
	}

	function readSvelteBlock(): void {
		// `{` is current char, next is #, /, :, or @
		push('punctuation', i, i + 1);
		i++; // skip {

		const sigil = code[i]; // #, /, :, or @
		const sigilStart = i;
		i++; // skip sigil

		// Read the block keyword
		const kwStart = i;
		while (i < len && isAlpha(code[i])) {
			i++;
		}
		const keyword = code.slice(kwStart, i);
		push('svelte-keyword', sigilStart, i); // includes sigil + keyword (e.g., #each)

		// For closing/else blocks like {/each} or {:else}, read till }
		if (sigil === '/' || sigil === ':') {
			skipWhitespace();
			if (i < len && code[i] === '}') {
				push('punctuation', i, i + 1);
				i++;
			}
			return;
		}

		// For # and @ blocks, read the rest as default tokens until }
		let depth = 1;
		while (i < len && depth > 0) {
			if (code[i] === '}') {
				depth--;
				if (depth === 0) {
					push('punctuation', i, i + 1);
					i++;
					return;
				}
				push('punctuation', i, i + 1);
				i++;
				continue;
			}

			if (code[i] === '{') {
				depth++;
				push('punctuation', i, i + 1);
				i++;
				continue;
			}

			readDefaultToken();
		}
	}

	function tryReadTypeAfterKeyword(): void {
		const savedI = i;
		skipWhitespace();
		if (i < len && isUpperCase(code[i])) {
			const start = i;
			readIdentifier();
			push('type', start, i);
		} else {
			i = savedI;
		}
	}

	function readDefaultToken(): void {
		if (i >= len) return;

		const ch = code[i];
		if (!ch) return;

		// Whitespace — skip
		if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
			i++;
			return;
		}

		// HTML comment
		if (ch === '<' && code.slice(i, i + 4) === '<!--') {
			const start = i;
			i += 4;
			while (i < len && code.slice(i, i + 3) !== '-->') {
				i++;
			}
			if (i < len) i += 3; // skip -->
			push('comment', start, i);
			return;
		}

		// Line comment
		if (ch === '/' && peek(1) === '/') {
			const start = i;
			while (i < len && code[i] !== '\n') {
				i++;
			}
			push('comment', start, i);
			return;
		}

		// Block comment
		if (ch === '/' && peek(1) === '*') {
			const start = i;
			i += 2;
			while (i < len && !(code[i] === '*' && peek(1) === '/')) {
				i++;
			}
			if (i < len) i += 2; // skip */
			push('comment', start, i);
			return;
		}

		// Strings
		if (ch === '"' || ch === "'" || ch === '`') {
			readString(ch);
			return;
		}

		// Svelte block: {#...}, {/...}, {:...}, {@...}
		if (ch === '{') {
			const next = peek(1);
			if (next === '#' || next === '/' || next === ':' || next === '@') {
				readSvelteBlock();
				return;
			}
			// Regular expression block
			readExpressionBlock();
			return;
		}

		// Tags: `<` followed by letter or `/`
		if (ch === '<') {
			const next = peek(1);
			if (isAlpha(next)) {
				// Opening tag
				push('punctuation', i, i + 1);
				i++; // skip <
				const nameStart = i;
				const name = readTagName();
				if (isUpperCase(name[0])) {
					push('component', nameStart, i);
				} else {
					push('tag', nameStart, i);
				}
				readTagBody();

				// If this was a <style> tag, highlight its content as CSS
				if (name === 'style') {
					const cssStart = i;
					const closeTag = '</style>';
					const closeIdx = code.indexOf(closeTag, i);
					const cssEnd = closeIdx === -1 ? len : closeIdx;
					const cssContent = code.slice(cssStart, cssEnd);
					const cssTokens = highlightCSS(cssContent, cssStart);
					tokens.push(...cssTokens);
					i = cssEnd;
					// The closing </style> tag will be parsed on the next iteration
				}

				return;
			}
			if (next === '/') {
				// Closing tag
				push('punctuation', i, i + 1);
				i++; // skip <
				push('punctuation', i, i + 1);
				i++; // skip /
				const nameStart = i;
				const name = readTagName();
				if (isUpperCase(name[0])) {
					push('component', nameStart, i);
				} else {
					push('tag', nameStart, i);
				}
				// Read until >
				while (i < len && code[i] !== '>') i++;
				if (i < len) {
					push('punctuation', i, i + 1);
					i++;
				}
				return;
			}
			// Fall through to operator handling for `<` as comparison
		}

		// $ — rune or identifier
		if (ch === '$' && isAlpha(peek(1))) {
			const start = i;
			i++; // skip $
			const identStart = i;
			while (i < len && isAlphaNum(code[i])) {
				i++;
			}
			const ident = '$' + code.slice(identStart, i);

			if (RUNES.has(ident)) {
				// Check for sub-method
				const methods = RUNE_METHODS[ident];
				if (methods && peek() === '.') {
					const dotPos = i;
					i++; // skip .
					const methodStart = i;
					while (i < len && isAlphaNum(code[i])) {
						i++;
					}
					const method = code.slice(methodStart, i);
					if (methods.has(method)) {
						push('rune', start, i);
					} else {
						// Not a valid sub-method, emit just the rune and rewind
						i = dotPos;
						push('rune', start, i);
					}
				} else {
					push('rune', start, i);
				}
				return;
			}

			// Not a rune, treat as regular identifier
			i = start;
			// Fall through to identifier handling below
		}

		// Identifiers and keywords
		if (isAlpha(ch) || ch === '$') {
			const start = i;
			const ident = readIdentifier();

			if (KEYWORDS.has(ident)) {
				push('keyword', start, i);
				if (TYPE_DEFINING_KEYWORDS.has(ident)) {
					tryReadTypeAfterKeyword();
				}
				return;
			}

			// Check if it's a function call (followed by `(`)
			const savedI = i;
			skipWhitespace();
			if (i < len && code[i] === '(') {
				push('function', start, savedI);
				i = savedI; // rewind; the ( will be handled as punctuation next
			} else {
				i = savedI;
				// Plain identifier — don't emit a token for it
			}
			return;
		}

		// Numbers
		if (isDigit(ch)) {
			const start = i;
			// Hex/binary/octal literals: 0x..., 0b..., 0o...
			if (ch === '0' && i + 1 < len) {
				const next = code[i + 1];
				if (next === 'x' || next === 'X') {
					i += 2; // skip 0x
					while (i < len) {
						const hch = code[i];
						if (!hch || !/[0-9a-fA-F_]/.test(hch)) break;
						i++;
					}
					push('number', start, i);
					return;
				}
				if (next === 'b' || next === 'B') {
					i += 2; // skip 0b
					while (i < len && (code[i] === '0' || code[i] === '1' || code[i] === '_')) i++;
					push('number', start, i);
					return;
				}
				if (next === 'o' || next === 'O') {
					i += 2; // skip 0o
					while (i < len) {
						const och = code[i];
						if (!och || !((och >= '0' && och <= '7') || och === '_')) break;
						i++;
					}
					push('number', start, i);
					return;
				}
			}
			while (i < len && (isDigit(code[i]) || code[i] === '.')) {
				i++;
			}
			// Scientific notation
			if (i < len && (code[i] === 'e' || code[i] === 'E')) {
				i++;
				if (i < len && (code[i] === '+' || code[i] === '-')) i++;
				while (i < len && isDigit(code[i])) i++;
			}
			push('number', start, i);
			return;
		}

		// Multi-char operators
		if (isOperatorChar(ch)) {
			// Try 3-char operators first
			if (i + 2 < len) {
				const three = code.slice(i, i + 3);
				if (MULTI_CHAR_OPERATORS.has(three)) {
					push('operator', i, i + 3);
					i += 3;
					return;
				}
			}
			// Try 2-char operators
			if (i + 1 < len) {
				const two = code.slice(i, i + 2);
				if (MULTI_CHAR_OPERATORS.has(two)) {
					push('operator', i, i + 2);
					i += 2;
					return;
				}
			}
			// Single-char operator
			push('operator', i, i + 1);
			i++;
			return;
		}

		// Punctuation: (, ), [, ], {, }, ;, ,
		if ('()[]{};,'.includes(ch)) {
			push('punctuation', i, i + 1);
			i++;
			return;
		}

		// Skip any other character
		i++;
	}

	while (i < len) {
		readDefaultToken();
	}

	return tokens;
};
