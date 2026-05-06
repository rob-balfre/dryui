import { describe, expect, it } from 'bun:test';
import {
	componentPageManifest,
	getComponentPagePrerenderEntries,
	routeableComponentPageEntries,
	toPreviewComponentPageData,
	toPublicComponentPageData
} from '../../apps/docs/src/lib/component-page-manifest';
import { entries } from '../../apps/docs/src/routes/components/[slug]/+page';
import { load } from '../../apps/docs/src/routes/components/[slug]/+page.server';
import { load as loadPreview } from '../../apps/docs/src/routes/view/components/[slug]/+page.server';
import { docsNavComponentNames } from '../../packages/mcp/src/component-catalog';

function callLoad(slug: string) {
	return Promise.resolve(load({ params: { slug } } as Parameters<typeof load>[0]));
}

function callPreviewLoad(slug: string) {
	return Promise.resolve(loadPreview({ params: { slug } } as Parameters<typeof loadPreview>[0]));
}

describe('docs component route contract', () => {
	it('keeps the manifest scoped to routeable docs nav components', () => {
		expect(Object.keys(componentPageManifest.components).sort()).toEqual(
			[...docsNavComponentNames].sort()
		);
		expect(componentPageManifest.components.AffixGroup).toBeUndefined();
		expect(Object.values(componentPageManifest.components).every((entry) => entry.slug)).toBe(true);
		expect(Object.values(componentPageManifest.components).every((entry) => entry.category)).toBe(
			true
		);
		expect(
			Object.values(componentPageManifest.components).every(
				(entry) => entry.sourcePackage === '@dryui/ui'
			)
		).toBe(true);
		expect(Object.values(componentPageManifest.components).every((entry) => entry.rootImport)).toBe(
			true
		);
		expect(
			Object.values(componentPageManifest.components).every((entry) => entry.subpathImport)
		).toBe(true);
		expect(componentPageManifest.layoutHints.join('\n')).toContain('src/layout.css');
		expect(componentPageManifest.layoutHints.join('\n')).toContain('data-layout');
		expect(componentPageManifest.layoutHints.join('\n')).toContain('grid-template-columns');
		expect('themeImports' in componentPageManifest).toBe(false);
	});

	it('centralizes routeable component page entries and prerender params', () => {
		expect(routeableComponentPageEntries.map((entry) => entry.name).sort()).toEqual(
			[...docsNavComponentNames].sort()
		);
		expect(getComponentPagePrerenderEntries()).toEqual(entries());
		expect(getComponentPagePrerenderEntries()).toContainEqual({ slug: 'button' });
		expect(getComponentPagePrerenderEntries()).not.toContainEqual({ slug: 'affix-group' });
	});

	it('returns name-based page data for ui components', async () => {
		const data = await callLoad('button');

		expect(data.name).toBe('Button');
		expect('componentName' in data).toBe(false);
		expect('kind' in data).toBe(false);
		expect('sourceUrl' in data).toBe(false);
		expect('related' in data).toBe(false);
		expect('slug' in data).toBe(false);
		expect('category' in data).toBe(false);
		expect('sourcePackage' in data).toBe(false);
		expect(data.rootImport).toBe("import { Button } from '@dryui/ui'");
		expect(data.subpathImport).toBe("import { Button } from '@dryui/ui/button'");
		expect(data.a11y.length).toBeGreaterThan(0);
		expect(data.dataAttributes).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'data-disabled',
					description: expect.any(String)
				})
			])
		);
	});

	it('returns structured styling hooks for stateful components', async () => {
		const data = await callLoad('dialog');

		expect(data.name).toBe('Dialog');
		expect(data.dataAttributes.find((attr) => attr.name === 'data-state')?.values).toEqual([
			'open',
			'closed'
		]);
	});

	it('returns ui metadata for motion surfaces', async () => {
		const data = await callLoad('reveal');

		expect(data.name).toBe('Reveal');
		expect(data.quickStartCode).toContain("import { Reveal } from '@dryui/ui'");
	});

	it('keeps public and preview projections separate from manifest-only fields', () => {
		const entry = componentPageManifest.components.Button;

		expect(toPublicComponentPageData(entry)).toEqual({
			name: entry.name,
			description: entry.description,
			compound: entry.compound,
			props: entry.props,
			parts: entry.parts,
			forwardedProps: entry.forwardedProps,
			groups: entry.groups,
			a11y: entry.a11y,
			cssVars: entry.cssVars,
			dataAttributes: entry.dataAttributes,
			rootImport: entry.rootImport,
			subpathImport: entry.subpathImport,
			quickStartCode: entry.quickStartCode
		});
		expect(toPreviewComponentPageData(entry)).toEqual({
			name: entry.name,
			description: entry.description,
			category: entry.category,
			sourcePackage: entry.sourcePackage
		});
	});

	it('returns preview-only facts from the preview route adapter', async () => {
		const data = await callPreviewLoad('button');

		expect(data).toEqual({
			name: 'Button',
			description: expect.any(String),
			category: 'action',
			sourcePackage: '@dryui/ui'
		});
	});

	it('does not route primitive-only component pages', async () => {
		await callLoad('affix-group').then(
			() => {
				throw new Error('Expected affix-group to 404');
			},
			(reason: unknown) => {
				expect(reason).toMatchObject({ status: 404 });
			}
		);
	});
});
