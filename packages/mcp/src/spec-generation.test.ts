import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadComponentMeta } from './load-component-meta.ts';
import { generateSpec } from './spec-generation.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiSrc = resolve(__dirname, '../../ui/src');
const primSrc = resolve(__dirname, '../../primitives/src');
const specPath = resolve(__dirname, 'spec.json');

describe('generateSpec', () => {
	test('recreates the checked-in generated spec', async () => {
		const { entries } = await loadComponentMeta();
		const spec = await generateSpec({ uiSrc, primSrc, componentMeta: entries });
		const generated = JSON.stringify(spec, null, 2);
		const checkedIn = await readFile(specPath, 'utf8');

		expect(generated).toBe(checkedIn);
	});
});
