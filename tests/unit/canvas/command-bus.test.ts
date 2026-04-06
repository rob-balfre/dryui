import { describe, expect, it } from 'bun:test';
import {
	createDocument,
	createNode,
	createTextNode
} from '../../../packages/canvas/src/ast/factory.js';
import { findNode } from '../../../packages/canvas/src/ast/query.js';
import { CommandBus } from '../../../packages/canvas/src/commands/bus.svelte.js';

describe('command bus', () => {
	it('executes insert, undo, and redo', () => {
		const document = createDocument();
		document.root.children = [];

		const bus = new CommandBus(document);
		const button = createNode({
			component: 'Button',
			children: [createTextNode('Save')]
		});

		expect(
			bus.execute(
				{
					type: 'insert-node',
					parentId: bus.document.root.id,
					index: 0,
					node: button
				},
				'mouse'
			)
		).toBe(true);

		expect(bus.document.root.children).toHaveLength(1);
		expect(bus.undo()).toBe(true);
		expect(bus.document.root.children).toHaveLength(0);
		expect(bus.redo()).toBe(true);
		expect(bus.document.root.children).toHaveLength(1);
	});

	it('applies batch mutations as a single history entry', () => {
		const document = createDocument();
		document.root.children = [];

		const bus = new CommandBus(document);
		const first = createNode({
			component: 'Button',
			children: [createTextNode('Primary')]
		});
		const second = createNode({
			component: 'Button',
			children: [createTextNode('Secondary')]
		});

		bus.execute(
			{
				type: 'batch',
				label: 'seed buttons',
				commands: [
					{
						type: 'insert-node',
						parentId: bus.document.root.id,
						index: 0,
						node: first
					},
					{
						type: 'insert-node',
						parentId: bus.document.root.id,
						index: 1,
						node: second
					}
				]
			},
			'system'
		);

		expect(bus.document.root.children).toHaveLength(2);
		expect(bus.undoStack).toHaveLength(1);
		expect(bus.undo()).toBe(true);
		expect(bus.document.root.children).toHaveLength(0);
	});

	it('enforces the active interaction lock by source priority', () => {
		const document = createDocument();
		document.root.children = [];

		const bus = new CommandBus(document);
		const text = createTextNode('Before');

		bus.execute(
			{
				type: 'insert-node',
				parentId: bus.document.root.id,
				index: 0,
				node: text
			},
			'system'
		);

		expect(bus.acquireLock(text.id, 'keyboard')).toBe(true);
		expect(
			bus.execute(
				{
					type: 'set-text',
					nodeId: text.id,
					text: 'Blocked'
				},
				'gesture'
			)
		).toBe(false);

		expect(
			bus.execute(
				{
					type: 'set-text',
					nodeId: text.id,
					text: 'Allowed'
				},
				'keyboard'
			)
		).toBe(true);

		expect(findNode(bus.document.root, text.id)?.text).toBe('Allowed');
	});
});
