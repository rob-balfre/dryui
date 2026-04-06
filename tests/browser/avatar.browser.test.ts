import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Avatar from '../../packages/primitives/src/avatar/avatar.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

function renderAvatar(props: { fallback?: string; alt?: string }) {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(Avatar, {
		target,
		props
	});

	mountedComponents.push(component);
	flushSync();

	const root = target.querySelector('[role="img"]');
	if (!root) {
		throw new Error('Expected avatar root');
	}

	return root;
}

describe('Avatar', () => {
	it('preserves two-character fallback text', () => {
		const root = renderAvatar({ fallback: 'JD' });
		expect(root.textContent?.trim()).toBe('JD');
	});

	it('derives two initials from alt text when no fallback is provided', () => {
		const root = renderAvatar({ alt: 'Jane Doe' });
		expect(root.textContent?.trim()).toBe('JD');
	});
});
