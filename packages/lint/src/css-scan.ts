const CSS_COMMENT_RE = /\/\*[\s\S]*?\*\//g;

export interface CssBlock {
	readonly selector: string;
	readonly bodyStart: number;
	readonly bodyEnd: number;
}

export interface CssDeclaration {
	readonly property: string;
	readonly value: string;
	readonly index: number;
}

export function stripCssComments(content: string): string {
	return content.replace(CSS_COMMENT_RE, (match) =>
		match
			.split('')
			.map((char) => (char === '\n' ? '\n' : ' '))
			.join('')
	);
}

export function buildLineIndex(content: string): number[] {
	const starts = [0];
	for (let i = 0; i < content.length; i++) {
		if (content.charCodeAt(i) === 10) starts.push(i + 1);
	}
	return starts;
}

export function lookupLine(lineStarts: readonly number[], index: number): number {
	let lo = 0;
	let hi = lineStarts.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >>> 1;
		if (lineStarts[mid]! <= index) lo = mid;
		else hi = mid - 1;
	}
	return lo + 1;
}

function findMatchingBrace(content: string, openIndex: number): number {
	let depth = 0;
	let quote: '"' | "'" | null = null;

	for (let i = openIndex; i < content.length; i++) {
		const char = content[i]!;
		if (quote) {
			if (char === quote && content[i - 1] !== '\\') quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}
		if (char === '{') depth += 1;
		if (char === '}') {
			depth -= 1;
			if (depth === 0) return i;
		}
	}

	return content.length;
}

export function parseCssBlocks(content: string, start = 0, end = content.length): CssBlock[] {
	const blocks: CssBlock[] = [];
	let cursor = start;

	while (cursor < end) {
		while (cursor < end && /\s|;/.test(content[cursor]!)) cursor += 1;
		if (cursor >= end) break;

		const blockStart = content.indexOf('{', cursor);
		const semicolon = content.indexOf(';', cursor);
		if (blockStart === -1 || blockStart >= end || (semicolon !== -1 && semicolon < blockStart)) {
			cursor = semicolon === -1 ? end : semicolon + 1;
			continue;
		}

		const selector = content.slice(cursor, blockStart).trim();
		const blockEnd = findMatchingBrace(content, blockStart);
		blocks.push({ selector, bodyStart: blockStart + 1, bodyEnd: blockEnd });
		cursor = blockEnd + 1;
	}

	return blocks;
}

export function splitTopLevel(input: string, delimiter: string): string[] {
	const parts: string[] = [];
	let start = 0;
	let depth = 0;
	let quote: '"' | "'" | null = null;

	for (let i = 0; i < input.length; i++) {
		const char = input[i]!;
		if (quote) {
			if (char === quote && input[i - 1] !== '\\') quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}
		if (char === '(') depth += 1;
		if (char === ')') depth = Math.max(0, depth - 1);
		if (char === delimiter && depth === 0) {
			parts.push(input.slice(start, i).trim());
			start = i + 1;
		}
	}

	parts.push(input.slice(start).trim());
	return parts.filter(Boolean);
}

export function splitCssWhitespace(input: string): string[] {
	const parts: string[] = [];
	let start = 0;
	let depth = 0;
	let quote: '"' | "'" | null = null;

	for (let i = 0; i < input.length; i++) {
		const char = input[i]!;
		if (quote) {
			if (char === quote && input[i - 1] !== '\\') quote = null;
			continue;
		}
		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}
		if (char === '(') depth += 1;
		if (char === ')') depth = Math.max(0, depth - 1);
		if (/\s/.test(char) && depth === 0) {
			const part = input.slice(start, i).trim();
			if (part) parts.push(part);
			start = i + 1;
		}
	}

	const tail = input.slice(start).trim();
	if (tail) parts.push(tail);
	return parts;
}

export function declarationEntries(content: string, start: number, end: number): CssDeclaration[] {
	const declarations: CssDeclaration[] = [];
	const body = content.slice(start, end);
	let offset = 0;
	for (const chunk of splitTopLevel(body, ';')) {
		const local = body.indexOf(chunk, offset);
		const index = local === -1 ? start + offset : start + local;
		offset = local === -1 ? offset + chunk.length : local + chunk.length;
		if (!chunk.includes(':')) continue;
		const colon = chunk.indexOf(':');
		const property = chunk.slice(0, colon).trim().toLowerCase();
		const value = chunk.slice(colon + 1).trim();
		if (!property) continue;
		declarations.push({ property, value, index });
	}
	return declarations;
}
