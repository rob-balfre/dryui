import { afterEach, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mountFeedbackInLayout } from '../commands/launch-utils.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

const SERVER_URL = 'http://127.0.0.1:4748';

describe('mountFeedbackInLayout', () => {
	test('injects the import into an existing script block and appends the component', () => {
		const root = createTempTree({
			'src/routes/+layout.svelte': [
				'<script lang="ts">',
				"  import Header from '$lib/header.svelte';",
				'</script>',
				'',
				'<Header />',
				'<slot />'
			].join('\n')
		});
		const layoutPath = resolve(root, 'src/routes/+layout.svelte');

		const ok = mountFeedbackInLayout({ layoutPath, serverUrl: SERVER_URL });
		expect(ok).toBe(true);

		const updated = readFileSync(layoutPath, 'utf-8');
		expect(updated).toContain("import { Feedback } from '@dryui/feedback';");
		expect(updated).toContain(`<Feedback serverUrl="${SERVER_URL}" />`);
		expect(updated).toContain("import Header from '$lib/header.svelte';");
	});

	test('creates a script block when the layout has none', () => {
		const root = createTempTree({
			'src/routes/+layout.svelte': '<slot />\n'
		});
		const layoutPath = resolve(root, 'src/routes/+layout.svelte');

		mountFeedbackInLayout({ layoutPath, serverUrl: SERVER_URL });

		const updated = readFileSync(layoutPath, 'utf-8');
		expect(updated).toStartWith('<script lang="ts">');
		expect(updated).toContain("import { Feedback } from '@dryui/feedback';");
		expect(updated).toContain(`<Feedback serverUrl="${SERVER_URL}" />`);
	});

	test('is idempotent when the import already exists', () => {
		const original = [
			'<script lang="ts">',
			"  import { Feedback } from '@dryui/feedback';",
			'</script>',
			'<Feedback serverUrl="http://127.0.0.1:4748" />',
			'<slot />'
		].join('\n');
		const root = createTempTree({ 'src/routes/+layout.svelte': original });
		const layoutPath = resolve(root, 'src/routes/+layout.svelte');

		const ok = mountFeedbackInLayout({ layoutPath, serverUrl: SERVER_URL });
		expect(ok).toBe(true);
		expect(readFileSync(layoutPath, 'utf-8')).toBe(original);
	});

	test('returns false when the layout file does not exist', () => {
		const root = createTempTree({});
		const missing = resolve(root, 'src/routes/+layout.svelte');

		expect(mountFeedbackInLayout({ layoutPath: missing, serverUrl: SERVER_URL })).toBe(false);
	});
});
