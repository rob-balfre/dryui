import { describe, test, expect } from 'bun:test';
import { GlobalWindow } from 'happy-dom';
import {
	getAccessibilityInfo,
	getDetailedComputedStyles,
	getElementClasses,
	getElementPath,
	getForensicComputedStyles,
	getFullElementPath,
	getNearbyElements,
	getNearbyText,
	identifyElement
} from '../../../packages/feedback/src/utils/element-id';

// Set up DOM globals for this test file
const happyWindow = new GlobalWindow();
(globalThis as typeof globalThis & Record<string, unknown>).window = happyWindow;
(globalThis as typeof globalThis & Record<string, unknown>).document = happyWindow.document;
(globalThis as typeof globalThis & Record<string, unknown>).HTMLElement = happyWindow.HTMLElement;
(globalThis as typeof globalThis & Record<string, unknown>).HTMLInputElement =
	happyWindow.HTMLInputElement;
(globalThis as typeof globalThis & Record<string, unknown>).HTMLTextAreaElement =
	happyWindow.HTMLTextAreaElement;
(globalThis as typeof globalThis & Record<string, unknown>).HTMLImageElement =
	happyWindow.HTMLImageElement;
(globalThis as typeof globalThis & Record<string, unknown>).SVGElement = happyWindow.SVGElement;
(globalThis as typeof globalThis & Record<string, unknown>).Element = happyWindow.Element;
(globalThis as typeof globalThis & Record<string, unknown>).ShadowRoot = happyWindow.ShadowRoot;

describe('identifyElement', () => {
	test('names button by text content', () => {
		const el = Object.assign(document.createElement('button'), { textContent: 'Click me' });
		const result = identifyElement(el);
		expect(result.name).toBe('button "Click me"');
	});

	test('names input by placeholder', () => {
		const el = document.createElement('input');
		el.placeholder = 'Email';
		const result = identifyElement(el);
		expect(result.name).toBe('input "Email"');
	});

	test('names input by aria-label', () => {
		const el = document.createElement('input');
		el.setAttribute('aria-label', 'Search');
		const result = identifyElement(el);
		expect(result.name).toBe('input "Search"');
	});

	test('names img by alt text', () => {
		const el = document.createElement('img');
		el.alt = 'Logo';
		const result = identifyElement(el);
		expect(result.name).toBe('image "Logo"');
	});

	test('names heading by text', () => {
		const el = Object.assign(document.createElement('h1'), { textContent: 'Hello World' });
		const result = identifyElement(el);
		expect(result.name).toBe('h1 "Hello World"');
	});

	test('names div by class when no text', () => {
		const el = document.createElement('div');
		el.className = 'card sidebar';
		const result = identifyElement(el);
		expect(result.name).toBe('div [card]');
	});

	test('names div by id when available', () => {
		const el = document.createElement('div');
		el.id = 'main-content';
		const result = identifyElement(el);
		expect(result.name).toBe('div #main-content');
	});

	test('truncates long text content', () => {
		const el = Object.assign(document.createElement('p'), {
			textContent:
				'This is a very long paragraph that should be truncated to a reasonable length for display'
		});
		const result = identifyElement(el);
		expect(result.name.length).toBeLessThanOrEqual(60);
		expect(result.name).toContain('...');
	});

	test('names svg as icon', () => {
		const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const result = identifyElement(el);
		expect(result.name).toBe('icon');
	});

	test('includes path in result', () => {
		const el = document.createElement('button');
		el.textContent = 'Submit';
		const result = identifyElement(el);
		expect(result.path).toBeDefined();
		expect(typeof result.path).toBe('string');
	});
});

