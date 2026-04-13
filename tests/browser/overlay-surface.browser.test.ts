import { afterEach, describe, expect, it } from 'vitest';
import OverlaySurfaceHarness from './fixtures/overlay-surface-harness.svelte';
import { render } from './_harness';

type OverlayKind = 'alert-dialog' | 'dialog' | 'drawer' | 'command-palette';

afterEach(() => {
	delete document.documentElement.dataset.theme;
	document.documentElement.classList.remove('theme-auto');
});

function mountOverlay(kind: OverlayKind) {
	document.documentElement.dataset.theme = 'dark';

	render(OverlaySurfaceHarness, { kind });

	const dialog = document.querySelector('dialog[open]');
	if (!(dialog instanceof HTMLDialogElement)) {
		throw new Error(`Expected an open dialog for ${kind}`);
	}

	return dialog;
}

function getSemanticTextColor() {
	const probe = document.createElement('div');
	probe.style.color = 'var(--dry-color-text-strong)';
	document.body.append(probe);

	const color = getComputedStyle(probe).color;
	probe.remove();
	return color;
}

function getResolvedRadius(value: string) {
	const probe = document.createElement('div');
	probe.style.borderTopLeftRadius = value;
	document.body.append(probe);

	const radius = parseFloat(getComputedStyle(probe).borderTopLeftRadius);
	probe.remove();
	return radius;
}

describe('overlay surfaces', () => {
	it.each(['alert-dialog', 'dialog', 'drawer', 'command-palette'] as const)(
		'uses semantic text color for %s in dark mode',
		(kind) => {
			const dialog = mountOverlay(kind);
			const semanticText = getSemanticTextColor();

			expect(getComputedStyle(dialog).color).toBe(semanticText);
		}
	);

	it('keeps the dialog panel stretched across the dialog track', () => {
		const dialog = mountOverlay('dialog');
		const panel = dialog.querySelector<HTMLElement>('[data-dialog-panel]');

		expect(panel).toBeTruthy();

		const dialogWidth = dialog.getBoundingClientRect().width;
		const panelWidth = panel?.getBoundingClientRect().width ?? 0;

		expect(panelWidth).toBeGreaterThan(dialogWidth * 0.5);
	});

	it('caps command palette item radius when pill tokens are active', () => {
		document.documentElement.style.setProperty('--dry-radius-sm', '9999px');
		document.documentElement.style.setProperty('--dry-control-radius', '9999px');

		const dialog = mountOverlay('command-palette');
		const item = dialog.querySelector<HTMLElement>('[data-command-palette-item]');

		expect(item).toBeTruthy();
		expect(parseFloat(getComputedStyle(item!).borderTopLeftRadius)).toBe(
			getResolvedRadius('var(--dry-space-4)')
		);
	});
});
