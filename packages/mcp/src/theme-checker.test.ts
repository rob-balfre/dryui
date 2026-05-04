import { describe, test, expect } from 'bun:test';
import { diagnoseTheme } from './theme-checker.js';
import { THEME_TOKEN_NAME_SET } from './theme-tokens.js';

const mockSpec = {
	components: {
		Tabs: {
			cssVars: {
				'--dry-tabs-bg': 'var(--dry-color-bg-raised)',
				'--dry-tabs-border': 'var(--dry-color-stroke-weak)',
				'--dry-tabs-radius': 'var(--dry-radius-lg)',
				'--dry-tabs-shadow': 'var(--dry-shadow-raised)',
				'--dry-tabs-padding': 'var(--dry-space-6)'
			}
		},
		Button: {
			cssVars: {
				'--dry-btn-bg': 'var(--dry-color-fill-brand)',
				'--dry-btn-color': 'var(--dry-color-on-brand)',
				'--dry-btn-border': 'transparent',
				'--dry-btn-radius': 'var(--dry-radius-md)'
			}
		},
		Input: {
			cssVars: {
				'--dry-input-bg': 'var(--dry-color-fill)',
				'--dry-input-border': 'var(--dry-color-stroke-strong)',
				'--dry-input-color': 'var(--dry-color-text-strong)'
			}
		}
	}
} satisfies { components: Record<string, { cssVars: Record<string, string> }> };

function allTokens(overrides: Record<string, string> = {}): string {
	const defaults: Record<string, string> = {
		// Neutral (8)
		'--dry-color-text-strong': 'hsla(230, 100%, 15%, 0.90)',
		'--dry-color-text-weak': 'hsla(230, 100%, 20%, 0.65)',
		'--dry-color-icon': 'hsla(230, 100%, 20%, 0.70)',
		'--dry-color-stroke-strong': 'hsla(230, 100%, 20%, 0.45)',
		'--dry-color-stroke-weak': 'hsla(230, 100%, 20%, 0.10)',
		'--dry-color-fill': 'hsla(230, 100%, 20%, 0.05)',
		'--dry-color-fill-hover': 'hsla(230, 100%, 20%, 0.08)',
		'--dry-color-fill-active': 'hsla(230, 100%, 20%, 0.12)',
		// Brand (9)
		'--dry-color-brand': 'hsl(230, 65%, 55%)',
		'--dry-color-text-brand': 'hsl(230, 65%, 40%)',
		'--dry-color-fill-brand': 'hsl(230, 65%, 55%)',
		'--dry-color-fill-brand-hover': 'hsl(230, 65%, 47%)',
		'--dry-color-fill-brand-active': 'hsl(230, 65%, 41%)',
		'--dry-color-fill-brand-weak': 'hsla(230, 65%, 55%, 0.10)',
		'--dry-color-stroke-brand': 'hsla(230, 65%, 55%, 0.5)',
		'--dry-color-on-brand': '#ffffff',
		'--dry-color-focus-ring': 'hsla(230, 65%, 55%, 0.4)',
		// Backgrounds (3)
		'--dry-color-bg-base': '#ffffff',
		'--dry-color-bg-raised': '#f8fafc',
		'--dry-color-bg-overlay': '#f1f5f9',
		// Status: error (6)
		'--dry-color-text-error': 'hsl(0, 70%, 35%)',
		'--dry-color-fill-error': 'hsl(0, 70%, 50%)',
		'--dry-color-fill-error-hover': 'hsl(0, 70%, 42%)',
		'--dry-color-fill-error-weak': 'hsla(0, 70%, 50%, 0.10)',
		'--dry-color-stroke-error': 'hsl(0, 50%, 70%)',
		'--dry-color-on-error': '#ffffff',
		// Status: warning (6)
		'--dry-color-text-warning': 'hsl(40, 80%, 30%)',
		'--dry-color-fill-warning': 'hsl(40, 80%, 50%)',
		'--dry-color-fill-warning-hover': 'hsl(40, 80%, 42%)',
		'--dry-color-fill-warning-weak': 'hsla(40, 80%, 50%, 0.10)',
		'--dry-color-stroke-warning': 'hsl(40, 60%, 65%)',
		'--dry-color-on-warning': 'hsl(40, 80%, 15%)',
		// Status: success (6)
		'--dry-color-text-success': 'hsl(145, 60%, 30%)',
		'--dry-color-fill-success': 'hsl(145, 60%, 45%)',
		'--dry-color-fill-success-hover': 'hsl(145, 60%, 37%)',
		'--dry-color-fill-success-weak': 'hsla(145, 60%, 45%, 0.10)',
		'--dry-color-stroke-success': 'hsl(145, 50%, 65%)',
		'--dry-color-on-success': '#ffffff',
		// Status: info (6)
		'--dry-color-text-info': 'hsl(210, 70%, 35%)',
		'--dry-color-fill-info': 'hsl(210, 70%, 50%)',
		'--dry-color-fill-info-hover': 'hsl(210, 70%, 42%)',
		'--dry-color-fill-info-weak': 'hsla(210, 70%, 50%, 0.10)',
		'--dry-color-stroke-info': 'hsl(210, 50%, 70%)',
		'--dry-color-on-info': '#ffffff',
		// Shadows (2)
		'--dry-shadow-raised':
			'0 1px 3px hsla(230, 20%, 20%, 0.08), 0 1px 2px hsla(230, 20%, 20%, 0.06)',
		'--dry-shadow-overlay':
			'0 8px 24px hsla(230, 20%, 20%, 0.12), 0 2px 8px hsla(230, 20%, 20%, 0.08)',
		// Backdrops (2)
		'--dry-color-overlay-backdrop': 'hsla(0, 0%, 0%, 0.4)',
		'--dry-color-overlay-backdrop-strong': 'hsla(0, 0%, 0%, 0.6)'
	};
	const merged = { ...defaults, ...overrides };
	return (
		':root {\n' +
		Object.entries(merged)
			.map(([k, v]) => `  ${k}: ${v};`)
			.join('\n') +
		'\n}'
	);
}

