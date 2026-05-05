import type { Component } from 'svelte';

type DemoModule = { default: Component };

const modules = import.meta.glob<DemoModule>('./*Demo.svelte', { eager: true });

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
