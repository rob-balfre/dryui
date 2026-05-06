import { buildLineIndex, lookupLine } from './css-scan.js';

const SCRIPT_BLOCK_RE = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const SCRIPT_OR_STYLE_BLOCK_RE = /<(?:script|style)[\s>][\s\S]*?<\/(?:script|style)>/gi;

export interface SvelteBlock {
	readonly content: string;
	readonly index: number;
	readonly contentStart: number;
	readonly line: number;
}

export interface DryUiImport {
	readonly name: string;
	readonly source: '@dryui/ui' | '@dryui/primitives';
	readonly specifier: string;
	readonly line: number;
	readonly index: number;
}

export interface SvelteComponentUsage {
	readonly name: string;
	readonly line: number;
	readonly index: number;
	readonly props: string[];
	readonly hasSpread: boolean;
	readonly selfClosing: boolean;
}

function collectBlocks(content: string, re: RegExp): SvelteBlock[] {
	const lineStarts = buildLineIndex(content);
	const blocks: SvelteBlock[] = [];

	for (const match of content.matchAll(re)) {
		const index = match.index ?? 0;
		const tagEnd = content.indexOf('>', index);
		const contentStart = tagEnd === -1 ? index : tagEnd + 1;
		blocks.push({
			content: match[1] ?? '',
			index,
			contentStart,
			line: lookupLine(lineStarts, contentStart)
		});
	}

	return blocks;
}

export function collectSvelteScriptBlocks(content: string): SvelteBlock[] {
	return collectBlocks(content, SCRIPT_BLOCK_RE);
}

export function collectSvelteStyleBlocks(content: string): SvelteBlock[] {
	return collectBlocks(content, STYLE_BLOCK_RE);
}

export function stripSvelteScriptAndStyleBlocks(content: string): string {
	return content.replace(SCRIPT_OR_STYLE_BLOCK_RE, (match) => {
		let count = 0;
		for (let i = 0; i < match.length; i++) {
			if (match.charCodeAt(i) === 10 /* \n */) count++;
		}
		return '\n'.repeat(count);
	});
}

export function extractSvelteScriptBody(content: string): string {
	return collectSvelteScriptBlocks(content)[0]?.content ?? '';
}

export function collectDryUiImports(scriptBody: string): DryUiImport[] {
	const imports: DryUiImport[] = [];
	if (!scriptBody) return imports;

	const lineStarts = buildLineIndex(scriptBody);
	const importRegex =
		/import\s*\{([^}]+)\}\s*from\s*['"](@dryui\/(?:ui|primitives)(?:\/[^'"]*)?)['"]/g;

	for (const match of scriptBody.matchAll(importRegex)) {
		const raw = match[1] ?? '';
		const specifier = match[2];
		if (!specifier) continue;
		const source = specifier.startsWith('@dryui/primitives') ? '@dryui/primitives' : '@dryui/ui';

		for (const name of raw.split(',')) {
			const trimmed = name.trim();
			if (!trimmed) continue;
			imports.push({
				name: trimmed,
				source,
				specifier,
				line: lookupLine(lineStarts, match.index ?? 0),
				index: match.index ?? 0
			});
		}
	}

	return imports;
}

function stripBraceExpressions(input: string): string {
	let result = '';
	let depth = 0;
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		if (char === '{') {
			if (depth === 0) result += '{}';
			depth++;
		} else if (char === '}') {
			depth--;
		} else if (depth === 0) {
			result += char;
		}
	}
	return result;
}

export function extractSveltePropsFromAttrs(attrsStr: string): string[] {
	const props: string[] = [];
	if (!attrsStr.trim()) return props;

	const shorthandRegex = /(?:^|\s)\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/g;
	for (const match of attrsStr.matchAll(shorthandRegex)) {
		const propName = match[1];
		if (propName && !props.includes(propName)) props.push(propName);
	}

	const stripped = stripBraceExpressions(
		attrsStr.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''")
	);

	const bindRegex = /\bbind:([a-zA-Z_][a-zA-Z0-9_]*)/g;
	for (const match of stripped.matchAll(bindRegex)) {
		const bound = match[1];
		if (bound) props.push('bind:' + bound);
	}

	const cssCustomPropertyRegex = /(?<![\w-])(--[a-zA-Z_][a-zA-Z0-9_-]*)\s*=/g;
	for (const match of stripped.matchAll(cssCustomPropertyRegex)) {
		const propName = match[1];
		if (propName && !props.includes(propName)) props.push(propName);
	}

	const namedRegex = /(?<![\w:-])([a-zA-Z_][a-zA-Z0-9_-]*)\s*=/g;
	for (const match of stripped.matchAll(namedRegex)) {
		const propName = match[1];
		if (propName && !props.includes(propName)) props.push(propName);
	}

	const boolRegex = /(?<!\.)(?<![:{-])\b([a-zA-Z_][a-zA-Z0-9_-]*)\b(?!\s*=)/g;
	for (const match of stripped.matchAll(boolRegex)) {
		const propName = match[1];
		if (!propName) continue;
		if (props.includes(propName) || props.includes('bind:' + propName) || propName === 'bind') {
			continue;
		}
		props.push(propName);
	}

	return props;
}

export function collectSvelteComponentUsages(template: string): SvelteComponentUsage[] {
	const lineStarts = buildLineIndex(template);
	const tagRegex = /<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)\s*([^>]*?)(\/)?>/g;
	const tags: SvelteComponentUsage[] = [];

	for (const match of template.matchAll(tagRegex)) {
		const name = match[1] ?? '';
		const attrsStr = match[2] ?? '';
		tags.push({
			name,
			line: lookupLine(lineStarts, match.index ?? 0),
			index: match.index ?? 0,
			props: extractSveltePropsFromAttrs(attrsStr),
			hasSpread: /\{\.\.\./.test(attrsStr),
			selfClosing: match[3] === '/'
		});
	}

	return tags;
}