describe('Missing tokens', () => {
	test('theme.css with 10 of 48 tokens → errors listing 38 missing', () => {
		const css = `:root {
  --dry-color-text-strong: hsla(230, 100%, 15%, 0.90);
  --dry-color-text-weak: hsla(230, 100%, 20%, 0.65);
  --dry-color-icon: hsla(230, 100%, 20%, 0.70);
  --dry-color-stroke-strong: hsla(230, 100%, 20%, 0.45);
  --dry-color-stroke-weak: hsla(230, 100%, 20%, 0.10);
  --dry-color-fill: hsla(230, 100%, 20%, 0.05);
  --dry-color-fill-hover: hsla(230, 100%, 20%, 0.08);
  --dry-color-fill-active: hsla(230, 100%, 20%, 0.12);
  --dry-color-brand: hsl(230, 65%, 55%);
  --dry-color-text-brand: hsl(230, 65%, 40%);
}`;
		const result = diagnoseTheme(css, mockSpec, 'mytheme.theme.css');
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBe(38);
	});

	test('CSS with all 48 tokens → no missing-token errors', () => {
		const css = allTokens();
		const result = diagnoseTheme(css, mockSpec, 'mytheme.theme.css');
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBe(0);
	});

	test('CSS with only 2 tokens → skip missing check (targeted customization)', () => {
		const css = `:root {
  --dry-color-fill-brand: hsl(230, 65%, 55%);
  --dry-color-on-brand: #ffffff;
}`;
		const result = diagnoseTheme(css, mockSpec);
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBe(0);
	});

	test('CSS with exactly 3 tokens → skip missing check (below threshold)', () => {
		const css = `:root {
  --dry-color-fill-brand: hsl(230, 65%, 55%);
  --dry-color-on-brand: #ffffff;
  --dry-color-fill-error: hsl(0, 70%, 50%);
}`;
		const result = diagnoseTheme(css, mockSpec);
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBe(0);
	});

	test('theme.css with exactly 4 tokens → flag missing tokens (at threshold)', () => {
		const css = `:root {
  --dry-color-fill-brand: hsl(230, 65%, 55%);
  --dry-color-on-brand: #ffffff;
  --dry-color-fill-error: hsl(0, 70%, 50%);
  --dry-color-on-error: #ffffff;
}`;
		const result = diagnoseTheme(css, mockSpec, 'x.theme.css');
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBe(44);
	});
});

