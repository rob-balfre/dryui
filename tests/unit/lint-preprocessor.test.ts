import { describe, test, expect, spyOn } from 'bun:test';
import { dryuiLint } from '../../packages/lint/src/index.js';

describe('dryuiLint preprocessor', () => {
	test('returns a PreprocessorGroup with name', () => {
		const pp = dryuiLint();
		expect(pp.name).toBe('dryui-lint');
		expect(pp.script).toBeFunction();
		expect(pp.markup).toBeFunction();
		expect(pp.style).toBeFunction();
	});

	test('script hook warns on banned import', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.script!({
			content: "import { Stack } from '@dryui/ui/stack';",
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-layout-component');
		expect(msg).toContain('test.svelte');
		spy.mockRestore();
	});

	test('markup hook warns on inline style', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.markup!({
			content: '<div style="color: red">hi</div>',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-inline-style');
		spy.mockRestore();
	});

	test('style hook warns on display: flex', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.style!({
			content: '.foo { display: flex; }',
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-flex');
		spy.mockRestore();
	});

	test('style hook warns on all: unset', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.style!({
			content: '.foo { all: unset; }',
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-all-unset');
		spy.mockRestore();
	});

	test('strict mode throws on violation', () => {
		const pp = dryuiLint({ strict: true });
		expect(() => {
			pp.style!({
				content: '.foo { display: flex; }',
				attributes: {},
				markup: '',
				filename: 'test.svelte'
			});
		}).toThrow('dryui/no-flex');
	});

	test('strict mode throws on all: unset', () => {
		const pp = dryuiLint({ strict: true });
		expect(() => {
			pp.style!({
				content: '.foo { all: unset; }',
				attributes: {},
				markup: '',
				filename: 'test.svelte'
			});
		}).toThrow('dryui/no-all-unset');
	});

	test('no warnings when code is clean', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.script!({
			content: "import { Button } from '@dryui/ui';",
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		pp.markup!({
			content: '<div class="page-grid"><Button>click</Button></div>',
			filename: 'test.svelte'
		});
		pp.style!({
			content:
				'.page-grid { display: grid; gap: var(--dry-space-4); container-type: inline-size; }',
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	test('markup hook warns on svelte-ignore css_unused_selector', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.markup!({
			content: '<!-- svelte-ignore css_unused_selector -->\n<div>hi</div>',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-css-ignore');
		spy.mockRestore();
	});

	test('strict mode throws on svelte-ignore css_unused_selector', () => {
		const pp = dryuiLint({ strict: true });
		expect(() => {
			pp.markup!({
				content: '<!-- svelte-ignore css_unused_selector -->\n<div>hi</div>',
				filename: 'test.svelte'
			});
		}).toThrow('dryui/no-css-ignore');
	});

	test('hooks return undefined (no code transformation)', () => {
		const pp = dryuiLint();
		const scriptResult = pp.script!({
			content: "import { Button } from '@dryui/ui';",
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		const markupResult = pp.markup!({
			content: '<div>hi</div>',
			filename: 'test.svelte'
		});
		const styleResult = pp.style!({
			content: '.foo { display: grid; }',
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		expect(scriptResult).toBeUndefined();
		expect(markupResult).toBeUndefined();
		expect(styleResult).toBeUndefined();
	});

	test('markup hook warns on raw native element when filename token does not match', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.markup!({
			content: '<button type="button">Toggle</button>',
			filename: 'mega-menu-trigger.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-raw-native-element');
		expect(msg).toContain('mega-menu-trigger.svelte');
		spy.mockRestore();
	});

	test('strict mode throws on raw native element when filename token does not match', () => {
		const pp = dryuiLint({ strict: true });
		expect(() => {
			pp.markup!({
				content: '<button type="button">Toggle</button>',
				filename: 'mega-menu-trigger.svelte'
			});
		}).toThrow('dryui/no-raw-native-element');
	});
});
