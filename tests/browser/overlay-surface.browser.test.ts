import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import OverlaySurfaceHarness from './fixtures/overlay-surface-harness.svelte';

type OverlayKind = 'alert-dialog' | 'dialog' | 'drawer' | 'command-palette';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	delete document.documentElement.dataset.theme;
	document.documentElement.classList.remove('theme-auto');
	document.body.replaceChildren();
});

function mountOverlay(kind: OverlayKind) {
	document.documentElement.dataset.theme = 'dark';

	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(OverlaySurfaceHarness, {
		target,
		props: { kind }
	});

	mountedComponents.push(component);
	flushSync();

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
});
