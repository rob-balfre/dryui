import { describe, expect, it } from 'vitest';
import Avatar from '../../packages/primitives/src/avatar/avatar.svelte';
import { render } from './_harness';

function renderAvatar(props: { fallback?: string; alt?: string }) {
	const { target } = render(Avatar, props);

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
