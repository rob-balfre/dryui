import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import PrimitivesRemediationDataGridHarness from './fixtures/primitives-remediation-data-grid-harness.svelte';
import PrimitivesRemediationMenuHarness from './fixtures/primitives-remediation-menu-harness.svelte';
import PrimitivesRemediationOverlayHarness from './fixtures/primitives-remediation-overlay-harness.svelte';
import PrimitivesRemediationSemanticsHarness from './fixtures/primitives-remediation-semantics-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

function render<ComponentProps extends Record<string, unknown>>(
	component: Parameters<typeof mount>[0],
	props?: ComponentProps
) {
	const target = document.createElement('div');
	document.body.append(target);

	const mounted = mount(component, {
		target,
		props
	});

	mountedComponents.push(mounted);
	flushSync();
	return target;
}

describe('primitives remediation', () => {
	it('keeps disabled links inert and only wires field ids when the parts mount', () => {
		render(PrimitivesRemediationSemanticsHarness);

		const link = document.querySelector<HTMLAnchorElement>('[data-testid="disabled-link"]');
		const clickCount = document.querySelector('[data-testid="link-clicks"]');
		const input = document.querySelector<HTMLInputElement>('[data-testid="field-input"]');

		if (!link || !clickCount || !input) {
			throw new Error('Expected semantics harness elements');
		}

		expect(link.hasAttribute('href')).toBe(false);
		expect(link.getAttribute('aria-disabled')).toBe('true');

		link.click();
		flushSync();

		expect(clickCount.textContent).toBe('0');
		expect(input.getAttribute('aria-describedby')).toBeNull();
		expect(input.getAttribute('aria-errormessage')).toBeNull();
	});

	it('references mounted description and error parts only', () => {
		render(PrimitivesRemediationSemanticsHarness, {
			includeDescription: true,
			includeError: true
		});

		const input = document.querySelector<HTMLInputElement>('[data-testid="field-input"]');
		const description = document.querySelector<HTMLElement>('[data-testid="field-description"]');
		const error = document.querySelector<HTMLElement>('[data-testid="field-error"]');

		if (!input || !description || !error) {
			throw new Error('Expected mounted field parts');
		}

		expect(input.getAttribute('aria-describedby')).toBe(description.id);
		expect(input.getAttribute('aria-errormessage')).toBe(error.id);
	});

	it('removes forced region semantics and maps toast variants to the correct live role', () => {
		render(PrimitivesRemediationSemanticsHarness);

		const card = document.querySelector<HTMLElement>('[data-testid="card-root"]');
		const navList = document.querySelector<HTMLElement>('[data-testid="navigation-list"]');
		const navbarItem = document.querySelector<HTMLElement>('[data-testid="navbar-item"]');
		const infoToast = document.querySelector<HTMLElement>('[data-testid="toast-info"]');
		const errorToast = document.querySelector<HTMLElement>('[data-testid="toast-error"]');

		if (!card || !navList || !navbarItem || !infoToast || !errorToast) {
			throw new Error('Expected semantic primitives');
		}

		expect(card.hasAttribute('role')).toBe(false);
		expect(navList.hasAttribute('role')).toBe(false);
		expect(navbarItem.getAttribute('aria-current')).toBe('page');
		expect(infoToast.getAttribute('role')).toBe('status');
		expect(infoToast.getAttribute('aria-live')).toBe('polite');
		expect(errorToast.getAttribute('role')).toBe('alert');
		expect(errorToast.getAttribute('aria-live')).toBe('assertive');
	});

	it('binds tooltip and popover semantics to the nested trigger element', () => {
		render(PrimitivesRemediationOverlayHarness);

		const tooltipButton = document.querySelector<HTMLButtonElement>(
			'[data-testid="tooltip-button"]'
		);
		const tooltipWrapper = document.querySelector<HTMLElement>('[data-testid="tooltip-wrapper"]');
		const popoverButton = document.querySelector<HTMLButtonElement>(
			'[data-testid="popover-button"]'
		);
		const popoverContent = document.querySelector<HTMLElement>('[data-testid="popover-content"]');

		if (!tooltipButton || !tooltipWrapper || !popoverButton || !popoverContent) {
			throw new Error('Expected overlay harness elements');
		}

		tooltipButton.focus();
		tooltipButton.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		flushSync();

		expect(tooltipButton.getAttribute('aria-describedby')).toBeTruthy();
		expect(tooltipWrapper.getAttribute('aria-describedby')).toBeNull();

		popoverButton.click();
		flushSync();

		expect(popoverButton.getAttribute('aria-controls')).toBe(popoverContent.id);
		expect(popoverButton.getAttribute('aria-expanded')).toBe('true');

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		flushSync();

		expect(popoverButton.getAttribute('aria-expanded')).toBe('false');
	});

	it('exposes disabled semantics for menu items and disabled select triggers', () => {
		render(PrimitivesRemediationMenuHarness);

		const selectTrigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="select-trigger"]'
		);
		const selectItem = document.querySelector<HTMLElement>('[data-testid="select-disabled-item"]');
		const dropdownItem = document.querySelector<HTMLElement>(
			'[data-testid="dropdown-disabled-item"]'
		);
		const contextItem = document.querySelector<HTMLElement>(
			'[data-testid="context-disabled-item"]'
		);

		if (!selectTrigger || !selectItem || !dropdownItem || !contextItem) {
			throw new Error('Expected menu harness elements');
		}

		expect(selectTrigger.disabled).toBe(true);
		expect(selectTrigger.getAttribute('aria-disabled')).toBe('true');
		expect(selectItem.getAttribute('aria-disabled')).toBe('true');
		expect(dropdownItem.getAttribute('aria-disabled')).toBe('true');
		expect(contextItem.getAttribute('aria-disabled')).toBe('true');
	});

	it('labels row selection checkboxes and supports keyboard resizing for grid columns', () => {
		render(PrimitivesRemediationDataGridHarness);

		const checkbox = Array.from(
			document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
		).find((input) => input.getAttribute('aria-label')?.includes('Ada Lovelace'));
		const column = document.querySelector<HTMLElement>('[data-testid="name-column"]');
		const resizeHandle = document.querySelector<HTMLElement>('[data-part="resize-handle"]');

		if (!checkbox || !column || !resizeHandle) {
			throw new Error('Expected data grid elements');
		}

		expect(checkbox.getAttribute('aria-label')).toBe('Select row Ada Lovelace');

		resizeHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		flushSync();

		expect(column.style.width).toMatch(/px$/);
		expect(Number.parseInt(column.style.width, 10)).toBeGreaterThanOrEqual(50);
	});
});
