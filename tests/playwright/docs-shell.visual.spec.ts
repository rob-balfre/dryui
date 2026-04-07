import { expect, test } from '@playwright/test';
import { openDocsRoute } from './docs-visual.helpers';

test.use({ viewport: { width: 1440, height: 900 } });

test('desktop docs navigation scrolls independently', async ({ page }) => {
	const response = await openDocsRoute(page, '/components/scroll-area');
	expect(
		response?.ok(),
		'expected /components/scroll-area to return a successful response'
	).toBeTruthy();

	const nav = page.locator('.docs-nav').first();
	const navContent = page.locator('.docs-nav [data-sidebar-content]').first();
	await expect(nav).toBeVisible();
	await expect(navContent).toBeVisible();

	const [navMetrics, metrics] = await Promise.all([
		nav.evaluate((node) => ({
			clientHeight: node.clientHeight,
			clientWidth: node.clientWidth,
			scrollHeight: node.scrollHeight,
			scrollTop: node.scrollTop,
			scrollWidth: node.scrollWidth
		})),
		navContent.evaluate((node) => {
			const navNode = node.closest('.docs-nav');
			const navWidth = navNode instanceof HTMLElement ? navNode.getBoundingClientRect().width : 0;

			return {
				clientHeight: node.clientHeight,
				clientWidth: node.clientWidth,
				scrollHeight: node.scrollHeight,
				scrollTop: node.scrollTop,
				scrollWidth: node.scrollWidth,
				scrollbarGutter: getComputedStyle(node).scrollbarGutter,
				width: node.getBoundingClientRect().width,
				navWidth
			};
		})
	]);

	expect(
		navMetrics.scrollWidth,
		'expected .docs-nav not to overflow horizontally'
	).toBeLessThanOrEqual(navMetrics.clientWidth + 1);
	expect(
		metrics.scrollWidth,
		'expected sidebar content not to overflow horizontally'
	).toBeLessThanOrEqual(metrics.clientWidth + 1);
	expect(metrics.scrollbarGutter).toBe('stable');

	expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
	expect(metrics.scrollTop).toBe(0);

	await navContent.hover();
	await page.mouse.wheel(0, 600);

	await expect.poll(async () => navContent.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
});
