import { afterEach, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import MenubarHarness from './fixtures/menubar-harness.svelte';

const mountedComponents: ReturnType<typeof mount>[] = [];

afterEach(() => {
	for (const component of mountedComponents.splice(0)) {
		unmount(component);
	}

	document.body.replaceChildren();
});

it('mounts multiple menus without recursive update errors', () => {
	const target = document.createElement('div');
	document.body.append(target);

	const component = mount(MenubarHarness, { target });
	mountedComponents.push(component);

	flushSync();

	expect(target.querySelectorAll('[data-menubar-trigger]').length).toBe(3);
});
