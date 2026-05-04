import type { Component } from 'svelte';

type DemoModule = { default: Component };

const modules = import.meta.glob<DemoModule>('./*Demo.svelte');

const demos = Object.fromEntries(
	Object.entries(modules)
		.map(([path, mod]) => {
			const match = path.match(/\/([A-Za-z0-9]+)Demo\.svelte$/);
			return match ? [match[1], mod] : null;
		})
		.filter((entry): entry is [string, () => Promise<DemoModule>] => entry !== null)
);

export async function getComponentDemo(name: string): Promise<Component | null> {
	const loadDemo = demos[name];
	if (!loadDemo) return null;

	const mod = await loadDemo();
	return mod.default;
}
