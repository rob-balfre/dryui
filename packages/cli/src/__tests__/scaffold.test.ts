import { describe, expect, test } from 'bun:test';
import { getAdd } from '../commands/add.js';
import { createTabsMockSpec } from './helpers.js';

const mockSpec = createTabsMockSpec();

describe('getAdd', () => {
	test('prints a starter snippet with theme imports when requested', () => {
		const { output, error, exitCode } = getAdd('Tabs', mockSpec, 'text', { withTheme: true });
		expect(exitCode).toBe(0);
		expect(error).toBeNull();
		expect(output).toContain("import '@dryui/ui/themes/default.css';");
		expect(output).toContain("import { Tabs } from '@dryui/ui';");
		expect(output).toContain('<Tabs.Root');
	});

	test('supports subpath imports', () => {
		const { output } = getAdd('Tabs', mockSpec, 'text', { subpath: true });
		expect(output).toContain("import { Tabs } from '@dryui/ui/tabs';");
	});

	test('returns error for unknown component', () => {
		const { error, exitCode } = getAdd('Nonexistent', mockSpec, 'text');
		expect(exitCode).toBe(1);
		expect(error).toContain('Unknown component: "Nonexistent"');
	});
});
