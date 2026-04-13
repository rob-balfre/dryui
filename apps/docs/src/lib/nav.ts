import { docsNavCategories } from '../../../../packages/mcp/src/component-catalog.js';

export type CatalogKind = 'ui' | 'primitive';

export interface NavItem {
	name: string;
	kind: CatalogKind;
}

interface NavCategory {
	label: string;
	items: NavItem[];
}

function ui(name: string): NavItem {
	return { name, kind: 'ui' };
}

export interface LayoutPreset {
	id: string;
	name: string;
	description: string;
	components: string[];
	regions: string[];
	snippet: string;
}

export const layoutPresets: LayoutPreset[] = [];

export const categories: NavCategory[] = docsNavCategories.map(({ label, items }) => ({
	label,
	items: items.map(ui)
}));

export function toSlug(name: string): string {
	return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function fromSlug(slug: string): NavItem | undefined {
	for (const cat of categories) {
		for (const item of cat.items) {
			if (toSlug(item.name) === slug) return item;
		}
	}
	return undefined;
}

export function allComponentNames(): string[] {
	return categories.flatMap((c) => c.items.map((item) => item.name));
}

export function getComponentItem(name: string): NavItem | undefined {
	for (const category of categories) {
		for (const item of category.items) {
			if (item.name === name) return item;
		}
	}
	return undefined;
}
