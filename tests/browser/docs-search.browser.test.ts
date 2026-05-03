import { describe, expect, it } from 'vitest';
import { getSearchSections } from '../../apps/docs/src/lib/search';

describe('docs search manifest', () => {
	it('includes docs routes and component entries without relying on generated full spec data', () => {
		const sections = getSearchSections();
		const docs = sections.find((section) => section.heading === 'Docs')?.items ?? [];
		const components = sections.find((section) => section.heading === 'Components')?.items ?? [];

		expect(docs.map((item) => item.href)).toEqual(['/', '/getting-started']);
		expect(components).toContainEqual(
			expect.objectContaining({
				label: 'Button',
				href: '/components/button',
				keywords: expect.arrayContaining(['component', 'button'])
			})
		);
	});
});
