import { expect, test } from '@playwright/test';

test('visual benchmark scene matches the snapshot', async ({ page }) => {
	await page.goto('/view/bench/visual', { waitUntil: 'networkidle' });

	const root = page.locator('[data-benchmark-root]');
	await expect(root).toHaveScreenshot('visual-benchmark.png', {
		animations: 'disabled',
		caret: 'hide',
		scale: 'css'
	});
});
