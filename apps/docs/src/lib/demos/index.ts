import type { Component } from 'svelte';

const modules = import.meta.glob('./*Demo.svelte') as Record<
	string,
	() => Promise<{ default: Component }>
>;

const demos = Object.fromEntries(
	Object.entries(modules)
		.map(([path, loader]) => {
			const match = path.match(/\/([A-Za-z0-9]+)Demo\.svelte$/);
			return match ? [match[1], loader] : null;
		})
		.filter((entry): entry is [string, () => Promise<{ default: Component }>] => entry !== null)
);

export function getComponentDemo(name: string): Promise<Component> | null {
	const loader = demos[name];
	if (!loader) return null;
	return loader().then((m) => m.default);
}