describe('Partial override (non-theme file)', () => {
	test('app.css with 5 token overrides → single partial-override info (not 44 errors)', () => {
		// Use brand tokens (fill-brand/on-brand is a pairing, so add both); status
		// tokens are single so they won't trigger missing-pairing warnings.
		const css = `:root {
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #1e293b;
  --dry-color-text-strong: #f8fafc;
  --dry-color-fill-brand: #3b82f6;
  --dry-color-on-brand: #ffffff;
}`;
		const result = diagnoseTheme(css, mockSpec, 'src/app.css');
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBe(0);
		const partial = result.issues.filter((i) => i.code === 'partial-override');
		expect(partial.length).toBe(1);
		expect(partial[0]!.severity).toBe('info');
		expect(partial[0]!.message).toContain('customize tokens');
	});

	test('file with /* @dryui-theme */ directive → treated as full theme', () => {
		const css = `/* @dryui-theme */
:root {
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #1e293b;
  --dry-color-text-strong: #f8fafc;
  --dry-color-fill-brand: #3b82f6;
  --dry-color-on-brand: #ffffff;
}`;
		const result = diagnoseTheme(css, mockSpec, 'src/app.css');
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBeGreaterThan(30);
		const partial = result.issues.filter((i) => i.code === 'partial-override');
		expect(partial.length).toBe(0);
	});

	test('*.theme.css filename → treated as full theme even without directive', () => {
		const css = `:root {
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #1e293b;
  --dry-color-text-strong: #f8fafc;
  --dry-color-fill-brand: #3b82f6;
  --dry-color-on-brand: #ffffff;
}`;
		const result = diagnoseTheme(css, mockSpec, 'src/custom.theme.css');
		const missing = result.issues.filter((i) => i.code === 'missing-token');
		expect(missing.length).toBeGreaterThan(30);
	});

	test('missing-token message includes ask recipe steering', () => {
		const css = `:root {
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #1e293b;
  --dry-color-text-strong: #f8fafc;
  --dry-color-fill-brand: #3b82f6;
  --dry-color-on-brand: #ffffff;
}`;
		const result = diagnoseTheme(css, mockSpec, 'src/my.theme.css');
		const missing = result.issues.find((i) => i.code === 'missing-token');
		expect(missing).toBeDefined();
		expect(missing!.message).toContain('customize tokens');
	});
});

describe('Value types', () => {
	test('--dry-color-fill-brand: 16px → error wrong-type', () => {
		const css = `:root { --dry-color-fill-brand: 16px; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-color-fill-brand')
		).toBe(true);
	});

	test('--dry-color-fill-brand: #2563eb → no error', () => {
		const css = `:root { --dry-color-fill-brand: #2563eb; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-color-fill-brand')
		).toBe(false);
	});

	test('--dry-color-fill-brand: rgb(37, 99, 235) → no error', () => {
		const css = `:root { --dry-color-fill-brand: rgb(37, 99, 235); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-color-fill-brand')
		).toBe(false);
	});

	test('--dry-color-fill-brand: color-mix(in srgb, blue 50%, white) → no error', () => {
		const css = `:root { --dry-color-fill-brand: color-mix(in srgb, blue 50%, white); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-color-fill-brand')
		).toBe(false);
	});

	test('--dry-space-4: red → error wrong-type', () => {
		const css = `:root { --dry-space-4: red; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-space-4')
		).toBe(true);
	});
});

describe('Transparent surface', () => {
	test('--dry-color-bg-raised: rgba(217,158,100,0.07) → warning transparent-surface', () => {
		const css = `:root { --dry-color-bg-raised: rgba(217,158,100,0.07); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.code === 'transparent-surface' &&
					i.severity === 'warning' &&
					i.variable === '--dry-color-bg-raised'
			)
		).toBe(true);
	});

	test('--dry-color-bg-raised: rgba(30,41,59,1) → no warning', () => {
		const css = `:root { --dry-color-bg-raised: rgba(30,41,59,1); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'transparent-surface')).toBe(false);
	});

	test('--dry-color-bg-raised: #1e293b → no warning', () => {
		const css = `:root { --dry-color-bg-raised: #1e293b; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'transparent-surface')).toBe(false);
	});

	test('--dry-color-bg-base: hsla(0, 0%, 0%, 0.1) → warning transparent-surface', () => {
		const css = `:root { --dry-color-bg-base: hsla(0, 0%, 0%, 0.1); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.code === 'transparent-surface' &&
					i.severity === 'warning' &&
					i.variable === '--dry-color-bg-base'
			)
		).toBe(true);
	});
});

describe('Low contrast', () => {
	test('--dry-color-text-strong: #333333 + --dry-color-bg-base: #222222 → warning low-contrast-text', () => {
		const css = `:root {
  --dry-color-text-strong: #333333;
  --dry-color-bg-base: #222222;
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'low-contrast-text' && i.severity === 'warning')
		).toBe(true);
	});

	test('--dry-color-text-strong: #f0e4d6 + --dry-color-bg-base: #16131a → no warning (sufficient difference)', () => {
		const css = `:root {
  --dry-color-text-strong: #f0e4d6;
  --dry-color-bg-base: #16131a;
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'low-contrast-text')).toBe(false);
	});
});

describe('No elevation', () => {
	test('same bg-base and bg-raised → warning no-elevation', () => {
		const css = `:root {
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #0f172a;
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'no-elevation' && i.severity === 'warning')).toBe(
			true
		);
	});

	test('different bg-base and bg-raised → no warning', () => {
		const css = `:root {
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #1e293b;
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'no-elevation')).toBe(false);
	});

	test('same bg-raised and bg-overlay → warning no-elevation', () => {
		const css = `:root {
  --dry-color-bg-raised: #1e293b;
  --dry-color-bg-overlay: #1e293b;
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) => i.code === 'no-elevation' && i.variable === '--dry-color-bg-overlay'
			)
		).toBe(true);
	});
});

