import { beforeAll, describe, expect, test } from 'bun:test';
import type { DolphinGraph } from './architecture.js';
import { buildDolphinGraph } from './architecture.js';

let graph: DolphinGraph;

beforeAll(async () => {
	graph = await buildDolphinGraph();
});

describe('DolphinGraph', () => {
	test('builds the architecture schema', () => {
		expect(graph.schema).toBe('DolphinGraph');
		expect(graph.summary.componentNodes).toBeGreaterThan(0);
	});

	test('captures wrapper relationships', () => {
		expect(graph.nodes.some((node) => node.id === 'ui:Button')).toBe(true);
		expect(graph.nodes.some((node) => node.id === 'primitives:Button')).toBe(true);
		expect(
			graph.edges.some(
				(edge) =>
					edge.type === 'wraps' && edge.from === 'ui:Button' && edge.to === 'primitives:Button'
			)
		).toBe(true);
	});

	test('keeps the public surface in sync', () => {
		expect(graph.clusters).toHaveLength(0);
		expect(graph.summary.mismatches).toBe(0);
		expect(graph.mismatches).toEqual([]);
	});

	test('does not model Thumbnail as a compound component', () => {
		const thumbnail = graph.nodes.find((node) => node.id === 'ui:Thumbnail');

		expect(thumbnail).toBeDefined();
		expect(thumbnail?.compound).toBe(false);
		expect(thumbnail?.parts).toEqual([]);
	});
});
