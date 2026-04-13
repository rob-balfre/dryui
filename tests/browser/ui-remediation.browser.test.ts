import { describe, expect, it } from 'vitest';
import LinkHarness from './fixtures/link-harness.svelte';
import { render } from './_harness';

describe('UI remediation', () => {
	it('uses always-underlined links by default', () => {
		const { target } = render(LinkHarness);
		const link = target.querySelector('a');

		expect(link?.getAttribute('data-underline')).toBe('always');
	});
});
