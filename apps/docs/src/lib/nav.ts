import { docsNavCategories } from '../../../../packages/mcp/src/component-catalog.js';
import { componentDocsSlug } from '../../../../packages/mcp/src/component-identity.js';

interface NavItem {
	name: string;
	kind: 'ui';
}

interface NavCategory {
	label: string;
	items: NavItem[];
}

export const categories: NavCategory[] = docsNavCategories.map(({ label, items }) => ({
	label,
	items: items.map((name) => ({ name, kind: 'ui' }))
}));

export function toSlug(name: string): string {
	return componentDocsSlug(name);
}

export function allComponentNames(): string[] {
	return categories.flatMap((c) => c.items.map((item) => item.name));
}
