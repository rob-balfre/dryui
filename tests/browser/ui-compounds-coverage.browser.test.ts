import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import UiCompoundsCoverageHarness from './fixtures/ui-compounds-coverage-harness.svelte';
import { render } from './_harness';

function renderHarness() {
	return render(UiCompoundsCoverageHarness).target;
}

describe('ui compounds coverage harness', () => {
	it('renders alert parts and dismisses on close click', () => {
		renderHarness();

		const alert = document.querySelector<HTMLElement>('[data-testid="alert-root"]');
		const title = alert?.querySelector<HTMLElement>('[data-alert-title]');
		const description = alert?.querySelector<HTMLElement>('[data-alert-description]');
		const icon = alert?.querySelector<HTMLElement>('[data-alert-icon]');
		const close = alert?.querySelector<HTMLButtonElement>('[data-alert-close] button');
		const dismissals = document.querySelector<HTMLElement>('[data-testid="alert-dismissals"]');

		if (!alert || !title || !description || !icon || !close || !dismissals) {
			throw new Error('Expected alert harness elements');
		}

		expect(alert.getAttribute('data-variant')).toBe('warning');
		expect(alert.getAttribute('data-dismissible')).toBe('true');
		expect(title.textContent).toContain('Scheduled maintenance');
		expect(description.textContent).toContain('deploy window');
		expect(icon.textContent).toContain('!');

		close.click();
		flushSync();

		expect(document.querySelector('[data-testid="alert-root"]')).toBeNull();
		expect(dismissals.textContent).toBe('1');
	});

	it('handles interactive and disabled list items correctly', () => {
		renderHarness();

		const root = document.querySelector<HTMLElement>('[data-testid="list-root"]');
		const subheader = document.querySelector<HTMLElement>('[data-testid="list-subheader"]');
		const enabledItem = document.querySelector<HTMLElement>('[data-testid="list-item-enabled"]');
		const disabledItem = document.querySelector<HTMLElement>('[data-testid="list-item-disabled"]');
		const icon = document.querySelector<HTMLElement>('[data-testid="list-item-icon"]');
		const childrenText = document.querySelector<HTMLElement>(
			'[data-testid="list-item-text-children"]'
		);
		const snippetText = document.querySelector<HTMLElement>(
			'[data-testid="list-item-text-snippets"]'
		);
		const activations = document.querySelector<HTMLElement>('[data-testid="list-activations"]');

		if (
			!root ||
			!subheader ||
			!enabledItem ||
			!disabledItem ||
			!icon ||
			!childrenText ||
			!snippetText ||
			!activations
		) {
			throw new Error('Expected list harness elements');
		}

		expect(root.getAttribute('data-dense')).toBe('true');
		expect(root.getAttribute('data-disable-padding')).toBe('true');
		expect(subheader.getAttribute('role')).toBe('presentation');
		expect(enabledItem.getAttribute('role')).toBe('button');
		expect(enabledItem.getAttribute('tabindex')).toBe('0');
		expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
		expect(disabledItem.getAttribute('tabindex')).toBeNull();
		expect(icon.textContent).toBe('1');
		expect(childrenText.textContent).toContain('Ship docs update');
		expect(snippetText.textContent).toContain('Rollback window');
		expect(snippetText.textContent).toContain('Disabled until checks pass');

		enabledItem.click();
		enabledItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		disabledItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		flushSync();

		expect(activations.textContent).toBe('2');
	});

	it('renders the full table structure including wrapper, caption, and footer', () => {
		const target = renderHarness();

		const table = target.querySelector<HTMLTableElement>('[data-testid="table-root"]');
		const caption = target.querySelector<HTMLElement>('[data-testid="table-caption"]');
		const headerCells = Array.from(target.querySelectorAll<HTMLTableCellElement>('thead th'));
		const bodyRows = Array.from(target.querySelectorAll<HTMLTableRowElement>('tbody tr'));
		const footerCells = Array.from(target.querySelectorAll<HTMLTableCellElement>('tfoot td'));

		if (!table || !caption) {
			throw new Error('Expected table harness elements');
		}

		expect(table.closest('[data-table-wrapper]')).not.toBeNull();
		expect(caption.textContent).toContain('Recent package checks');
		expect(headerCells).toHaveLength(3);
		expect(headerCells[0]?.getAttribute('scope')).toBe('col');
		expect(bodyRows).toHaveLength(2);
		expect(footerCells.map((cell) => cell.textContent?.trim())).toEqual([
			'Total',
			'2 suites',
			'29s'
		]);
	});

	it('renders a horizontal timeline with filled and empty icons', () => {
		renderHarness();

		const root = document.querySelector<HTMLElement>('[data-testid="timeline-root"]');
		const firstItem = document.querySelector<HTMLElement>('[data-testid="timeline-item-first"]');
		const filledIcon = document.querySelector<HTMLElement>('[data-testid="timeline-icon-filled"]');
		const emptyIcon = document.querySelector<HTMLElement>('[data-testid="timeline-icon-empty"]');
		const time = document.querySelector<HTMLElement>('[data-testid="timeline-time"]');
		const title = document.querySelector<HTMLElement>('[data-testid="timeline-title"]');
		const description = document.querySelector<HTMLElement>('[data-testid="timeline-description"]');

		if (!root || !firstItem || !filledIcon || !emptyIcon || !time || !title || !description) {
			throw new Error('Expected timeline harness elements');
		}

		expect(root.getAttribute('data-orientation')).toBe('horizontal');
		expect(firstItem.getAttribute('role')).toBe('listitem');
		expect(filledIcon.textContent).toBe('1');
		expect(emptyIcon.textContent).toBe('');
		expect(time.getAttribute('datetime')).toBe('2026-04-12');
		expect(title.textContent).toContain('Coverage scripts added');
		expect(description.textContent).toContain('entrypoints now run together');
	});
});
