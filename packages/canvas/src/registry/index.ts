import type { Component } from 'svelte';
import * as UI from '@dryui/ui';
import { getComponentSpec, listComponentNames, type StudioComponentSpec } from '../spec.js';

type AnyComponent = Component<Record<string, unknown>>;

export interface ComponentRegistryEntry {
	name: string;
	compound: boolean;
	component: AnyComponent | null;
	parts: Record<string, AnyComponent>;
	spec: StudioComponentSpec;
}

const namespace = UI as Record<string, unknown>;

function asComponent(value: unknown): AnyComponent | null {
	return typeof value === 'function' ? (value as AnyComponent) : null;
}

function buildEntry(name: string): ComponentRegistryEntry {
	const spec = getComponentSpec(name);

	if (!spec) {
		throw new Error(`Missing Studio component spec for "${name}".`);
	}

	if (!spec.compound) {
		return {
			name,
			compound: false,
			component: asComponent(namespace[name]),
			parts: {},
			spec
		};
	}

	const compoundExport = namespace[name] as Record<string, unknown> | undefined;
	const parts = Object.fromEntries(
		Object.keys(spec.parts ?? {}).map((part) => [part, asComponent(compoundExport?.[part])])
	) as Record<string, AnyComponent | null>;

	return {
		name,
		compound: true,
		component: parts.Root ?? null,
		parts: Object.fromEntries(
			Object.entries(parts).filter(([, component]) => component !== null)
		) as Record<string, AnyComponent>,
		spec
	};
}

export const componentRegistry = Object.freeze(
	Object.fromEntries(listComponentNames().map((name) => [name, buildEntry(name)])) as Record<
		string,
		ComponentRegistryEntry
	>
);

export function resolveComponent(name: string, part: string | null = null): AnyComponent | null {
	const entry = componentRegistry[name];

	if (!entry) {
		return null;
	}

	if (entry.compound) {
		if (!part) {
			return entry.component;
		}

		return entry.parts[part] ?? null;
	}

	return entry.component;
}
