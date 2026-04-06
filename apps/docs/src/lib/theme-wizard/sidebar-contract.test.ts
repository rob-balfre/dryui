import { describe, expect, test } from 'bun:test';
import { DEFAULT_DOCS_THEME_TOKENS } from './docs-theme.js';
import { generateTheme, PRESETS } from '@dryui/theme-wizard';
import { computeSidebarContract, serializeCustomProperties } from './sidebar-contract.js';

const theme = generateTheme(PRESETS[0]!.brandInput);

describe('computeSidebarContract', () => {
	test('candidate light passes the contract', () => {
		const contract = computeSidebarContract(theme, 'light', 'candidate');

		expect(contract.checks.textOnActive).toBeGreaterThanOrEqual(4.5);
		expect(Math.abs(contract.checks.textOnActiveApca)).toBeGreaterThanOrEqual(60);
		expect(contract.checks.activeVsSurface).toBeGreaterThanOrEqual(3);
		expect(contract.activeIndicatorWidth).toBeGreaterThanOrEqual(2);
		expect(contract.checks.cueTypes).toContain('indicator');
		expect(contract.passesContract).toBe(true);
	});

	test('candidate dark passes the contract', () => {
		const contract = computeSidebarContract(theme, 'dark', 'candidate');

		expect(contract.checks.textOnActive).toBeGreaterThanOrEqual(4.5);
		expect(Math.abs(contract.checks.textOnActiveApca)).toBeGreaterThanOrEqual(60);
		expect(contract.checks.activeVsSurface).toBeGreaterThanOrEqual(3);
		expect(contract.activeIndicatorWidth).toBeGreaterThanOrEqual(2);
		expect(contract.passesContract).toBe(true);
	});

	test('current dark fails the contract', () => {
		const contract = computeSidebarContract(theme, 'dark', 'current');

		expect(contract.checks.activeVsSurface).toBeLessThan(3);
		expect(contract.activeIndicatorWidth).toBe(0);
		expect(contract.checks.hasNonColorCue).toBe(false);
		expect(contract.passesContract).toBe(false);
	});

	test('docs preview candidate dark passes the contract', () => {
		const contract = computeSidebarContract(DEFAULT_DOCS_THEME_TOKENS, 'dark', 'candidate');

		expect(contract.checks.textOnActive).toBeGreaterThanOrEqual(4.5);
		expect(Math.abs(contract.checks.textOnActiveApca)).toBeGreaterThanOrEqual(60);
		expect(contract.checks.activeVsSurface).toBeGreaterThanOrEqual(3);
		expect(contract.checks.cueTypes).toContain('indicator');
		expect(contract.passesContract).toBe(true);
	});

	test('preview variant removes the sidebar divider', () => {
		const contract = computeSidebarContract(theme, 'dark', 'candidate', 'preview');

		expect(contract.customProperties['--dry-sidebar-border']).toBe('transparent');
	});

	test('production variant keeps the semantic divider token', () => {
		const contract = computeSidebarContract(theme, 'dark', 'candidate', 'production');

		expect(contract.customProperties['--dry-sidebar-border']).toBe(
			theme.dark['--dry-color-stroke-weak']
		);
	});
});

describe('serializeCustomProperties', () => {
	test('builds a stable inline style string', () => {
		const style = serializeCustomProperties({
			'--dry-sidebar-bg': 'black',
			'--dry-sidebar-active-color': 'white'
		});

		expect(style).toBe('--dry-sidebar-bg: black; --dry-sidebar-active-color: white');
	});
});
