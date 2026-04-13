import { expect, it } from 'vitest';
import MenubarHarness from './fixtures/menubar-harness.svelte';
import { render } from './_harness';

it('mounts multiple menus without recursive update errors', () => {
	const { target } = render(MenubarHarness);

	expect(target.querySelectorAll('[data-menubar-trigger]').length).toBe(3);
});
