import { describe, test, expect, spyOn } from 'bun:test';
import { dryuiLint } from './preprocessor.js';

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

	test('markup hook warns on anchor without href', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint();
		pp.markup!({
			content: '<a onclick={handleClick}>Apply preset</a>',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-anchor-without-href');
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

	test('style hook can opt into raw grid warnings', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint({ forbidRawGrid: true });
		pp.style!({
			content: '.foo { display: grid; }',
			attributes: {},
			markup: '',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalled();
		const msg = spy.mock.calls[0]![0] as string;
		expect(msg).toContain('dryui/no-raw-grid');
		spy.mockRestore();
	});

	test('markup hook can opt into component-only warnings', () => {
		const spy = spyOn(console, 'warn').mockImplementation(() => {});
		const pp = dryuiLint({ componentsOnly: true });
		pp.markup!({
			content: '<div><span>content</span></div>',
			filename: 'test.svelte'
		});
		expect(spy).toHaveBeenCalledTimes(2);
		const messages = spy.mock.calls.map((call) => call[0] as string);
		expect(messages[0]).toContain('dryui/no-raw-element');
		expect(messages[0]).toContain('<div>');
		expect(messages[1]).toContain('<span>');
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

	test('strict component-only mode throws on raw elements', () => {
		const pp = dryuiLint({ strict: true, componentsOnly: true });
		expect(() => {
			pp.markup!({
				content: '<div>content</div>',
				filename: 'test.svelte'
			});
		}).toThrow('dryui/no-raw-element');
	});

	test('auto-skips files inside node_modules even in strict mode', () => {
		const pp = dryuiLint({ strict: true });
		expect(() => {
			pp.markup!({
				content: '<div style="color: red">{@attach foo}</div>',
				filename: '/Users/jane/proj/node_modules/@dryui/feedback/src/feedback.svelte'
			});
		}).not.toThrow();
	});

	test('auto-skips workspace-linked @dryui/* package source by package.json name', async () => {
		const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
		const { tmpdir } = await import('node:os');
		const { resolve } = await import('node:path');

		// Simulate a `link:@dryui/feedback` resolution: the file lives at the
		// real path of an `@dryui/feedback` package, NOT under node_modules.
		const root = mkdtempSync(resolve(tmpdir(), 'dryui-lint-link-'));
		const pkgDir = resolve(root, 'packages/feedback');
		mkdirSync(resolve(pkgDir, 'src'), { recursive: true });
		writeFileSync(
			resolve(pkgDir, 'package.json'),
			JSON.stringify({ name: '@dryui/feedback', version: '0.0.0' })
		);
		const filePath = resolve(pkgDir, 'src/feedback.svelte');

		try {
			const pp = dryuiLint({ strict: true, componentsOnly: true });
			expect(() => {
				pp.markup!({
					content: '<div style="color: red">{@attach foo}</div>',
					filename: filePath
				});
			}).not.toThrow();
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	test('can lint first-party @dryui/* package source in strict mode', async () => {
		const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
		const { tmpdir } = await import('node:os');
		const { resolve } = await import('node:path');

		const root = mkdtempSync(resolve(tmpdir(), 'dryui-lint-first-party-'));
		const pkgDir = resolve(root, 'packages/feedback-server');
		mkdirSync(resolve(pkgDir, 'src'), { recursive: true });
		writeFileSync(
			resolve(pkgDir, 'package.json'),
			JSON.stringify({ name: '@dryui/feedback-server', version: '0.0.0' })
		);
		const filePath = resolve(pkgDir, 'src/App.svelte');

		try {
			const pp = dryuiLint({ strict: true, includeDryuiPackages: true });
			expect(() => {
				pp.markup!({
					content: '<div style="color: red">{@attach foo}</div>',
					filename: filePath
				});
			}).toThrow('dryui/no-inline-style');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	test('can limit linting to included paths', async () => {
		const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
		const { tmpdir } = await import('node:os');
		const { resolve } = await import('node:path');

		const root = mkdtempSync(resolve(tmpdir(), 'dryui-lint-include-'));
		const appDir = resolve(root, 'packages/feedback-server/ui/src');
		const primitiveDir = resolve(root, 'packages/primitives/src/button');
		mkdirSync(appDir, { recursive: true });
		mkdirSync(primitiveDir, { recursive: true });
		writeFileSync(
			resolve(root, 'packages/feedback-server/package.json'),
			JSON.stringify({ name: '@dryui/feedback-server', version: '0.0.0' })
		);
		writeFileSync(
			resolve(root, 'packages/primitives/package.json'),
			JSON.stringify({ name: '@dryui/primitives', version: '0.0.0' })
		);

		try {
			const pp = dryuiLint({
				strict: true,
				includeDryuiPackages: true,
				include: [appDir]
			});
			expect(() => {
				pp.markup!({
					content: '<button type="button">Toggle</button>',
					filename: resolve(primitiveDir, 'button.svelte')
				});
			}).not.toThrow();
			expect(() => {
				pp.markup!({
					content: '<div style="color: red">{@attach foo}</div>',
					filename: resolve(appDir, 'App.svelte')
				});
			}).toThrow('dryui/no-inline-style');
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