describe('Missing pairing', () => {
	test('--dry-color-fill-brand without --dry-color-on-brand in 4+ token theme → warning missing-pairing', () => {
		const css = `:root {
  --dry-color-fill-brand: hsl(230, 65%, 55%);
  --dry-color-fill-error: hsl(0, 70%, 50%);
  --dry-color-fill-warning: hsl(40, 80%, 50%);
  --dry-color-fill-success: hsl(145, 60%, 45%);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.code === 'missing-pairing' &&
					i.severity === 'warning' &&
					i.variable === '--dry-color-on-brand'
			)
		).toBe(true);
	});

	test('both fill-brand and on-brand defined → no warning for brand pair', () => {
		const css = `:root {
  --dry-color-fill-brand: hsl(230, 65%, 55%);
  --dry-color-on-brand: #ffffff;
  --dry-color-fill-error: hsl(0, 70%, 50%);
  --dry-color-fill-success: hsl(145, 60%, 45%);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) => i.code === 'missing-pairing' && i.variable === '--dry-color-on-brand'
			)
		).toBe(false);
	});

	test('--dry-color-fill-error without --dry-color-on-error in 4+ token theme → warning missing-pairing', () => {
		const css = `:root {
  --dry-color-fill-brand: hsl(230, 65%, 55%);
  --dry-color-on-brand: #ffffff;
  --dry-color-fill-error: hsl(0, 70%, 50%);
  --dry-color-fill-warning: hsl(40, 80%, 50%);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.code === 'missing-pairing' &&
					i.severity === 'warning' &&
					i.variable === '--dry-color-on-error'
			)
		).toBe(true);
	});
});

describe('Var resolution', () => {
	test('resolves var(--my-bg) and flags transparent-surface', () => {
		const css = `:root {
  --my-bg: rgba(0,0,0,0.05);
  --dry-color-bg-base: var(--my-bg);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) => i.code === 'transparent-surface' && i.variable === '--dry-color-bg-base'
			)
		).toBe(true);
	});

	test('unresolvable var(--external-var) → info unresolvable reference', () => {
		const css = `:root {
  --dry-color-bg-base: var(--external-var);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.severity === 'info' && i.variable === '--dry-color-bg-base')
		).toBe(true);
	});
});

describe('Var with fallback', () => {
	test('var(--my-bg, #f8fafc) with no --my-bg → uses fallback, no issue', () => {
		const css = `:root {
  --dry-color-bg-base: var(--my-bg, #f8fafc);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'transparent-surface')).toBe(false);
	});

	test('var(--my-bg, rgba(0,0,0,0.05)) → resolves fallback and flags transparent-surface', () => {
		const css = `:root {
  --dry-color-bg-base: var(--my-bg, rgba(0,0,0,0.05));
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) => i.code === 'transparent-surface' && i.variable === '--dry-color-bg-base'
			)
		).toBe(true);
	});
});

describe('Component tokens', () => {
	test('--dry-tabs-bg: transparent → warning transparent-component-bg', () => {
		const css = `:root { --dry-tabs-bg: transparent; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.code === 'transparent-component-bg' &&
					i.severity === 'warning' &&
					i.variable === '--dry-tabs-bg'
			)
		).toBe(true);
	});

	test('--dry-tabs-foo: red → warning unknown-component-token', () => {
		const css = `:root { --dry-tabs-foo: red; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.code === 'unknown-component-token' &&
					i.severity === 'warning' &&
					i.variable === '--dry-tabs-foo'
			)
		).toBe(true);
	});

	test('--dry-tabs-bg: #1e293b → no warning', () => {
		const css = `:root { --dry-tabs-bg: #1e293b; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) =>
					i.variable === '--dry-tabs-bg' &&
					(i.code === 'transparent-component-bg' || i.code === 'unknown-component-token')
			)
		).toBe(false);
	});

	test('generated theme registry tokens are not treated as unknown component tokens', () => {
		expect(THEME_TOKEN_NAME_SET.has('--dry-ease-default')).toBe(true);
		const css = `:root { --dry-ease-default: cubic-bezier(0.2, 0, 0, 1); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some(
				(i) => i.code === 'unknown-component-token' && i.variable === '--dry-ease-default'
			)
		).toBe(false);
	});
});

describe('CSS comments', () => {
	test('commented-out declaration not counted, only active one seen', () => {
		const css = `:root {
  /* --dry-color-fill-brand: red; */
  --dry-color-fill-brand: hsl(230, 65%, 55%);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-color-fill-brand')
		).toBe(false);
	});

	test('commented-out declarations not counted toward token totals', () => {
		const css = `:root {
  /* --dry-color-fill-brand: hsl(230, 65%, 55%); */
  /* --dry-color-on-brand: #ffffff; */
  --dry-color-fill-error: hsl(0, 70%, 50%);
}`;
		const result = diagnoseTheme(css, mockSpec);
		// Only 1 semantic token found, below threshold — no missing-token errors
		expect(result.variables.found).toBeLessThan(4);
		expect(result.issues.filter((i) => i.code === 'missing-token').length).toBe(0);
	});
});

