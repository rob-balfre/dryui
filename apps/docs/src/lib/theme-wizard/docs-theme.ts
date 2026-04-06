import type { ThemeTokens } from '@dryui/theme-wizard';

export const DEFAULT_DOCS_THEME_TOKENS: ThemeTokens = {
	light: {
		'--dry-color-bg-base': '#ffffff',
		'--dry-color-bg-overlay': '#ffffff',
		'--dry-color-bg-raised': '#ffffff',
		'--dry-color-text-strong': 'hsla(230, 100%, 15%, 0.90)',
		'--dry-color-text-weak': 'hsla(230, 100%, 20%, 0.65)',
		'--dry-color-text-brand': 'hsl(230, 65%, 40%)',
		'--dry-color-fill-brand': 'hsl(230, 65%, 55%)',
		'--dry-color-fill-brand-hover': 'hsl(230, 65%, 47%)',
		'--dry-color-fill-brand-active': 'hsl(230, 65%, 41%)',
		'--dry-color-stroke-weak': 'hsla(230, 100%, 20%, 0.10)',
		'--dry-color-on-brand': '#ffffff',
		'--dry-color-focus-ring': 'hsla(230, 65%, 55%, 0.4)'
	},
	dark: {
		'--dry-color-bg-base': 'hsl(230, 30%, 10%)',
		'--dry-color-bg-overlay': 'hsl(230, 20%, 20%)',
		'--dry-color-bg-raised': 'hsl(230, 25%, 15%)',
		'--dry-color-text-strong': 'hsla(0, 0%, 100%, 1)',
		'--dry-color-text-weak': 'hsla(0, 0%, 100%, 0.78)',
		'--dry-color-text-brand': 'hsl(230, 39%, 78%)',
		'--dry-color-fill-brand': 'hsl(230, 39%, 68%)',
		'--dry-color-fill-brand-hover': 'hsl(230, 39%, 75%)',
		'--dry-color-fill-brand-active': 'hsl(230, 39%, 62%)',
		'--dry-color-stroke-weak': 'hsla(0, 0%, 100%, 0.12)',
		'--dry-color-on-brand': 'hsl(230, 30%, 10%)',
		'--dry-color-focus-ring': 'hsla(230, 39%, 80%, 0.4)'
	}
};
