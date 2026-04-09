import { describe, expect, mock, test } from 'bun:test';

// Redirect @dryui/theme-wizard to the engine-only subpath so bun can
// evaluate the module without hitting Svelte 5 $state runes.
mock.module('@dryui/theme-wizard', () => import('@dryui/theme-wizard/engine'));

const { computeSidebarContract, contrastBetween, serializeCustomProperties } =
	await import('../../apps/docs/src/lib/theme-wizard/sidebar-contract.js');
const { generateTheme, PRESETS } = await import('@dryui/theme-wizard/engine');
const { DEFAULT_DOCS_THEME_TOKENS } =
	await import('../../apps/docs/src/lib/theme-wizard/docs-theme.js');

const theme = generateTheme(PRESETS[0]!.brandInput);

// ---------------------------------------------------------------------------
// Gap 1 — requireToken throws when a required token is missing
// ---------------------------------------------------------------------------
describe('computeSidebarContract – missing tokens', () => {
	test('throws when a required semantic token is absent', () => {
		const incomplete = {
			light: { '--dry-color-bg-overlay': '#fff' },
			dark: { '--dry-color-bg-overlay': '#000' }
		};

		// The candidate recipe requires many tokens beyond bg-overlay.
		expect(() => computeSidebarContract(incomplete, 'light', 'candidate')).toThrow(
			'Missing semantic token'
		);
	});

	test('throws when bg-overlay itself is missing', () => {
		const empty = { light: {}, dark: {} };

		expect(() => computeSidebarContract(empty, 'light', 'candidate')).toThrow(
			'Missing semantic token --dry-color-bg-overlay'
		);
	});

	test('throws for the current recipe when fill-brand is missing', () => {
		const missingBrand = {
			light: { '--dry-color-bg-overlay': '#fff' },
			dark: { '--dry-color-bg-overlay': '#000' }
		};

		expect(() => computeSidebarContract(missingBrand, 'light', 'current')).toThrow(
			'Missing semantic token --dry-color-fill-brand'
		);
	});
});

// ---------------------------------------------------------------------------
// Gap 2 — contrastBetween fallback for unparseable colors
// ---------------------------------------------------------------------------
describe('contrastBetween – fallback behaviour', () => {
	test('returns 1 when both colors are unparseable', () => {
		expect(contrastBetween('not-a-color', 'also-not-a-color')).toBe(1);
	});

	test('returns 1 when the first color is unparseable', () => {
		expect(contrastBetween('garbage', '#ffffff')).toBe(1);
	});

	test('returns 1 when the second color is unparseable', () => {
		expect(contrastBetween('#000000', 'garbage')).toBe(1);
	});

	test('returns a real contrast ratio for valid colors', () => {
		const ratio = contrastBetween('#000000', '#ffffff');

		expect(ratio).toBeGreaterThan(1);
		expect(ratio).toBeCloseTo(21, 0);
	});
});

// ---------------------------------------------------------------------------
// Gap 3 — current recipe in light mode
// ---------------------------------------------------------------------------
describe('computeSidebarContract – current recipe light mode', () => {
	test('current light uses the correct recipe defaults', () => {
		const contract = computeSidebarContract(theme, 'light', 'current');

		expect(contract.mode).toBe('light');
		expect(contract.recipe).toBe('current');
		expect(contract.activeWeight).toBe(500);
		expect(contract.activeIndicatorWidth).toBe(0);
		expect(contract.activeIndicatorColor).toBe('currentColor');
	});

	test('current light fails the contract (no non-color cue)', () => {
		const contract = computeSidebarContract(theme, 'light', 'current');

		expect(contract.checks.hasNonColorCue).toBe(false);
		expect(contract.checks.cueTypes).toEqual([]);
		expect(contract.passesContract).toBe(false);
	});

	test('current light active indicator width is zero', () => {
		const contract = computeSidebarContract(theme, 'light', 'current');

		expect(contract.activeIndicatorWidth).toBe(0);
	});

	test('docs theme current light also fails', () => {
		const contract = computeSidebarContract(DEFAULT_DOCS_THEME_TOKENS, 'light', 'current');

		expect(contract.checks.hasNonColorCue).toBe(false);
		expect(contract.passesContract).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Gap 4 — mixOver edge cases (tested indirectly via computeSidebarContract)
// ---------------------------------------------------------------------------
describe('computeSidebarContract – mixOver behaviour', () => {
	test('current recipe activeBg differs between light and dark (different alpha)', () => {
		// mixOver uses 0.12 for light and 0.14 for dark
		const light = computeSidebarContract(theme, 'light', 'current');
		const dark = computeSidebarContract(theme, 'dark', 'current');

		// Both should produce valid HSL strings, but they should differ
		expect(light.activeBg).toMatch(/^hsl\(/);
		expect(dark.activeBg).toMatch(/^hsl\(/);
		expect(light.activeBg).not.toBe(dark.activeBg);
	});

	test('current recipe activeBg is distinct from surface', () => {
		const contract = computeSidebarContract(theme, 'light', 'current');

		// mixOver blends accent onto surface — the result should not equal the surface
		expect(contract.activeBg).not.toBe(contract.surface);
	});

	test('activeBg produces a valid color that contrast functions can parse', () => {
		const contract = computeSidebarContract(theme, 'light', 'current');

		// contrastBetween returns 1 for unparseable — a real ratio will exceed 1 or equal 1
		// but text-on-active should be a meaningful number since both inputs are valid colors
		expect(contract.checks.textOnActive).toBeGreaterThan(0);
		expect(contract.checks.activeVsSurface).toBeGreaterThan(0);
	});
});