describe('Valid themes', () => {
	test('complete light theme → no issues', () => {
		const css = allTokens();
		const result = diagnoseTheme(css, mockSpec, 'light.theme.css');
		expect(result.issues.length).toBe(0);
	});

	test('complete dark theme → no issues', () => {
		const css = allTokens({
			// Neutral
			'--dry-color-text-strong': 'hsla(230, 15%, 95%, 0.92)',
			'--dry-color-text-weak': 'hsla(230, 15%, 95%, 0.60)',
			'--dry-color-icon': 'hsla(230, 15%, 95%, 0.65)',
			'--dry-color-stroke-strong': 'hsla(230, 15%, 95%, 0.30)',
			'--dry-color-stroke-weak': 'hsla(230, 15%, 95%, 0.10)',
			'--dry-color-fill': 'hsla(230, 15%, 95%, 0.05)',
			'--dry-color-fill-hover': 'hsla(230, 15%, 95%, 0.08)',
			'--dry-color-fill-active': 'hsla(230, 15%, 95%, 0.12)',
			// Brand
			'--dry-color-brand': 'hsl(230, 70%, 65%)',
			'--dry-color-text-brand': 'hsl(230, 70%, 75%)',
			'--dry-color-fill-brand': 'hsl(230, 70%, 60%)',
			'--dry-color-fill-brand-hover': 'hsl(230, 70%, 68%)',
			'--dry-color-fill-brand-active': 'hsl(230, 70%, 72%)',
			'--dry-color-fill-brand-weak': 'hsla(230, 70%, 60%, 0.20)',
			'--dry-color-stroke-brand': 'hsla(230, 70%, 60%, 0.5)',
			'--dry-color-on-brand': '#ffffff',
			'--dry-color-focus-ring': 'hsla(230, 70%, 60%, 0.5)',
			// Backgrounds
			'--dry-color-bg-base': '#0f172a',
			'--dry-color-bg-raised': '#1e293b',
			'--dry-color-bg-overlay': '#334155',
			// Status
			'--dry-color-text-error': 'hsl(0, 80%, 70%)',
			'--dry-color-fill-error': 'hsl(0, 70%, 55%)',
			'--dry-color-fill-error-hover': 'hsl(0, 70%, 63%)',
			'--dry-color-fill-error-weak': 'hsla(0, 70%, 55%, 0.20)',
			'--dry-color-stroke-error': 'hsl(0, 50%, 45%)',
			'--dry-color-on-error': '#ffffff',
			'--dry-color-text-warning': 'hsl(40, 90%, 65%)',
			'--dry-color-fill-warning': 'hsl(40, 80%, 55%)',
			'--dry-color-fill-warning-hover': 'hsl(40, 80%, 63%)',
			'--dry-color-fill-warning-weak': 'hsla(40, 80%, 55%, 0.20)',
			'--dry-color-stroke-warning': 'hsl(40, 60%, 40%)',
			'--dry-color-on-warning': '#ffffff',
			'--dry-color-text-success': 'hsl(145, 60%, 65%)',
			'--dry-color-fill-success': 'hsl(145, 60%, 50%)',
			'--dry-color-fill-success-hover': 'hsl(145, 60%, 58%)',
			'--dry-color-fill-success-weak': 'hsla(145, 60%, 50%, 0.20)',
			'--dry-color-stroke-success': 'hsl(145, 50%, 35%)',
			'--dry-color-on-success': '#ffffff',
			'--dry-color-text-info': 'hsl(210, 70%, 70%)',
			'--dry-color-fill-info': 'hsl(210, 70%, 55%)',
			'--dry-color-fill-info-hover': 'hsl(210, 70%, 63%)',
			'--dry-color-fill-info-weak': 'hsla(210, 70%, 55%, 0.20)',
			'--dry-color-stroke-info': 'hsl(210, 50%, 40%)',
			'--dry-color-on-info': '#ffffff',
			// Shadows
			'--dry-shadow-raised': '0 1px 3px hsla(0, 0%, 0%, 0.40), 0 1px 2px hsla(0, 0%, 0%, 0.30)',
			'--dry-shadow-overlay': '0 8px 24px hsla(0, 0%, 0%, 0.50), 0 2px 8px hsla(0, 0%, 0%, 0.40)',
			// Backdrops
			'--dry-color-overlay-backdrop': 'hsla(0, 0%, 0%, 0.6)',
			'--dry-color-overlay-backdrop-strong': 'hsla(0, 0%, 0%, 0.8)'
		});
		const result = diagnoseTheme(css, mockSpec, 'dark.theme.css');
		expect(result.issues.length).toBe(0);
	});
});

