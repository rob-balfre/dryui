import type { Token, Highlighter } from './types.js';

// Operates on raw (unescaped) source text. HTML escaping happens at render time in CodeBlock.
const HL_PATTERN =
	/(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|true|false|null|undefined|def|self|None|True|False|print|lambda|with|as|raise|except|pass|elif)\b)|(\b\d+\.?\d*(?:e[+-]?\d+)?\b)/gm;

export const genericHighlighter: Highlighter = (code: string): Token[] => {
	const tokens: Token[] = [];

	for (const match of code.matchAll(HL_PATTERN)) {
		const [full, comment, string, keyword, number] = match;
		let type: string;
		if (comment) type = 'comment';
		else if (string) type = 'string';
		else if (keyword) type = 'keyword';
		else if (number) type = 'number';
		else continue;

		const start = match.index ?? 0;
		tokens.push({ type, start, end: start + full.length });
	}

	return tokens;
};
