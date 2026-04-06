import { describe, expect, it } from 'bun:test';
import { load } from '../../apps/docs/src/routes/components/[slug]/+page.server';

function callLoad(slug: string) {
	return Promise.resolve(load({ params: { slug } } as Parameters<typeof load>[0]));
}

describe('docs component route contract', () => {
	it('returns name-based page data for ui components', async () => {
		const data = await callLoad('button');

		expect(data.name).toBe('Button');
		expect(data.kind).toBe('ui');
		expect('componentName' in data).toBe(false);
		expect(data.sourceUrl).toContain('packages/ui/src/button');
		expect(data.related?.component).toBe('Button');
		expect(data.a11y.length).toBeGreaterThan(0);
		expect(data.dataAttributes[0]).toMatchObject({
			name: 'data-disabled',
			description: expect.any(String)
		});
	});

	it('returns structured styling hooks for stateful components', async () => {
		const data = await callLoad('dialog');

		expect(data.name).toBe('Dialog');
		expect(data.kind).toBe('ui');
		expect(data.dataAttributes.find((attr) => attr.name === 'data-state')?.values).toEqual([
			'open',
			'closed'
		]);
	});

	it('returns ui metadata for motion surfaces', async () => {
		const data = await callLoad('reveal');

		expect(data.name).toBe('Reveal');
		expect(data.kind).toBe('ui');
	});
});
