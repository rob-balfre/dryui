import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
	testDir: './playwright',
	testMatch: /visual\.spec\.ts/,
	fullyParallel: false,
	forbidOnly: true,
	retries: 0,
	workers: 1,
	timeout: 30_000,
	snapshotDir: './playwright/snapshots',
	outputDir: './playwright/test-results',
	use: {
		baseURL,
		viewport: { width: 1440, height: 1600 },
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
		toHaveScreenshot: {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
			threshold: 0.2,
			maxDiffPixels: 0
		}
	}
});
