import { describe, expect, it } from 'bun:test';

const themeCss = await Bun.file(
	new URL('../../../packages/ui/src/themes/default.css', import.meta.url)
).text();

describe('motion theme tokens', () => {
	it('defines the shared motion scale', () => {
		expect(themeCss).toContain('--dry-duration-instant');
		expect(themeCss).toContain('--dry-duration-xslow');
		expect(themeCss).toContain('--dry-ease-emphasized');
		expect(themeCss).toContain('--dry-ease-spring-soft');
		expect(themeCss).toContain('--dry-ease-spring-snappy');
		expect(themeCss).toContain('--dry-motion-distance-xs');
		expect(themeCss).toContain('--dry-motion-distance-lg');
		expect(themeCss).toContain('--dry-motion-opacity-enter');
		expect(themeCss).toContain('--dry-motion-blur-enter');
		expect(themeCss).toContain('--dry-motion-scale-enter');
	});

	it('defines --dry-duration-entrance token', () => {
		expect(themeCss).toContain('--dry-duration-entrance: 480ms');
	});

	it('zeroes motion through prefers-reduced-motion overrides', () => {
		expect(themeCss).toContain('@media (prefers-reduced-motion: reduce)');
		expect(themeCss).toContain('--dry-duration-fast: 0ms;');
		expect(themeCss).toContain('--dry-duration-xslow: 0ms;');
		expect(themeCss).toContain('--dry-motion-distance-sm: 0px;');
		expect(themeCss).toContain('--dry-motion-opacity-enter: 1;');
		expect(themeCss).toContain('--dry-motion-scale-enter: 1;');
	});

	it('zeroes --dry-duration-entrance under reduced-motion', () => {
		expect(themeCss).toContain('--dry-duration-entrance: 0ms;');
	});
});
