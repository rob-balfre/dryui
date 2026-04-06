import { describe, expect, it } from 'bun:test';
import {
	createCompoundTree,
	createDocument,
	createTextNode
} from '../../../packages/canvas/src/ast/factory.js';
import { validateDocument } from '../../../packages/canvas/src/ast/validate.js';
import { findNode, findParent, flattenTree } from '../../../packages/canvas/src/ast/query.js';

describe('canvas AST', () => {
	it('creates text nodes with the Studio text marker', () => {
		const textNode = createTextNode('Hello Studio');

		expect(textNode.component).toBe('__text__');
		expect(textNode.text).toBe('Hello Studio');
		expect(textNode.children).toHaveLength(0);
	});

	it('expands compound templates in spec order', () => {
		const card = createCompoundTree('Card');

		expect(card.component).toBe('Card');
		expect(card.part).toBe('Root');
		expect(card.children.map((child) => child.part)).toEqual(['Header', 'Content', 'Footer']);
	});

	it('finds nodes and parents inside the document tree', () => {
		const document = createDocument();
		const card = document.root.children[0];

		if (!card) {
			throw new Error('Expected default document content');
		}

		const content = card.children.find((child) => child.part === 'Content');

		if (!content) {
			throw new Error('Expected card content part');
		}

		expect(findNode(document.root, content.id)?.id).toBe(content.id);
		expect(findParent(document.root, content.id)?.id).toBe(card.id);
		expect(flattenTree(document.root).some((location) => location.node.id === content.id)).toBe(
			true
		);
	});

	it('validates the default document without hard errors', () => {
		const issues = validateDocument(createDocument());
		expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(0);
	});
});
