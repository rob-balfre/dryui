import { describe, expect, test } from 'bun:test';

interface FeedbackPackageJson {
	exports: Record<string, unknown>;
	files: string[];
}

async function readFeedbackPackageJson(): Promise<FeedbackPackageJson> {
	const raw: unknown = JSON.parse(
		await Bun.file(new URL('../../packages/feedback/package.json', import.meta.url)).text()
	);

	if (
		typeof raw !== 'object' ||
		raw === null ||
		!('exports' in raw) ||
		!('files' in raw) ||
		!Array.isArray(raw.files)
	) {
		throw new Error('feedback package.json is missing expected fields');
	}

	return raw as FeedbackPackageJson;
}

const feedbackPackageJson = await readFeedbackPackageJson();
const feedbackComponentPath = new URL(
	'../../packages/feedback/src/feedback.svelte',
	import.meta.url
).pathname;

describe('@dryui/feedback package contract', () => {
	test('publishes only the top-level package entrypoint', () => {
		expect(Object.keys(feedbackPackageJson.exports)).toEqual(['.']);
		expect(feedbackPackageJson.files).toEqual(['dist', 'src', 'skills']);
	});

	test('exposes a development conditional pointing at src for live HMR', () => {
		const dot = (feedbackPackageJson.exports as Record<string, unknown>)['.'];
		expect(dot).toMatchObject({
			development: {
				types: './src/index.ts',
				svelte: './src/index.ts',
				default: './src/index.ts'
			},
			svelte: './dist/index.js',
			default: './dist/index.js'
		});
	});

	test('source entrypoint exposes the Feedback component export', async () => {
		const mod = await import('../../packages/feedback/src/index.ts');

		expect(Object.keys(mod)).toContain('Feedback');
		expect(mod.Feedback).toBe(feedbackComponentPath);
	});
});
