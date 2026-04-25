#!/usr/bin/env bun
// Generates packages/feedback/src/components/component-schemas.ts from the
// Props interfaces in @dryui/ui's *.svelte.d.ts files. The feedback widget's
// "Edit props" panel renders typed form controls based on this schema.
//
// Run: bun scripts/extract-feedback-schemas.ts

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UI_SRC = join(import.meta.dir, '..', 'packages', 'ui', 'src');
const OUT = join(
	import.meta.dir,
	'..',
	'packages',
	'feedback',
	'src',
	'components',
	'component-schemas.ts'
);

type FieldType =
	| { kind: 'enum'; options: string[] }
	| { kind: 'boolean' }
	| { kind: 'number' }
	| { kind: 'string' }
	| { kind: 'snippet' };

type Field = {
	name: string;
	optional: boolean;
	type: FieldType;
};

const SKIP_PROPS = new Set(['ref', 'class', 'className', 'children', 'style']);
const PROP_PRIORITY: Record<string, number> = {
	variant: 0,
	size: 1,
	color: 2,
	value: 3,
	placeholder: 4,
	checked: 5,
	disabled: 6,
	open: 7
};

function stripComments(input: string): string {
	let out = '';
	let i = 0;
	while (i < input.length) {
		const c = input[i];
		if (c === '/' && input[i + 1] === '*') {
			const end = input.indexOf('*/', i + 2);
			i = end === -1 ? input.length : end + 2;
			continue;
		}
		if (c === '/' && input[i + 1] === '/') {
			const end = input.indexOf('\n', i + 2);
			i = end === -1 ? input.length : end + 1;
			out += '\n';
			continue;
		}
		out += c;
		i++;
	}
	return out;
}

function extractPropsBody(source: string): string | null {
	const cleaned = stripComments(source);
	const decl = cleaned.match(/interface\s+Props\b[^{]*{/);
	if (!decl) return null;
	const start = decl.index! + decl[0].length;
	let depth = 1;
	let i = start;
	while (i < cleaned.length && depth > 0) {
		const c = cleaned[i];
		if (c === '{') depth++;
		else if (c === '}') depth--;
		i++;
	}
	if (depth !== 0) return null;
	return cleaned.slice(start, i - 1);
}

function parseTypeString(raw: string): FieldType | null {
	const value = raw.trim().replace(/\s*\|\s*(undefined|null)\b/g, '');
	if (/\bSnippet\b/.test(value)) return { kind: 'snippet' };
	if (/^boolean$/.test(value)) return { kind: 'boolean' };
	if (/^number$/.test(value)) return { kind: 'number' };
	if (/^string$/.test(value)) return { kind: 'string' };
	const literalUnion = value.match(/^(?:'[^']+')(?:\s*\|\s*'[^']+')+$/);
	if (literalUnion) {
		const options = value.split(/\s*\|\s*/).map((token) => token.replace(/^'|'$/g, ''));
		return { kind: 'enum', options };
	}
	const single = value.match(/^'([^']+)'$/);
	if (single) return { kind: 'enum', options: [single[1]] };
	if (/string\s*&\s*\{\s*\}/.test(value)) return { kind: 'string' };
	if (value.includes("'") && value.includes('|')) {
		const tokens = value
			.split(/\s*\|\s*/)
			.map((t) => t.trim())
			.filter((t) => /^'[^']+'$/.test(t))
			.map((t) => t.replace(/^'|'$/g, ''));
		if (tokens.length > 0) return { kind: 'enum', options: tokens };
	}
	return null;
}

function splitFields(body: string): string[] {
	const parts: string[] = [];
	let depth = 0;
	let buf = '';
	for (const ch of body) {
		if (ch === '<' || ch === '(' || ch === '[' || ch === '{') depth++;
		else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') depth--;
		if (ch === ';' && depth === 0) {
			if (buf.trim()) parts.push(buf);
			buf = '';
			continue;
		}
		buf += ch;
	}
	if (buf.trim()) parts.push(buf);
	return parts;
}

function parseFields(body: string): Field[] {
	const out: Field[] = [];
	for (const part of splitFields(body)) {
		const trimmed = part.trim();
		if (!trimmed || trimmed.startsWith('readonly ')) continue;
		const match = trimmed.match(/^(\w+)(\?)?\s*:\s*([\s\S]+)$/);
		if (!match) continue;
		const [, name, optional, typeStr] = match;
		if (SKIP_PROPS.has(name)) continue;
		const type = parseTypeString(typeStr);
		if (!type) continue;
		out.push({ name, optional: !!optional, type });
	}
	return out;
}

function findComponentName(source: string): string | null {
	const cleaned = stripComments(source);
	const match = cleaned.match(/declare\s+const\s+(\w+)\s*:\s*import\(['"]svelte['"]\)\.Component/);
	return match ? match[1] : null;
}

function sortFields(fields: Field[]): Field[] {
	return [...fields].sort((a, b) => {
		const pa = PROP_PRIORITY[a.name] ?? 999;
		const pb = PROP_PRIORITY[b.name] ?? 999;
		if (pa !== pb) return pa - pb;
		return a.name.localeCompare(b.name);
	});
}

const schemas: Record<string, Field[]> = {};

for (const dirent of readdirSync(UI_SRC, { withFileTypes: true })) {
	if (!dirent.isDirectory()) continue;
	const dirPath = join(UI_SRC, dirent.name);
	for (const file of readdirSync(dirPath)) {
		if (!file.endsWith('.svelte.d.ts')) continue;
		const filePath = join(dirPath, file);
		try {
			if (!statSync(filePath).isFile()) continue;
		} catch {
			continue;
		}
		const source = readFileSync(filePath, 'utf8');
		const name = findComponentName(source);
		if (!name) continue;
		const body = extractPropsBody(source);
		if (!body) continue;
		const fields = sortFields(parseFields(body));
		if (fields.length === 0) continue;
		schemas[name] = fields;
	}
}

const sortedNames = Object.keys(schemas).sort();
const lines: string[] = [];
lines.push('// AUTO-GENERATED by scripts/extract-feedback-schemas.ts');
lines.push('// Re-run that script when DryUI component prop signatures change.');
lines.push('');
lines.push('export type SchemaFieldType =');
lines.push("\t| { kind: 'enum'; options: string[] }");
lines.push("\t| { kind: 'boolean' }");
lines.push("\t| { kind: 'number' }");
lines.push("\t| { kind: 'string' }");
lines.push("\t| { kind: 'snippet' };");
lines.push('');
lines.push('export type SchemaField = {');
lines.push('\tname: string;');
lines.push('\toptional: boolean;');
lines.push('\ttype: SchemaFieldType;');
lines.push('};');
lines.push('');
lines.push('export const COMPONENT_SCHEMAS: Record<string, SchemaField[]> = {');
for (const name of sortedNames) {
	lines.push(`\t${JSON.stringify(name)}: [`);
	for (const field of schemas[name]) {
		lines.push(`\t\t${JSON.stringify(field)},`);
	}
	lines.push('\t],');
}
lines.push('};');
lines.push('');

writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote schemas for ${sortedNames.length} components to ${OUT}`);
