import { describe, expect, test } from 'bun:test';
import { GlobalWindow } from 'happy-dom';
import { detectDryUIComponent } from '../../../packages/feedback/src/utils/dryui-detection';

const happyWindow = new GlobalWindow();
(globalThis as typeof globalThis & Record<string, unknown>).window = happyWindow;
(globalThis as typeof globalThis & Record<string, unknown>).document = happyWindow.document;
(globalThis as typeof globalThis & Record<string, unknown>).Node = happyWindow.Node;
(globalThis as typeof globalThis & Record<string, unknown>).Element = happyWindow.Element;
(globalThis as typeof globalThis & Record<string, unknown>).Text = happyWindow.Text;
(globalThis as typeof globalThis & Record<string, unknown>).ShadowRoot = happyWindow.ShadowRoot;

describe('detectDryUIComponent', () => {
	test('detects a DryUI component from Svelte metadata and data attributes', () => {
		const hero = document.createElement('section');
		hero.setAttribute('data-align', 'left');
		Object.assign(hero, {
			__svelte_meta: {
				loc: {
					file: '/workspace/dryui/packages/ui/src/hero/hero-root.svelte'
				}
			}
		});

		expect(detectDryUIComponent(hero)).toBe('Hero align=left');
	});

	test('reads style props from DryUI CSS module classes once a DryUI component is identified', () => {
		const button = document.createElement('button');
		button.className =
			'button_button__q1w2e button_outline__q1w2e button_primary__q1w2e button_sm__q1w2e';
		Object.assign(button, {
			__svelte_meta: {
				loc: {
					file: '/workspace/dryui/packages/ui/src/button/button.svelte'
				}
			}
		});

		expect(detectDryUIComponent(button)).toBe('Button variant=outline color=primary size=sm');
	});

	test('falls back to a wrapper-plus-root class signature for real DryUI buttons when source metadata is unavailable', () => {
		const wrapper = document.createElement('span');
		wrapper.className = 'button_wrapper__q1w2e';

		const button = document.createElement('button');
		button.className =
			'button_button__q1w2e button_outline__q1w2e button_primary__q1w2e button_sm__q1w2e';
		wrapper.appendChild(button);

		expect(detectDryUIComponent(button)).toBe('Button variant=outline color=primary size=sm');
	});

	test('recognizes runtime CSS-module class names used by Svelte and Vite', () => {
		const wrapper = document.createElement('span');
		wrapper.className = '_wrapper_8x7yz_1';

		const button = document.createElement('button');
		button.className = '_button_8x7yz_2 _outline_8x7yz_6 _primary_8x7yz_9 _sm_8x7yz_12';
		wrapper.appendChild(button);

		expect(detectDryUIComponent(button)).toBe('Button variant=outline color=primary size=sm');
	});

	test('does not use unrelated runtime wrapper signatures as a DryUI fallback signal', () => {
		const wrapper = document.createElement('span');
		wrapper.className = '_wrapper_alpha_1';

		const button = document.createElement('button');
		button.className = '_button_beta_2 _outline_beta_3 _primary_beta_4 _sm_beta_5';
		wrapper.appendChild(button);

		expect(detectDryUIComponent(button)).toBeUndefined();
	});

	test('does not mislabel arbitrary CSS module classes as DryUI components', () => {
		const button = document.createElement('button');
		button.className =
			'button_button__q1w2e button_outline__q1w2e button_primary__q1w2e button_sm__q1w2e';

		expect(detectDryUIComponent(button)).toBeUndefined();
	});
});
