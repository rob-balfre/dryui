import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { userEvent } from 'vitest/browser';
import PaletteHarness from './fixtures/design-palette-harness.svelte';
import DesignModeHarness from './fixtures/design-mode-harness.svelte';
import RearrangeHarness from './fixtures/rearrange-overlay-harness.svelte';
import RearrangeStateHarness from './fixtures/rearrange-overlay-state-harness.svelte';
import {
	generateDesignOutput,
	generateRearrangeOutput,
	detectPageSections
} from '../../packages/feedback/src/layout-mode';

let cleanup: (() => void) | undefined;

afterEach(() => {
	cleanup?.();
	cleanup = undefined;
	document.body.innerHTML = '';
});

function setup(
	component:
		| typeof PaletteHarness
		| typeof DesignModeHarness
		| typeof RearrangeHarness
		| typeof RearrangeStateHarness,
	props: Record<string, unknown> = {}
) {
	const target = document.createElement('div');
	document.body.appendChild(target);
	const instance = mount(component, { target, props });
	cleanup = () => {
		unmount(instance);
		target.remove();
	};
	flushSync();
	return target;
}

async function settle() {
	await new Promise((resolve) => setTimeout(resolve, 0));
	flushSync();
}

describe('layout mode components', () => {
	it('renders the design palette and selects a component', () => {
		const target = setup(PaletteHarness);
		expect(target.querySelector('[data-layout-mode-palette]')).toBeTruthy();
		expect(
			target.querySelector(
				'[data-layout-palette-item-preview] [data-design-skeleton-type="navigation"]'
			)
		).toBeTruthy();

		const button = Array.from(target.querySelectorAll('button')).find((element) =>
			element.textContent?.includes('Navigation')
		) as HTMLButtonElement | undefined;
		expect(button).toBeTruthy();
		button!.click();
		flushSync();

		expect(target.querySelector('[data-testid="value"]')?.textContent).not.toBe('null');
	});

	it('filters the design palette and shows an empty state for unmatched searches', async () => {
		const target = setup(PaletteHarness);
		const search = target.querySelector(
			'input[placeholder="Search components"]'
		) as HTMLInputElement;
		expect(search).toBeTruthy();

		await userEvent.fill(search, 'nav');
		flushSync();

		expect(target.querySelector('[data-layout-palette-item="navigation"]')).toBeTruthy();
		expect(target.querySelector('[data-layout-palette-item="card"]')).toBeNull();

		await userEvent.fill(search, 'zzzz');
		flushSync();

		expect(target.textContent).toContain('No components found');

		const clearSearch = Array.from(target.querySelectorAll('button')).find((element) =>
			element.textContent?.includes('Clear search')
		) as HTMLButtonElement | undefined;
		expect(clearSearch).toBeTruthy();
		await userEvent.click(clearSearch!);
		flushSync();

		expect(target.querySelector('[data-layout-palette-item="navigation"]')).toBeTruthy();
	});

	it('toggles wireframe mode, updates the prompt, and clears layout changes from the palette', async () => {
		const target = setup(PaletteHarness);

		const wireframeToggle = target.querySelector(
			'[data-layout-wireframe-toggle]'
		) as HTMLButtonElement;
		expect(wireframeToggle).toBeTruthy();
		wireframeToggle.click();
		flushSync();
		await settle();
		expect(target.querySelector('[data-testid="purpose"]')?.textContent).toBe('new-page');
		const wireframePalette = document.querySelector('[data-layout-mode-palette]') as HTMLElement;
		expect(wireframePalette.querySelector('textarea')).toBeTruthy();

		const textarea = wireframePalette.querySelector('textarea') as HTMLTextAreaElement;
		await userEvent.fill(textarea, 'Design a simple landing page');
		flushSync();
		expect(textarea.value).toBe('Design a simple landing page');

		const clearButton = Array.from(target.querySelectorAll('button')).find((element) =>
			element.textContent?.includes('Clear')
		) as HTMLButtonElement | undefined;
		expect(clearButton).toBeTruthy();
		clearButton!.click();
		flushSync();
		expect(target.querySelector('[data-testid="cleared"]')?.textContent).toBe('1');

		wireframeToggle.click();
		flushSync();
		await settle();
		await new Promise((resolve) => setTimeout(resolve, 50));
		flushSync();
		expect(target.querySelector('[data-testid="purpose"]')?.textContent).toBe('replace-current');
		expect(
			(target.querySelector('[data-layout-wireframe-prompt-wrap]') as HTMLElement).style
				.gridTemplateRows
		).toBe('0fr');
	});

	it('renders the design mode overlay and tracks selection', async () => {
		const target = setup(DesignModeHarness);
		expect(target.querySelector('[data-layout-mode]')).toBeTruthy();

		const overlay = target.querySelector('[data-layout-mode]') as HTMLElement;
		await userEvent.click(overlay);
		flushSync();

		expect(target.querySelector('[data-testid="placements"]')?.textContent).toBe('1');
		expect(target.querySelector('[data-testid="active"]')?.textContent).toBe('null');
	});

	it('edits and clears placement text through the shared popup', async () => {
		const target = setup(DesignModeHarness);
		const overlay = target.querySelector('[data-layout-mode]') as HTMLElement;
		await userEvent.click(overlay);
		flushSync();

		const placement = target.querySelector('[data-placement-id]') as HTMLButtonElement;
		expect(placement).toBeTruthy();
		placement.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		flushSync();

		const textarea = target.querySelector('textarea') as HTMLTextAreaElement;
		expect(textarea).toBeTruthy();
		await userEvent.fill(textarea, 'Card title');
		flushSync();

		const submitButton = target.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
		expect(submitButton).toBeTruthy();
		await userEvent.click(submitButton);
		flushSync();
		expect(target.querySelector('[data-testid="first-text"]')?.textContent).toBe('Card title');

		const updatedPlacement = target.querySelector('[data-placement-id]') as HTMLButtonElement;
		updatedPlacement.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		flushSync();

		const deleteButton = target.querySelector('[data-testid="delete-btn"]') as HTMLButtonElement;
		expect(deleteButton).toBeTruthy();
		await userEvent.click(deleteButton);
		flushSync();

		expect(target.querySelector('[data-testid="first-text"]')?.textContent).toBe('');
	});

	it('renders component wireframes with external placement chrome', () => {
		const target = setup(DesignModeHarness, {
			initialActiveComponent: null,
			initialPlacements: [
				{
					id: 'dp-nav',
					type: 'navigation',
					x: 40,
					y: 40,
					width: 320,
					height: 56,
					scrollY: 0,
					timestamp: Date.now(),
					text: 'Primary navigation'
				}
			]
		});

		const placement = target.querySelector('[data-placement-id="dp-nav"]') as HTMLElement;
		expect(placement).toBeTruthy();
		expect(placement.querySelector('[data-design-placement-content]')).toBeTruthy();
		expect(placement.querySelector('[data-design-placement-label]')?.textContent).toBe('Navbar');
		expect(placement.querySelector('[data-design-placement-note]')?.textContent).toBe(
			'Primary navigation'
		);
	});

	it('resizes a placed component through the east handle', async () => {
		const target = setup(DesignModeHarness);
		const overlay = target.querySelector('[data-layout-mode]') as HTMLElement;
		await userEvent.click(overlay);
		flushSync();

		const placement = target.querySelector('[data-placement-id]') as HTMLElement;
		expect(placement).toBeTruthy();
		expect(target.querySelector('[data-testid="first-size"]')?.textContent).toBe('280 x 240');

		const rect = placement.getBoundingClientRect();
		const handle = target.querySelector('[aria-label="Resize e"]') as HTMLButtonElement;
		expect(handle).toBeTruthy();

		handle.dispatchEvent(
			new MouseEvent('mousedown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: rect.right,
				clientY: rect.top + rect.height / 2
			})
		);
		window.dispatchEvent(
			new MouseEvent('mousemove', {
				bubbles: true,
				clientX: rect.right + 40,
				clientY: rect.top + rect.height / 2
			})
		);
		window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		flushSync();

		expect(target.querySelector('[data-testid="first-size"]')?.textContent).toBe('320 x 240');
	});

	it('deletes a placed component through the inline control', async () => {
		const target = setup(DesignModeHarness);
		const overlay = target.querySelector('[data-layout-mode]') as HTMLElement;
		await userEvent.click(overlay);
		flushSync();

		expect(target.querySelector('[data-testid="placements"]')?.textContent).toBe('1');
		const deleteButton = target.querySelector(
			'[data-testid="design-delete-btn"]'
		) as HTMLButtonElement;
		expect(deleteButton).toBeTruthy();
		await userEvent.click(deleteButton);
		flushSync();

		expect(target.querySelector('[data-testid="placements"]')?.textContent).toBe('0');
	});

	it('supports marquee selection when no design tool is active', async () => {
		const target = setup(DesignModeHarness, {
			initialActiveComponent: null,
			initialPlacements: [
				{
					id: 'dp-1',
					type: 'card',
					x: 40,
					y: 40,
					width: 120,
					height: 80,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-2',
					type: 'card',
					x: 360,
					y: 40,
					width: 120,
					height: 80,
					scrollY: 0,
					timestamp: Date.now()
				}
			]
		});

		const overlay = target.querySelector('[data-layout-mode]') as HTMLElement;
		expect(overlay).toBeTruthy();

		overlay.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: 20,
				clientY: 20
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: 180,
				clientY: 140
			})
		);
		flushSync();

		expect(target.querySelector('[data-design-select-box]')).toBeTruthy();

		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 180,
				clientY: 140
			})
		);
		flushSync();

		expect(target.querySelector('[data-testid="selected"]')?.textContent).toBe('1');
	});

	it('selects all placements from the keyboard', () => {
		const target = setup(DesignModeHarness, {
			initialActiveComponent: null,
			initialPlacements: [
				{
					id: 'dp-1',
					type: 'card',
					x: 40,
					y: 40,
					width: 120,
					height: 80,
					scrollY: 0,
					timestamp: Date.now()
				},
				{
					id: 'dp-2',
					type: 'button',
					x: 220,
					y: 40,
					width: 140,
					height: 40,
					scrollY: 0,
					timestamp: Date.now()
				}
			]
		});

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
		flushSync();

		expect(target.querySelector('[data-testid="selected"]')?.textContent).toBe('2');
	});

	it('duplicates selected placements from the keyboard', async () => {
		const target = setup(DesignModeHarness, {
			initialActiveComponent: null,
			initialPlacements: [
				{
					id: 'dp-1',
					type: 'card',
					x: 40,
					y: 40,
					width: 120,
					height: 80,
					scrollY: 0,
					timestamp: Date.now()
				}
			]
		});

		const placement = target.querySelector('[data-placement-id="dp-1"]') as HTMLButtonElement;
		expect(placement).toBeTruthy();
		await userEvent.click(placement);
		flushSync();

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }));
		flushSync();

		expect(target.querySelector('[data-testid="placements"]')?.textContent).toBe('2');
		expect(target.querySelector('[data-testid="selected"]')?.textContent).toBe('1');

		const placements = Array.from(target.querySelectorAll('[data-placement-id]')) as HTMLElement[];
		expect(placements).toHaveLength(2);
		expect(new Set(placements.map((element) => element.style.left)).size).toBe(2);
	});

	it('duplicates selected placements on option-drag', async () => {
		const target = setup(DesignModeHarness, {
			initialActiveComponent: null,
			initialPlacements: [
				{
					id: 'dp-1',
					type: 'card',
					x: 40,
					y: 40,
					width: 120,
					height: 80,
					scrollY: 0,
					timestamp: Date.now()
				}
			]
		});

		const placement = target.querySelector('[data-placement-id="dp-1"]') as HTMLElement;
		expect(placement).toBeTruthy();

		placement.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: 100,
				clientY: 80
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				altKey: true,
				clientX: 180,
				clientY: 140
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: 180,
				clientY: 140
			})
		);
		flushSync();

		expect(target.querySelector('[data-testid="placements"]')?.textContent).toBe('2');

		const placements = Array.from(target.querySelectorAll('[data-placement-id]')) as HTMLElement[];
		expect(placements).toHaveLength(2);
		expect(new Set(placements.map((element) => element.style.left)).size).toBe(2);
	});

	it('renders the rearrange overlay and deletes a selected section', async () => {
		const target = setup(RearrangeHarness);
		await settle();
		const section = target.querySelector('[data-rearrange-section]') as HTMLElement;
		section.dispatchEvent(
			new MouseEvent('mousedown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: 400,
				clientY: 28
			})
		);
		window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		flushSync();

		expect(target.querySelector('[data-testid="selected"]')?.textContent).toBe('1');
		const deleteButton = target.querySelector(
			'[aria-label="Delete Navigation"]'
		) as HTMLButtonElement;
		expect(deleteButton).toBeTruthy();
		deleteButton.click();
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 220));
		flushSync();
		expect(target.querySelector('[data-testid="sections"]')?.textContent).toBe('0');
	});

	it('renders unchanged sections separately from changed ghost sections', async () => {
		const target = setup(RearrangeStateHarness);
		await settle();

		expect(target.querySelectorAll('[data-rearrange-state="unchanged"]')).toHaveLength(1);
		expect(target.querySelectorAll('[data-rearrange-state="changed"]')).toHaveLength(1);
		expect(target.textContent).toContain('Suggested Move & Resize');
		expect(target.querySelector('[data-rearrange-connector]')).toBeTruthy();
	});

	it('resizes a rearrange section through the east handle', async () => {
		const target = setup(RearrangeHarness);
		await settle();
		const section = target.querySelector('[data-rearrange-section]') as HTMLButtonElement;
		await userEvent.click(section);
		flushSync();

		const handle = target.querySelector('[aria-label="Resize e"]') as HTMLButtonElement;
		expect(handle).toBeTruthy();
		expect(target.querySelector('[data-testid="first-size"]')?.textContent).toBe('800 x 56');

		handle.dispatchEvent(
			new MouseEvent('mousedown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: 800,
				clientY: 28
			})
		);
		window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 840, clientY: 28 }));
		window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		flushSync();

		expect(target.querySelector('[data-testid="first-size"]')?.textContent).toBe('840 x 56');
		expect(target.textContent).toContain('Suggested Resize');
		expect(target.querySelector('[data-rearrange-connector]')).toBeTruthy();
	});

	it('hides stale rearrange sections when their source element is removed', async () => {
		const target = setup(RearrangeHarness);
		await settle();
		expect(target.querySelector('[data-rearrange-section]')).toBeTruthy();

		const sourceNav = document.querySelector('[data-source-nav]') as HTMLElement | null;
		expect(sourceNav).toBeTruthy();
		sourceNav.remove();
		await settle();

		expect(target.querySelector('[data-rearrange-section]')).toBeNull();
	});

	it('edits and clears a rearrange section note through the popup editor', async () => {
		const target = setup(RearrangeHarness);
		await settle();

		const section = target.querySelector('[data-rearrange-section]') as HTMLButtonElement;
		expect(section).toBeTruthy();
		section.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		flushSync();

		const textarea = target.querySelector('textarea') as HTMLTextAreaElement;
		expect(textarea).toBeTruthy();
		await userEvent.fill(textarea, 'Move this below the hero');
		flushSync();

		const submitButton = target.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
		expect(submitButton).toBeTruthy();
		await userEvent.click(submitButton);
		flushSync();
		expect(target.querySelector('[data-testid="first-note"]')?.textContent).toBe(
			'Move this below the hero'
		);

		const updatedSection = target.querySelector('[data-rearrange-section]') as HTMLButtonElement;
		updatedSection.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		flushSync();

		const deleteButton = target.querySelector('[data-testid="delete-btn"]') as HTMLButtonElement;
		expect(deleteButton).toBeTruthy();
		await userEvent.click(deleteButton);
		flushSync();

		expect(target.querySelector('[data-testid="first-note"]')?.textContent).toBe('');
	});
});

