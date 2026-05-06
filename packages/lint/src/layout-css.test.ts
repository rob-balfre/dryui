import { describe, expect, spyOn, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { evaluateLayoutContract } from './layout-contract.js';
import { checkLayoutCss, dryuiLayoutCss } from './layout-css.js';

describe('checkLayoutCss', () => {
	test('accepts valid layout.css page layout rules', () => {
		const css = `
[data-layout='stack'] {
  display: grid;
  grid-template-columns: minmax(0, 42rem);
  grid-template-areas: 'masthead' 'main';
  min-block-size: 100dvh;
  container-type: inline-size;
  container-name: stack;
  gap: var(--dry-space-4);
  padding-block: calc(var(--dry-space-4) + var(--dry-space-2));
  margin-inline: auto;
  align-items: start;
  justify-content: space-between;
}

@container page (min-width: 40rem) {
  [data-layout='stack'] > [data-layout-area='aside'] {
    grid-area: aside;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    padding-inline: var(--dry-space-6);
    place-items: center stretch;
  }
}`;
		expect(checkLayoutCss(css)).toHaveLength(0);
	});

	test('rejects invalid properties', () => {
		const violations = checkLayoutCss('[data-layout] { color: red; border: 1px solid red; }');
		expect(violations.map((violation) => violation.rule)).toEqual([
			'dryui/layout-css-property',
			'dryui/layout-css-property'
		]);
		expect(violations.map((violation) => violation.message).join('\n')).toContain('color');
	});

	test('rejects invalid spacing and alignment values', () => {
		const violations = checkLayoutCss(`
[data-layout] {
  gap: 1rem;
  justify-items: right-now;
  display: block;
}`);
		expect(violations.map((violation) => violation.rule)).toEqual([
			'dryui/layout-css-value',
			'dryui/layout-css-value',
			'dryui/layout-css-value'
		]);
		expect(violations[0]!.message).toContain('gap');
		expect(violations[1]!.message).toContain('justify-items');
		expect(violations[2]!.message).toContain('display');
	});

	test('rejects selectors without layout data hooks', () => {
		const violations = checkLayoutCss('.card { gap: var(--dry-space-3); }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-selector');
	});

	test('rejects mixed selectors that target classes through layout hooks', () => {
		const violations = checkLayoutCss("[data-layout='stack'] .card { gap: var(--dry-space-3); }");
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-selector');
	});

	test('rejects bare area selectors as global leakage', () => {
		const violations = checkLayoutCss(
			"[data-layout-area='aside'] { grid-area: aside; gap: var(--dry-space-3); }"
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-selector');
	});

	test('rejects bare area selectors inside @container page', () => {
		const violations = checkLayoutCss(`
@container page (min-width: 48rem) {
  [data-layout-area='aside'] {
    grid-area: aside;
  }
}`);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-selector');
	});

	test('accepts area selectors scoped under a layout hook', () => {
		const violations = checkLayoutCss(
			"[data-layout='stack'] > [data-layout-area='main'] { grid-area: main; }"
		);
		expect(violations).toHaveLength(0);
	});

	test('rejects @media wrappers', () => {
		const violations = checkLayoutCss(
			'@media (min-width: 48rem) { [data-layout] { gap: var(--dry-space-4); } }'
		);
		expect(violations.some((violation) => violation.rule === 'dryui/layout-css-at-rule')).toBe(
			true
		);
	});

	test('rejects unnamed @container wrappers', () => {
		const violations = checkLayoutCss(
			"@container (min-width: 48rem) { [data-layout='stack'] { gap: var(--dry-space-4); } }"
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-at-rule');
	});

	test('rejects non-page named @container wrappers', () => {
		const violations = checkLayoutCss(
			"@container shell (min-width: 48rem) { [data-layout='stack'] { gap: var(--dry-space-4); } }"
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-at-rule');
	});

	test('rejects non-container at-rules', () => {
		const violations = checkLayoutCss(
			"@supports (display: grid) { [data-layout='stack'] { display: grid; } }"
		);
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-at-rule');
	});

	test('does not allow text-align as a box-alignment property', () => {
		const violations = checkLayoutCss('[data-layout] { text-align: center; }');
		expect(violations).toHaveLength(1);
		expect(violations[0]!.rule).toBe('dryui/layout-css-property');
	});

	test('includes existing generic style checks', () => {
		const violations = checkLayoutCss('[data-layout] { gap: var(--dry-space-2) !important; }');
		expect(violations.some((violation) => violation.rule === 'dryui/no-important')).toBe(true);
	});
});

describe('evaluateLayoutContract', () => {
	test('preserves declaration property and value facts', () => {
		const result = evaluateLayoutContract(`
[data-layout='stack'] {
  grid-template-columns: minmax(0, 42rem);
  padding-block: calc(var(--dry-space-4) + var(--dry-space-2));
}`);
		expect(result.diagnostics).toHaveLength(0);
		expect(result.facts.declarations.map(({ property, value }) => [property, value])).toEqual([
			['grid-template-columns', 'minmax(0, 42rem)'],
			['padding-block', 'calc(var(--dry-space-4) + var(--dry-space-2))']
		]);
	});
});

describe('dryuiLayoutCss Vite plugin', () => {
	test('warns when src/layout.css is missing', () => {
		const root = mkdtempSync(resolve(tmpdir(), 'dryui-layout-css-missing-'));
		const warn = spyOn(console, 'warn').mockImplementation(() => {});
		try {
			const plugin = dryuiLayoutCss({ root });
			expect(() => plugin.buildStart!()).not.toThrow();
			expect(warn).toHaveBeenCalledTimes(1);
			expect(warn.mock.calls[0]![0]).toContain('src/layout.css was not found');
		} finally {
			warn.mockRestore();
			rmSync(root, { recursive: true, force: true });
		}
	});

	test('watches the canonical file during dev even when it is missing', () => {
		const root = mkdtempSync(resolve(tmpdir(), 'dryui-layout-css-watch-'));
		try {
			const watched: string[] = [];
			const plugin = dryuiLayoutCss({ root });
			plugin.configureServer!({ watcher: { add: (path) => watched.push(path) } });
			expect(watched).toEqual([resolve(root, 'src/layout.css')]);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	test('throws on layout.css violations during build', () => {
		const root = mkdtempSync(resolve(tmpdir(), 'dryui-layout-css-invalid-'));
		try {
			mkdirSync(resolve(root, 'src'), { recursive: true });
			writeFileSync(resolve(root, 'src/layout.css'), "[data-layout='stack'] { width: 100%; }");
			const plugin = dryuiLayoutCss({ root });
			expect(() => plugin.buildStart!()).toThrow('dryui/layout-css-property');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	test('checks layout.css during hot updates', () => {
		const root = mkdtempSync(resolve(tmpdir(), 'dryui-layout-css-hmr-'));
		try {
			mkdirSync(resolve(root, 'src'), { recursive: true });
			const file = resolve(root, 'src/layout.css');
			writeFileSync(file, "[data-layout='stack'] { gap: 12px; }");
			const plugin = dryuiLayoutCss({ root });
			expect(() => plugin.handleHotUpdate!({ file })).toThrow('dryui/layout-css-value');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
