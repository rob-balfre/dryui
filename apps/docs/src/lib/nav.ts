import { docsNavCategories } from '../../../../packages/mcp/src/component-catalog.js';
import { componentDocsSlug } from '../../../../packages/mcp/src/component-identity.js';

export type CatalogKind = 'ui' | 'primitive';

interface NavItem {
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

export const categories: NavCategory[] = docsNavCategories.map(({ label, items }) => ({
	label,
	items: items.map(ui)
}));
const categoryByComponent = new Map<string, string>();

for (const category of categories) {
	for (const item of category.items) {
		categoryByComponent.set(item.name, category.label);
	}
}

export function toSlug(name: string): string {
	return componentDocsSlug(name);
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

function getComponentItem(name: string): NavItem | undefined {
	for (const category of categories) {
		for (const item of category.items) {
			if (item.name === name) return item;
		}
	}
	return undefined;
}

export function getCategoryLabel(name: string): string | undefined {
	return categoryByComponent.get(name);
}