describe('layout mode output helpers', () => {
	it('detects sections through SvelteKit-style wrapper chains', () => {
		document.body.innerHTML = `
      <div style="display: contents;">
        <div class="app-shell">
          <div class="page-container">
            <div class="page-stack">
              <section style="width: 640px; height: 140px;"><h1>Hero</h1></section>
              <section style="width: 640px; height: 180px;"><h2>Results</h2></section>
            </div>
          </div>
        </div>
      </div>
      <div data-dryui-feedback style="position: fixed; width: 44px; height: 44px;"></div>
    `;

		const sections = detectPageSections();

		expect(sections).toHaveLength(2);
		expect(sections.every((section) => section.selector.includes('section:nth-child('))).toBe(true);
	});

	it('generates design output for the current document', () => {
		document.body.innerHTML =
			'<main><section style="width: 500px; height: 200px;"></section></main>';

		const output = generateDesignOutput(
			[
				{
					id: 'p1',
					type: 'card',
					x: 10,
					y: 20,
					width: 120,
					height: 80,
					scrollY: 0,
					timestamp: Date.now()
				}
			],
			{ width: window.innerWidth, height: window.innerHeight }
		);

		expect(output).toContain('Design Layout');
		expect(output).toContain('Card');
		expect(output).toContain('Layout Analysis');
		expect(output).toContain('Suggested Implementation');
	});

	it('generates rearrange output for moved sections', () => {
		const output = generateRearrangeOutput({
			sections: [
				{
					id: 's1',
					label: 'Header',
					tagName: 'header',
					selector: 'header',
					role: 'banner',
					className: null,
					textSnippet: null,
					originalRect: { x: 0, y: 0, width: 800, height: 80 },
					currentRect: { x: 0, y: 12, width: 800, height: 80 },
					originalIndex: 0
				}
			],
			originalOrder: ['s1'],
			detectedAt: Date.now()
		});

		expect(output).toContain('Suggested Layout Changes');
		expect(output).toContain('Header');
		expect(output).toContain('Changes:');
	});

	it('detects semantic sections in the current document', () => {
		document.body.innerHTML = `
      <main>
        <header aria-label="Site header" style="height: 80px;"></header>
        <section aria-label="Hero" style="height: 120px;"></section>
        <div data-dryui-feedback style="height: 120px;">Feedback UI</div>
      </main>
    `;

		const sections = detectPageSections();
		const labels = sections.map((section) => section.label);
		expect(labels).toContain('Site header');
		expect(labels).toContain('Hero');
		expect(labels).not.toContain('Feedback UI');
	});
});
