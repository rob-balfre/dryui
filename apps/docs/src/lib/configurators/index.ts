import type { Component } from 'svelte';

const modules = import.meta.glob('./*Configurator.svelte') as Record<
	string,
	() => Promise<{ default: Component }>
>;

const configurators = Object.fromEntries(
	Object.entries(modules)
		.map(([path, loader]) => {
			const match = path.match(/\/([A-Za-z0-9]+)Configurator\.svelte$/);
			return match ? [match[1], loader] : null;
		})
		.filter((entry): entry is [string, () => Promise<{ default: Component }>] => entry !== null)
);

export function getComponentConfigurator(name: string): Promise<Component> | null {
	const loader = configurators[name];
	if (!loader) return null;
	return loader().then((m) => m.default);
}