describe('Malformed CSS', () => {
	test('--dry-color-fill-brand: #256 (3-char hex) → classified as color, no error', () => {
		const css = `:root { --dry-color-fill-brand: #256; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(
			result.issues.some((i) => i.code === 'wrong-type' && i.variable === '--dry-color-fill-brand')
		).toBe(false);
	});

	test('--dry-color-fill-brand: (missing value) → no crash', () => {
		const css = `:root { --dry-color-fill-brand: ; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result).toBeDefined();
	});

	test('empty string input → clean result with 0 variables, no issues', () => {
		const result = diagnoseTheme('', mockSpec);
		expect(result.variables.found).toBe(0);
		expect(result.issues.length).toBe(0);
	});
});

describe('Unparseable contrast', () => {
	test('color-mix text value → skips contrast check gracefully', () => {
		const css = `:root {
  --dry-color-text-strong: color-mix(in srgb, white 90%, black);
  --dry-color-bg-base: #16131a;
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'low-contrast-text')).toBe(false);
	});
});

describe('Dark scheme detection', () => {
	test('dark background with no --dry-* overrides → warning', () => {
		const css = `:root {
  color-scheme: dark;
  --bg: #16131a;
  --text: #f0e4d6;
}
body { background: var(--bg); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'dark-scheme-no-overrides')).toBe(true);
	});

	test('dark background via color-scheme only → warning', () => {
		const css = `:root { color-scheme: dark; }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'dark-scheme-no-overrides')).toBe(true);
	});

	test('light project with no --dry-* overrides → no warning', () => {
		const css = `:root {
  --bg: #ffffff;
  --text: #333333;
}
body { background: var(--bg); }`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'dark-scheme-no-overrides')).toBe(false);
	});

	test('dark project WITH --dry-* overrides → no dark-scheme warning (other checks apply)', () => {
		const css = `:root {
  color-scheme: dark;
  --bg: #16131a;
  --dry-color-bg-base: #0f172a;
  --dry-color-bg-raised: #1e293b;
  --dry-color-bg-overlay: #334155;
  --dry-color-text-strong: hsla(230, 15%, 95%, 0.92);
}`;
		const result = diagnoseTheme(css, mockSpec);
		expect(result.issues.some((i) => i.code === 'dark-scheme-no-overrides')).toBe(false);
	});
});
