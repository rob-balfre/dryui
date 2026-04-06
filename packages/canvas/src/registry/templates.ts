import { createCompoundTree, createNode } from '../ast/factory.js';
import type { LayoutNode } from '../ast/types.js';
import { getComponentSpec, listComponentNames } from '../spec.js';

export function createTemplateForComponent(component: string): LayoutNode {
	const componentSpec = getComponentSpec(component);

	if (componentSpec?.compound) {
		return createCompoundTree(component);
	}

	return createNode({ component });
}

export const componentTemplates = Object.freeze(
	Object.fromEntries(
		listComponentNames().map((component) => [component, createTemplateForComponent(component)])
	) as Record<string, LayoutNode>
);
