import { afterEach, describe, expect, it } from 'vitest';
import auroraThemeCss from '../../packages/ui/src/themes/aurora.css?raw';
import defaultThemeCss from '../../packages/ui/src/themes/default.css?raw';
import darkThemeCss from '../../packages/ui/src/themes/dark.css?raw';
import midnightThemeCss from '../../packages/ui/src/themes/midnight.css?raw';
import terminalThemeCss from '../../packages/ui/src/themes/terminal.css?raw';

const semanticPairs = [
	{ name: 'brand', fill: '--dry-color-fill-brand', on: '--dry-color-on-brand', minimum: 4.5 },
	{ name: 'error', fill: '--dry-color-fill-error', on: '--dry-color-on-error', minimum: 4.5 },
	{
		name: 'error hover',
		fill: '--dry-color-fill-error-hover',
		on: '--dry-color-on-error',
		minimum: 4.5
	},
	{ name: 'warning', fill: '--dry-color-fill-warning', on: '--dry-color-on-warning', minimum: 4.5 },
	{ name: 'success', fill: '--dry-color-fill-success', on: '--dry-color-on-success', minimum: 4.5 },
	{ name: 'info', fill: '--dry-color-fill-info', on: '--dry-color-on-info', minimum: 4.5 },
	{ name: 'accent', fill: '--dry-color-fill-accent', on: '--dry-color-on-accent', minimum: 4.5 },
	{ name: 'purple', fill: '--dry-color-fill-purple', on: '--dry-color-on-purple', minimum: 4.5 },
	{ name: 'orange', fill: '--dry-color-fill-orange', on: '--dry-color-on-orange', minimum: 4.5 }
] as const;

const themeModes = ['light', 'dark', 'aurora', 'aurora-dark', 'midnight', 'terminal'] as const;

afterEach(() => {
	for (const node of document.querySelectorAll('[data-theme-token-test]')) {
		node.remove();
	}
	document.documentElement.className = '';
	document.documentElement.removeAttribute('data-theme');
	document.body.replaceChildren();
});

function installThemeCss() {
	const style = document.createElement('style');
	style.dataset.themeTokenTest = 'true';
	style.textContent = [
		defaultThemeCss,
		darkThemeCss,
		auroraThemeCss,
		midnightThemeCss,
		terminalThemeCss
	].join('\n');
	document.head.append(style);
}

function tokenContrast(fill: string, on: string): number {
	const element = document.createElement('div');
	element.dataset.themeTokenTest = 'true';
	element.style.backgroundColor = `var(${fill})`;
	element.style.color = `var(${on})`;
	document.body.append(element);

	const style = getComputedStyle(element);
	return contrastRatio(parseRgb(style.backgroundColor), parseRgb(style.color));
}

function parseRgb(value: string): [number, number, number] {
	const rgbMatch = value.match(/rgba?\(\s*([\d.]+)\s*(?:,|\s)\s*([\d.]+)\s*(?:,|\s)\s*([\d.]+)/);
	if (rgbMatch) {
		return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
	}

	const srgbMatch = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
	if (srgbMatch) {
		return [
			Math.round(Number(srgbMatch[1]) * 255),
			Math.round(Number(srgbMatch[2]) * 255),
			Math.round(Number(srgbMatch[3]) * 255)
		];
	}

	throw new Error(`Expected computed rgb() or color(srgb) color, received ${value}`);
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
	const [r, g, b] = [red, green, blue].map((channel) => {
		const value = channel / 255;
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	}) as [number, number, number];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(left: [number, number, number], right: [number, number, number]): number {
	const light = Math.max(relativeLuminance(left), relativeLuminance(right));
	const dark = Math.min(relativeLuminance(left), relativeLuminance(right));
	return (light + 0.05) / (dark + 0.05);
}

function declarationValues(token: string): string[] {
	const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pattern = new RegExp(`(?:^|[;{\\n]\\s*)${escapedToken}:\\s*([^;]+);`, 'g');
	return [...darkThemeCss.matchAll(pattern)].map((match) => match[1]!.replace(/\s+/g, ' ').trim());
}

describe('theme token contrast', () => {
	it('keeps semantic fill/on token pairs legible in first-class themes', () => {
		installThemeCss();

		for (const theme of themeModes) {
			document.documentElement.dataset.theme = theme;

			for (const pair of semanticPairs) {
				expect(tokenContrast(pair.fill, pair.on), `${theme} ${pair.name}`).toBeGreaterThanOrEqual(
					pair.minimum
				);
			}
		}
	});

	it('keeps auto dark token declarations aligned with explicit dark tokens', () => {
		expect(darkThemeCss).toContain(".theme-auto:not([data-theme='light'])");
		expect(darkThemeCss).toContain('@media (prefers-color-scheme: dark)');

		for (const token of [
			'--dry-color-fill-brand',
			'--dry-color-on-brand',
			'--dry-color-fill-purple',
			'--dry-color-on-purple',
			'--dry-color-fill-orange',
			'--dry-color-on-orange',
			'--dry-color-bg-base',
			'--dry-beam-default-blend',
			'color-scheme'
		]) {
			const values = declarationValues(token);
			expect(values.length, token).toBeGreaterThanOrEqual(2);
			expect(values.length % 2, token).toBe(0);

			for (let i = 0; i < values.length; i += 2) {
				expect(values[i + 1], `${token} declaration pair ${i / 2}`).toBe(values[i]);
			}
		}
	});
});
