import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const webServer = process.env.PLAYWRIGHT_BASE_URL
	? undefined
	: {
			command: 'bunx --bun vite dev --host 127.0.0.1 --port 4173',
			cwd: './apps/docs',
			url: baseURL,
			reuseExistingServer: true,
			timeout: 120_000
		};

export default defineConfig({
	testDir: './tests/playwright',
	testMatch: /.*visual\.spec\.ts$/,
	fullyParallel: false,
	forbidOnly: true,
	retries: 0,
	workers: 1,
	timeout: 120_000,
	snapshotDir: './tests/playwright/snapshots',
	outputDir: './tests/playwright/test-results',
	use: {
		baseURL,
		browserName: 'chromium',
		headless: true,
		viewport: { width: 1440, height: 1200 },
		deviceScaleFactor: 1,
		colorScheme: 'light',
		reducedMotion: 'reduce',
		locale: 'en-US',
		timezoneId: 'UTC',
		launchOptions: {
			args: ['--font-render-hinting=none']
		}
	},
	expect: {
		timeout: 30_000,
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
			threshold: 0.2,
			maxDiffPixels: 0
		}
	},
	webServer
});
