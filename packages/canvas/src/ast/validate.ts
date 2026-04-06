import { findNodeLocation } from './query.js';
import { getComponentSpec } from '../spec.js';
import type { LayoutDocument, LayoutNode } from './types.js';

export interface ValidationIssue {
	severity: 'error' | 'warning';
	code: string;
	nodeId?: string;
	message: string;
}

function validateTextNode(node: LayoutNode): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (node.part !== null) {
		issues.push({
			severity: 'error',
			code: 'text-part',
			nodeId: node.id,
			message: 'Text nodes cannot declare a component part.'
		});
	}

	if (node.children.length > 0) {
		issues.push({
			severity: 'error',
			code: 'text-children',
			nodeId: node.id,
			message: 'Text nodes cannot contain children.'
		});
	}

	if (!node.text) {
		issues.push({
			severity: 'warning',
			code: 'text-empty',
			nodeId: node.id,
			message: 'Text nodes should provide visible copy.'
		});
	}

	return issues;
}

function validateComponentNode(node: LayoutNode): ValidationIssue[] {
	if (node.component === '__text__') {
		return validateTextNode(node);
	}

	const issues: ValidationIssue[] = [];
	const componentSpec = getComponentSpec(node.component);

	if (!componentSpec) {
		return [
			{
				severity: 'error',
				code: 'unknown-component',
				nodeId: node.id,
				message: `Unknown Studio component "${node.component}".`
			}
		];
	}

	if (componentSpec.compound) {
		if (!node.part) {
			issues.push({
				severity: 'error',
				code: 'missing-part',
				nodeId: node.id,
				message: `Compound component "${node.component}" must declare a part.`
			});
		} else if (!componentSpec.parts?.[node.part]) {
			issues.push({
				severity: 'error',
				code: 'invalid-part',
				nodeId: node.id,
				message: `Part "${node.part}" is not defined for "${node.component}".`
			});
		}
	} else if (node.part !== null) {
		issues.push({
			severity: 'error',
			code: 'unexpected-part',
			nodeId: node.id,
			message: `Simple component "${node.component}" cannot declare a part.`
		});
	}

	const propSpec =
		(node.part ? componentSpec.parts?.[node.part]?.props : componentSpec.props) ?? {};

	for (const propName of Object.keys(node.props)) {
		if (propName === 'children') {
			issues.push({
				severity: 'warning',
				code: 'children-prop',
				nodeId: node.id,
				message: 'Children should be represented as child nodes instead of a literal prop.'
			});
			continue;
		}

		if (!propSpec?.[propName]) {
			issues.push({
				severity: 'warning',
				code: 'unknown-prop',
				nodeId: node.id,
				message: `Property "${propName}" is not documented for "${node.component}${node.part ? `.${node.part}` : ''}".`
			});
		}
	}

	for (const cssVarName of Object.keys(node.cssVarOverrides)) {
		if (!componentSpec.cssVars[cssVarName]) {
			issues.push({
				severity: 'warning',
				code: 'unknown-css-var',
				nodeId: node.id,
				message: `CSS variable "${cssVarName}" is not documented for "${node.component}".`
			});
		}
	}

	return issues;
}

export function validateNodeTree(root: LayoutNode): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	const walk = (node: LayoutNode) => {
		issues.push(...validateComponentNode(node));
		for (const child of node.children) {
			walk(child);
		}
	};

	walk(root);
	return issues;
}

export function validateDocument(document: LayoutDocument): ValidationIssue[] {
	const issues = validateNodeTree(document.root);

	if (document.root.component === '__text__') {
		issues.push({
			severity: 'error',
			code: 'invalid-root',
			nodeId: document.root.id,
			message: 'The document root must be a component node, not a text node.'
		});
	}

	if (!findNodeLocation(document.root, document.root.id)) {
		issues.push({
			severity: 'error',
			code: 'missing-root',
			message: 'The document root could not be traversed.'
		});
	}

	return issues;
}