describe('getElementPath', () => {
	test('builds path from element to ancestor', () => {
		const parent = document.createElement('form');
		const child = document.createElement('button');
		parent.appendChild(child);
		const path = getElementPath(child);
		expect(path).toBe('form > button');
	});

	test('limits depth to 4 levels', () => {
		let current = document.createElement('div');
		for (let i = 0; i < 8; i++) {
			const parent = document.createElement('div');
			parent.appendChild(current);
			current = parent;
		}
		const leaf = document.createElement('span');
		let deepest: Element = current;
		while (deepest.firstElementChild) deepest = deepest.firstElementChild;
		deepest.appendChild(leaf);
		const path = getElementPath(leaf);
		const parts = path.split(' > ');
		expect(parts.length).toBeLessThanOrEqual(4);
	});

	test('skips html and body', () => {
		const el = document.createElement('main');
		document.body.appendChild(el);
		const path = getElementPath(el);
		expect(path).not.toContain('html');
		expect(path).not.toContain('body');
		el.remove();
	});
});

describe('getNearbyText', () => {
	test('collects text from adjacent siblings', () => {
		const parent = document.createElement('div');
		const label = Object.assign(document.createElement('span'), { textContent: 'Name:' });
		const input = document.createElement('input');
		parent.append(label, input);
		const text = getNearbyText(input);
		expect(text).toContain('Name:');
	});

	test('returns empty string for isolated elements', () => {
		const el = document.createElement('div');
		const text = getNearbyText(el);
		expect(text).toBe('');
	});
});

describe('getNearbyElements', () => {
	test('collects nearby sibling labels and parent context', () => {
		const parent = document.createElement('section');
		parent.className = 'hero-grid_abc123';
		const button = Object.assign(document.createElement('button'), { textContent: 'Save changes' });
		const link = Object.assign(document.createElement('a'), { textContent: 'Learn more' });
		const target = document.createElement('div');
		parent.append(button, target, link);

		const result = getNearbyElements(target);
		expect(result).toContain('button "Save changes"');
		expect(result).toContain('a "Learn more"');
		expect(result).toContain('.hero-grid');
	});
});

describe('getElementClasses', () => {
	test('returns space-separated classes', () => {
		const el = document.createElement('div');
		el.className = 'foo bar baz';
		expect(getElementClasses(el)).toBe('foo bar baz');
	});

	test('returns empty string for no classes', () => {
		const el = document.createElement('div');
		expect(getElementClasses(el)).toBe('');
	});
});

describe('getDetailedComputedStyles', () => {
	test('captures relevant style properties for buttons', () => {
		const el = document.createElement('button');
		el.style.backgroundColor = 'rgb(255, 0, 0)';
		el.style.color = 'rgb(255, 255, 255)';
		el.style.padding = '12px';
		el.style.borderRadius = '8px';
		el.style.fontSize = '14px';
		document.body.appendChild(el);

		const styles = getDetailedComputedStyles(el);
		expect(styles.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(styles.padding).toBe('12px');
		expect(styles.borderRadius).toBe('8px');

		el.remove();
	});
});

describe('getForensicComputedStyles', () => {
	test('formats semicolon-separated forensic styles', () => {
		const el = document.createElement('div');
		el.style.display = 'grid';
		el.style.gap = '16px';
		el.style.padding = '20px';
		document.body.appendChild(el);

		const styles = getForensicComputedStyles(el);
		expect(styles).toContain('display: grid');
		expect(styles).toContain('gap: 16px');
		expect(styles).toContain('padding: 20px');

		el.remove();
	});
});

describe('getAccessibilityInfo', () => {
	test('captures aria and focusable metadata', () => {
		const el = document.createElement('button');
		el.setAttribute('aria-label', 'Save');
		el.setAttribute('aria-pressed', 'false');

		const info = getAccessibilityInfo(el);
		expect(info).toContain('aria-label="Save"');
		expect(info).toContain('aria-pressed=false');
		expect(info).toContain('focusable');
	});
});

describe('getFullElementPath', () => {
	test('includes ids, classes, and ancestry', () => {
		const main = document.createElement('main');
		main.id = 'app';
		const section = document.createElement('section');
		section.className = 'hero-shell_xyz123';
		const button = document.createElement('button');

		document.body.append(main);
		main.appendChild(section);
		section.appendChild(button);

		const path = getFullElementPath(button);
		expect(path).toContain('main#app');
		expect(path).toContain('section.hero-shell');
		expect(path).toContain('button:nth-of-type(1)');

		main.remove();
	});
});
