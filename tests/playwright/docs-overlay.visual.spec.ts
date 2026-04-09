import { expect, test, type Locator, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1200 } });

async function openComponentRoute(page: Page, slug: string) {
	const response = await page.goto(`/components/${slug}`, { waitUntil: 'domcontentloaded' });
	await forceLightTheme(page);
	await waitForFonts(page);
	await waitForHydration(page);
	// Trigger listeners for the docs demos are wired in client effects.
	await page.waitForTimeout(900);
	expect(
		response?.ok(),
		`expected /components/${slug} to return a successful response`
	).toBeTruthy();
}

async function getBox(locator: Locator, message: string) {
	const box = await locator.boundingBox();
	expect(box, message).not.toBeNull();
	return box!;
}

async function forceLightTheme(page: Page) {
	await page.evaluate(() => {
		document.documentElement.classList.remove('theme-auto', 'theme-dark');
		document.documentElement.classList.add('theme-light');
	});

	await page.waitForFunction(() => document.documentElement.classList.contains('theme-light'));
}

async function waitForFonts(page: Page) {
	await page.waitForFunction(() => document.fonts?.status !== 'loading');
}

async function waitForHydration(page: Page) {
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => resolve());
				});
			})
	);
}

test('backdrop demo opens the overlay preview and dismisses cleanly', async ({ page }) => {
	await openComponentRoute(page, 'backdrop');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Show Backdrop' });
	const backdrop = page.locator('[data-backdrop]');

	await trigger.click();

	await expect(backdrop).toBeVisible();
	await expect(backdrop.getByText('Content rendered over a backdrop overlay layer.')).toBeVisible();
	await expect(backdrop).toHaveScreenshot('docs-overlay-backdrop-open.png');

	await backdrop.click({ position: { x: 16, y: 16 } });
	await expect(backdrop).toBeHidden();
});

