import { afterEach, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalWindow } from 'happy-dom';
import {
	detectSvelteMetadata,
	hasSvelteMetadata
} from '../../../packages/feedback/src/utils/svelte-detection';

const happyWindow = new GlobalWindow();

(globalThis as typeof globalThis & Record<string, unknown>).document = happyWindow.document;
(globalThis as typeof globalThis & Record<string, unknown>).Node = happyWindow.Node;
(globalThis as typeof globalThis & Record<string, unknown>).Element = happyWindow.Element;
(globalThis as typeof globalThis & Record<string, unknown>).HTMLElement = happyWindow.HTMLElement;
(globalThis as typeof globalThis & Record<string, unknown>).ShadowRoot = happyWindow.ShadowRoot;

function attachMeta(node: Node, file: string, line?: number, useStartLine: boolean = false): void {
	const loc = useStartLine
		? { file, start: line ? { line } : undefined }
		: { file, ...(line ? { line } : {}) };

	Object.assign(node, {
		__svelte_meta: {
			loc
		}
	});
}

beforeAll(() => {
	document.body.innerHTML = '';
});

afterEach(() => {
	document.body.innerHTML = '';
});

describe('detectSvelteMetadata', () => {
	test('returns an empty result when Svelte metadata is absent', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);

		expect(detectSvelteMetadata(button)).toEqual({
			componentStack: [],
			sourceFiles: []
		});
		expect(hasSvelteMetadata(button)).toBe(false);
	});

	test('collects a userland source file and root-to-leaf component stack', () => {
		const page = document.createElement('main');
		const form = document.createElement('form');
		const button = document.createElement('button');

		attachMeta(page, '/workspace/app/src/routes/+page.svelte', 4);
		attachMeta(form, '/workspace/app/src/lib/Form.svelte', 12);
		attachMeta(button, '/workspace/app/src/lib/SubmitButton.svelte', 28);

		form.appendChild(button);
		page.appendChild(form);
		document.body.appendChild(page);

		expect(detectSvelteMetadata(button)).toEqual({
			sourceFile: 'src/lib/SubmitButton.svelte:28',
			svelteComponent: '+page > Form > SubmitButton',
			componentStack: ['+page', 'Form', 'SubmitButton'],
			sourceFiles: ['src/routes/+page.svelte', 'src/lib/Form.svelte', 'src/lib/SubmitButton.svelte']
		});
	});

	test('filters framework noise and collapses duplicate entries from the same component', () => {
		const page = document.createElement('main');
		const wrapper = document.createElement('div');
		const button = document.createElement('button');

		attachMeta(
			page,
			'/workspace/app/node_modules/svelte/src/internal/client/render.js',
			1
		);
		attachMeta(wrapper, '/workspace/app/src/lib/ButtonGroup.svelte', 9);
		attachMeta(button, '/workspace/app/src/lib/ButtonGroup.svelte', 22);

		wrapper.appendChild(button);
		page.appendChild(wrapper);
		document.body.appendChild(page);

		expect(detectSvelteMetadata(button)).toEqual({
			sourceFile: 'src/lib/ButtonGroup.svelte:22',
			svelteComponent: 'ButtonGroup',
			componentStack: ['ButtonGroup'],
			sourceFiles: ['src/lib/ButtonGroup.svelte']
		});
	});

	test('supports loc.start.line metadata and crosses shadow root boundaries', () => {
		const host = document.createElement('div');
		attachMeta(host, '/workspace/app/src/lib/Popover.svelte', 8, true);
		document.body.appendChild(host);

		const shadow = host.attachShadow({ mode: 'open' });
		const item = document.createElement('button');
		const label = document.createElement('span');
		attachMeta(item, '/workspace/app/src/lib/MenuItem.svelte', 17);
		item.appendChild(label);
		shadow.appendChild(item);

		expect(detectSvelteMetadata(label)).toEqual({
			sourceFile: 'src/lib/MenuItem.svelte:17',
			svelteComponent: 'Popover > MenuItem',
			componentStack: ['Popover', 'MenuItem'],
			sourceFiles: ['src/lib/Popover.svelte', 'src/lib/MenuItem.svelte']
		});
	});

	test('normalizes file URLs and keeps non-src user files when they are not internal', () => {
		const route = document.createElement('section');
		const child = document.createElement('div');

		attachMeta(route, 'file:///workspace/project/routes/+layout.svelte', 2);
		attachMeta(child, 'file:///workspace/project/routes/dashboard/index.svelte', 14);

		route.appendChild(child);
		document.body.appendChild(route);

		expect(detectSvelteMetadata(child)).toEqual({
			sourceFile: 'routes/dashboard/index.svelte:14',
			svelteComponent: '+layout > Dashboard',
			componentStack: ['+layout', 'Dashboard'],
			sourceFiles: ['routes/+layout.svelte', 'routes/dashboard/index.svelte']
		});
	});
});
