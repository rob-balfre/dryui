import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import LinkHarness from './fixtures/link-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

function render<Props extends Record<string, unknown>>(
	component: Parameters<typeof mount>[0],
	props?: Props
) {
	const target = document.createElement('div');
	document.body.append(target);

	const mounted = mount(component, {
		target,
		props
	});

	mountedComponents.push(mounted);
	flushSync();
	return target;
}

describe('UI remediation', () => {
	it('uses always-underlined links by default', () => {
		const target = render(LinkHarness);
		const link = target.querySelector('a');

		expect(link?.getAttribute('data-underline')).toBe('always');
	});
});