test('alert dialog demo opens and restores focus on cancel', async ({ page }) => {
	await openComponentRoute(page, 'alert-dialog');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Delete item' });
	const dialog = page.locator('[data-alert-dialog-content][open]');

	await expect.poll(async () => trigger.getAttribute('aria-expanded')).toBe('false');
	await trigger.click();

	await expect(dialog).toBeVisible();
	await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
	await expect(dialog).toHaveScreenshot('docs-overlay-alert-dialog-open.png');

	await page.getByRole('button', { name: 'Cancel' }).click();

	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('dialog demo opens, renders the content panel, and closes with escape', async ({ page }) => {
	await openComponentRoute(page, 'dialog');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Open Dialog' });
	const dialog = page.locator('[data-dialog-content][open]');
	const panel = dialog.locator('[data-dialog-panel]');

	await expect.poll(async () => trigger.getAttribute('aria-expanded')).toBe('false');
	await trigger.click();

	await expect(panel).toBeVisible();
	await expect(panel).toHaveScreenshot('docs-overlay-dialog-open.png');

	await page.keyboard.press('Escape');

	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('drawer demo opens on the right edge and closes with escape', async ({ page }) => {
	await openComponentRoute(page, 'drawer');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Open Drawer' });
	const drawer = page.locator('[data-drawer-content][open][data-side="right"]');
	const panel = drawer.locator('[data-drawer-panel]');

	await expect.poll(async () => trigger.getAttribute('aria-expanded')).toBe('false');
	await trigger.click();

	await expect(panel).toBeVisible();
	await expect(panel).toHaveScreenshot('docs-overlay-drawer-open.png');

	const panelBox = await getBox(panel, 'expected the drawer panel to have a visible box');
	const viewport = page.viewportSize();

	expect(viewport, 'expected the page viewport to be available').not.toBeNull();
	expect(
		panelBox.x,
		'expected the right-side drawer to live in the right half of the viewport'
	).toBeGreaterThan((viewport?.width ?? 0) / 2);
	expect(
		Math.abs(panelBox.x + panelBox.width - (viewport?.width ?? 0)),
		'expected the right-side drawer to align to the viewport edge'
	).toBeLessThanOrEqual(4);

	await page.keyboard.press('Escape');

	await expect(drawer).toBeHidden();
	await expect(trigger).toBeFocused();
});

test('command palette demo filters visible options', async ({ page }) => {
	await openComponentRoute(page, 'command-palette');

	const surface = page.locator('.demo-surface').first();
	await surface.getByRole('button', { name: 'Open Command Palette' }).click();

	const palette = page.locator('[data-command-palette-root][open]');
	const input = palette.getByPlaceholder('Type a command...');

	await expect(palette).toBeVisible();
	await expect(input).toBeFocused();

	await input.fill('settings');

	await expect(palette.locator('[data-command-palette-item]:visible')).toHaveCount(1);
	await expect(palette.getByRole('option', { name: 'Open settings' })).toBeVisible();
	await expect(palette).toHaveScreenshot('docs-overlay-command-palette-filtered.png');

	await page.keyboard.press('Escape');
	await expect(palette).toBeHidden();
});

test('context menu demo opens on right click and supports keyboard focus movement', async ({
	page
}) => {
	await openComponentRoute(page, 'context-menu');

	const trigger = page.getByText('Right-click here');
	const menu = page.locator('[data-context-menu-content]');

	await trigger.click({ button: 'right' });

	await expect(menu).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
	await expect(menu).toHaveScreenshot('docs-overlay-context-menu-open.png');

	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
});

test('dropdown menu demo opens below the trigger and supports keyboard focus movement', async ({
	page
}) => {
	await openComponentRoute(page, 'dropdown-menu');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Menu' });
	const menu = page.locator('[data-dropdown-menu-content]');

	await trigger.click();

	await expect(menu).toBeVisible();
	await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
	await expect(menu).toHaveScreenshot('docs-overlay-dropdown-menu-open.png');

	const triggerBox = await getBox(trigger, 'expected the dropdown trigger to have a visible box');
	const menuBox = await getBox(menu, 'expected the dropdown menu to have a visible box');

	expect(menuBox.y, 'expected the dropdown menu to open below the trigger').toBeGreaterThanOrEqual(
		triggerBox.y + triggerBox.height - 4
	);

	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
});

test('hover card demo opens on hover and closes after pointer exit', async ({ page }) => {
	await openComponentRoute(page, 'hover-card');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByText('Hover over me');
	const card = page.locator('[data-hover-card-content]');

	await trigger.hover();

	await expect(card).toBeVisible({ timeout: 2_000 });
	await expect(card).toHaveScreenshot('docs-overlay-hover-card-open.png');

	await page.getByRole('heading', { level: 1, name: 'HoverCard' }).hover();
	await expect(card).toBeHidden({ timeout: 2_000 });
});

test('notification center demo opens the panel without hydration issues', async ({ page }) => {
	await openComponentRoute(page, 'notification-center');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Notifications (2)' });
	const panel = page.locator('[data-notification-center-panel]');

	await trigger.click();

	await expect(panel).toBeVisible();
	await expect(panel).toHaveScreenshot('docs-overlay-notification-center-open.png');
	await expect(page.locator('[data-notification-center-item][data-state=\"unread\"]')).toHaveCount(
		2
	);

	await page.keyboard.press('Escape');
	await expect(panel).toBeHidden();
});

test('popover demo opens below the trigger and closes on outside click', async ({ page }) => {
	await openComponentRoute(page, 'popover');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Info' });
	const content = page.locator('[data-popover-content]');

	await trigger.click();

	await expect(content).toBeVisible();
	await expect(content).toHaveScreenshot('docs-overlay-popover-open.png');

	const triggerBox = await getBox(trigger, 'expected the popover trigger to have a visible box');
	const contentBox = await getBox(content, 'expected the popover content to have a visible box');

	expect(contentBox.y, 'expected the popover to open below the trigger').toBeGreaterThanOrEqual(
		triggerBox.y + triggerBox.height - 4
	);

	await page.mouse.click(24, 24);
	await expect(content).toBeHidden();
});

test('tooltip demo opens above the trigger and closes after pointer exit', async ({ page }) => {
	await openComponentRoute(page, 'tooltip');

	const surface = page.locator('.demo-surface').first();
	const trigger = surface.getByRole('button', { name: 'Hover me' });
	const content = page.locator('[data-tooltip-content]');

	await trigger.hover();

	await expect(content).toBeVisible({ timeout: 2_000 });
	await expect(content).toHaveScreenshot('docs-overlay-tooltip-open.png');

	const triggerBox = await getBox(trigger, 'expected the tooltip trigger to have a visible box');
	const contentBox = await getBox(content, 'expected the tooltip content to have a visible box');

	expect(
		contentBox.y + contentBox.height,
		'expected the tooltip to render above the trigger'
	).toBeLessThanOrEqual(triggerBox.y + 4);

	await page.getByRole('heading', { level: 1, name: 'Tooltip' }).hover();
	await expect(content).toBeHidden({ timeout: 2_000 });
});

test('tour demo supports next, previous, and finish across both steps', async ({ page }) => {
	await openComponentRoute(page, 'tour');

	const surface = page.locator('.demo-surface').first();
	const start = surface.getByRole('button', { name: 'Start Tour' });
	const tooltip = page.locator('[data-tour-tooltip]');
	const spotlight = page.locator('[data-tour-spotlight]');

	await start.click();

	await expect(spotlight).toBeVisible();
	await expect(tooltip).toBeVisible();
	await expect(tooltip).toContainText('Plan review');
	await expect(tooltip).toContainText('1 of 2');
	await expect(tooltip).toHaveScreenshot('docs-overlay-tour-step-1.png');

	await page.getByRole('button', { name: 'Next' }).click();

	await expect(tooltip).toContainText('Launch checklist');
	await expect(tooltip).toContainText('2 of 2');
	await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
	await expect(tooltip).toHaveAttribute('data-placement', 'left');
	await expect(tooltip).toHaveScreenshot('docs-overlay-tour-step-2.png');

	await page.getByRole('button', { name: 'Previous' }).click();
	await expect(tooltip).toContainText('Plan review');

	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Finish' }).click();

	await expect(tooltip).toBeHidden();
	await expect(spotlight).toBeHidden();
});
