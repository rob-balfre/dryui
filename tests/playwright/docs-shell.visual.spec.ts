import { expect, test } from '@playwright/test';
import { openDocsRoute } from './docs-visual.helpers';

test.use({ viewport: { width: 1440, height: 900 } });

test('desktop docs navigation scrolls independently', async ({ page }) => {
	const response = await openDocsRoute(page, '/components/scroll-area');
	expect(
		response?.ok(),
		'expected /components/scroll-area to return a successful response'
	).toBeTruthy();

	const navContent = page.locator('.docs-nav [data-sidebar-content]').first();
	await expect(navContent).toBeVisible();

	const metrics = await navContent.evaluate((node) => ({
		clientHeight: node.clientHeight,
		scrollHeight: node.scrollHeight,
		scrollTop: node.scrollTop
	}));

	expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
	expect(metrics.scrollTop).toBe(0);

	await navContent.hover();
	await page.mouse.wheel(0, 600);

	await expect.poll(async () => navContent.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
});
