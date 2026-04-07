import type { Component } from 'svelte';

const modules = import.meta.glob('./*Demo.svelte', { eager: true }) as Record<
	string,
	{ default: Component }
>;

const demos = Object.fromEntries(
	Object.entries(modules)
		.map(([path, mod]) => {
			const match = path.match(/\/([A-Za-z0-9]+)Demo\.svelte$/);
			return match ? [match[1], mod.default] : null;
		})
		.filter((entry): entry is [string, Component] => entry !== null)
);

export function getComponentDemo(name: string): Component | null {
	return demos[name] ?? null;
}
