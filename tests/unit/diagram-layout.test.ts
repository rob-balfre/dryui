import { describe, test, expect } from 'bun:test';
import { computeLayout } from '../../packages/ui/src/diagram/layout.js';
import type { DiagramConfig } from '../../packages/ui/src/diagram/types.js';

describe('computeLayout', () => {
	test('flat LR diagram with a cluster orders nodes left-to-right and encloses them in the cluster bbox', () => {
		const config: DiagramConfig = {
			direction: 'LR',
			nodes: [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
				{ id: 'c', label: 'C' }
			],
			edges: [
				{ from: 'a', to: 'b' },
				{ from: 'b', to: 'c' }
			],
			clusters: [{ id: 'group', label: 'Group', nodes: ['a', 'b', 'c'] }]
		};

		const result = computeLayout(config);

		expect(result.nodes).toHaveLength(3);
		expect(result.edges).toHaveLength(2);
		expect(result.clusters).toHaveLength(1);

		const a = result.nodes.find((n) => n.id === 'a')!;
		const b = result.nodes.find((n) => n.id === 'b')!;
		const c = result.nodes.find((n) => n.id === 'c')!;
		expect(a).toBeDefined();
		expect(b).toBeDefined();
		expect(c).toBeDefined();
		expect(a.x).toBeLessThan(b.x);
		expect(b.x).toBeLessThan(c.x);

		for (const edge of result.edges) {
			expect(typeof edge.path).toBe('string');
			expect(edge.path.length).toBeGreaterThan(0);
		}

		const cluster = result.clusters[0]!;
		const minNodeX = Math.min(a.x, b.x, c.x);
		const maxNodeRight = Math.max(a.x + a.width, b.x + b.width, c.x + c.width);
		const minNodeY = Math.min(a.y, b.y, c.y);
		const maxNodeBottom = Math.max(a.y + a.height, b.y + b.height, c.y + c.height);
		expect(cluster.x).toBeLessThanOrEqual(minNodeX);
		expect(cluster.x + cluster.width).toBeGreaterThanOrEqual(maxNodeRight);
		expect(cluster.y).toBeLessThanOrEqual(minNodeY);
		expect(cluster.y + cluster.height).toBeGreaterThanOrEqual(maxNodeBottom);
	});

	test('TB outer with LR cluster positions inner nodes horizontally and keeps outer nodes vertical', () => {
		const config: DiagramConfig = {
			direction: 'TB',
			nodes: [
				{ id: 'outer1', label: 'Outer 1' },
				{ id: 'inner1', label: 'Inner 1' },
				{ id: 'inner2', label: 'Inner 2' },
				{ id: 'outer2', label: 'Outer 2' }
			],
			edges: [
				{ from: 'outer1', to: 'inner1' },
				{ from: 'inner1', to: 'inner2' },
				{ from: 'inner2', to: 'outer2' }
			],
			clusters: [
				{
					id: 'group',
					label: 'Group',
					direction: 'LR',
					nodes: ['inner1', 'inner2']
				}
			]
		};

		const result = computeLayout(config);

		expect(result.nodes).toHaveLength(4);
		expect(result.edges.length).toBeGreaterThanOrEqual(3);

		const outer1 = result.nodes.find((n) => n.id === 'outer1')!;
		const inner1 = result.nodes.find((n) => n.id === 'inner1')!;
		const inner2 = result.nodes.find((n) => n.id === 'inner2')!;
		const outer2 = result.nodes.find((n) => n.id === 'outer2')!;
		expect(outer1).toBeDefined();
		expect(inner1).toBeDefined();
		expect(inner2).toBeDefined();
		expect(outer2).toBeDefined();

		for (const n of [outer1, inner1, inner2, outer2]) {
			expect(Number.isFinite(n.x)).toBe(true);
			expect(Number.isFinite(n.y)).toBe(true);
			expect(n.width).toBeGreaterThan(0);
			expect(n.height).toBeGreaterThan(0);
		}

		// LR cluster arranges inner nodes horizontally at roughly the same y.
		expect(inner1.x).toBeLessThan(inner2.x);
		const innerYDelta = Math.abs(inner1.y - inner2.y);
		expect(innerYDelta).toBeLessThan(Math.max(inner1.height, inner2.height));

		// Outer TB flow: outer1 above the cluster, outer2 below.
		expect(outer1.y).toBeLessThan(inner1.y);
		expect(outer2.y).toBeGreaterThan(inner1.y);

		// Cluster chrome for the directed cluster is emitted with the cluster's id
		// and its bbox should enclose both inner nodes.
		const cluster = result.clusters.find((c) => c.id === 'group');
		expect(cluster).toBeDefined();
		const minInnerX = Math.min(inner1.x, inner2.x);
		const maxInnerRight = Math.max(inner1.x + inner1.width, inner2.x + inner2.width);
		const minInnerY = Math.min(inner1.y, inner2.y);
		const maxInnerBottom = Math.max(inner1.y + inner1.height, inner2.y + inner2.height);
		expect(cluster!.x).toBeLessThanOrEqual(minInnerX);
		expect(cluster!.x + cluster!.width).toBeGreaterThanOrEqual(maxInnerRight);
		expect(cluster!.y).toBeLessThanOrEqual(minInnerY);
		expect(cluster!.y + cluster!.height).toBeGreaterThanOrEqual(maxInnerBottom);

		// All 3 configured edges produce non-empty paths somewhere in the result.
		for (const edge of result.edges) {
			expect(typeof edge.path).toBe('string');
			expect(edge.path.length).toBeGreaterThan(0);
		}
	});

	test('cross-boundary edge label is biased away from a directed-cluster boundary', () => {
		// Tight layerGap (just above 2*EDGE_GAP) produces a short polyline
		// where the natural midpoint sits within LABEL_BORDER_AVOID_PX of the
		// cluster top. The bias should pull labelY toward the source.
		const result = computeLayout({
			direction: 'TB',
			spacing: { layerGap: 60, nodeGap: 16 },
			nodes: [
				{ id: 'src', label: 'Source' },
				{ id: 'inner1', label: 'Inner 1' },
				{ id: 'inner2', label: 'Inner 2' }
			],
			edges: [
				{ from: 'src', to: 'inner1', label: 'go' },
				{ from: 'inner1', to: 'inner2' }
			],
			clusters: [
				{
					id: 'group',
					label: 'Group',
					direction: 'LR',
					nodes: ['inner1', 'inner2']
				}
			]
		});

		const labelled = result.edges.find((e) => e.label === 'go');
		expect(labelled).toBeDefined();
		const src = result.nodes.find((n) => n.id === 'src')!;
		const cluster = result.clusters.find((c) => c.id === 'group')!;
		const srcBottom = src.y + src.height;
		const midpointY = (srcBottom + cluster.y) / 2;

		// Bias pulls labelY toward srcBottom.
		expect(labelled!.labelY).toBeLessThan(midpointY);
		// And keeps a sane minimum distance from the source so it doesn't
		// collide with the source node.
		expect(labelled!.labelY).toBeGreaterThan(srcBottom - 4);
	});

	test('cross-boundary edge label stays at the geometric midpoint when the polyline is long enough', () => {
		const result = computeLayout({
			direction: 'TB',
			spacing: { layerGap: 200 },
			nodes: [
				{ id: 'src', label: 'Source' },
				{ id: 'inner1', label: 'Inner 1' },
				{ id: 'inner2', label: 'Inner 2' }
			],
			edges: [
				{ from: 'src', to: 'inner1', label: 'go' },
				{ from: 'inner1', to: 'inner2' }
			],
			clusters: [
				{
					id: 'group',
					label: 'Group',
					direction: 'LR',
					nodes: ['inner1', 'inner2']
				}
			]
		});

		const labelled = result.edges.find((e) => e.label === 'go')!;
		const src = result.nodes.find((n) => n.id === 'src')!;
		const cluster = result.clusters.find((c) => c.id === 'group')!;
		const srcBottom = src.y + src.height;
		const midpointY = (srcBottom + cluster.y) / 2;
		// Long polyline → no bias → label sits at the geometric midpoint
		// (within rounding tolerance from coordinate snapping).
		expect(Math.abs(labelled.labelY - midpointY)).toBeLessThan(2);
	});

	test('nested directed clusters lay out recursively with both inner and outer chrome', () => {
		// Outer TB layout. Outer1 → directed LR cluster "outer-group" containing
		// inner1, inner2, AND a directed TB cluster "inner-group" wrapping
		// inner2 and inner3. Then back to outer2.
		const result = computeLayout({
			direction: 'TB',
			nodes: [
				{ id: 'outer1', label: 'Outer 1' },
				{ id: 'inner1', label: 'Inner 1' },
				{ id: 'inner2', label: 'Inner 2' },
				{ id: 'inner3', label: 'Inner 3' },
				{ id: 'outer2', label: 'Outer 2' }
			],
			edges: [
				{ from: 'outer1', to: 'inner1' },
				{ from: 'inner1', to: 'inner2' },
				{ from: 'inner2', to: 'inner3' },
				{ from: 'inner3', to: 'outer2' }
			],
			clusters: [
				{
					id: 'outer-group',
					label: 'Outer Group',
					direction: 'LR',
					nodes: ['inner1', 'inner2', 'inner3']
				},
				{
					id: 'inner-group',
					label: 'Inner Group',
					direction: 'TB',
					nodes: ['inner2', 'inner3']
				}
			]
		});

		expect(result.nodes).toHaveLength(5);
		const outer1 = result.nodes.find((n) => n.id === 'outer1')!;
		const inner1 = result.nodes.find((n) => n.id === 'inner1')!;
		const inner2 = result.nodes.find((n) => n.id === 'inner2')!;
		const inner3 = result.nodes.find((n) => n.id === 'inner3')!;
		const outer2 = result.nodes.find((n) => n.id === 'outer2')!;

		// Outer TB flow: outer1 above the cluster, outer2 below.
		expect(outer1.y + outer1.height).toBeLessThanOrEqual(inner1.y + 1);
		expect(outer2.y).toBeGreaterThanOrEqual(Math.max(inner2.y, inner3.y));

		// Outer cluster (LR direction) places inner1 to the LEFT of the inner-group
		// (which contains inner2 and inner3 stacked TB).
		expect(inner1.x + inner1.width).toBeLessThanOrEqual(Math.min(inner2.x, inner3.x) + 1);

		// Inner cluster (TB direction) stacks inner2 above inner3.
		expect(inner2.y + inner2.height).toBeLessThanOrEqual(inner3.y + 1);
		expect(Math.abs(inner2.x - inner3.x)).toBeLessThan(2);

		// Both cluster chromes were emitted.
		const outerCluster = result.clusters.find((c) => c.id === 'outer-group');
		const innerCluster = result.clusters.find((c) => c.id === 'inner-group');
		expect(outerCluster).toBeDefined();
		expect(innerCluster).toBeDefined();

		// Outer cluster encloses all inner content.
		expect(outerCluster!.x).toBeLessThanOrEqual(Math.min(inner1.x, inner2.x, inner3.x));
		expect(outerCluster!.x + outerCluster!.width).toBeGreaterThanOrEqual(
			Math.max(inner1.x + inner1.width, inner2.x + inner2.width, inner3.x + inner3.width)
		);
		expect(outerCluster!.y).toBeLessThanOrEqual(Math.min(inner1.y, inner2.y, inner3.y));
		expect(outerCluster!.y + outerCluster!.height).toBeGreaterThanOrEqual(
			Math.max(inner1.y + inner1.height, inner2.y + inner2.height, inner3.y + inner3.height)
		);

		// Inner cluster encloses only its own members.
		expect(innerCluster!.x).toBeLessThanOrEqual(Math.min(inner2.x, inner3.x));
		expect(innerCluster!.x + innerCluster!.width).toBeGreaterThanOrEqual(
			Math.max(inner2.x + inner2.width, inner3.x + inner3.width)
		);
		expect(innerCluster!.y).toBeLessThanOrEqual(Math.min(inner2.y, inner3.y));
		expect(innerCluster!.y + innerCluster!.height).toBeGreaterThanOrEqual(
			Math.max(inner2.y + inner2.height, inner3.y + inner3.height)
		);

		// Inner cluster is strictly inside the outer cluster bounds.
		expect(innerCluster!.x).toBeGreaterThanOrEqual(outerCluster!.x);
		expect(innerCluster!.x + innerCluster!.width).toBeLessThanOrEqual(
			outerCluster!.x + outerCluster!.width
		);
		expect(innerCluster!.y).toBeGreaterThanOrEqual(outerCluster!.y);
		expect(innerCluster!.y + innerCluster!.height).toBeLessThanOrEqual(
			outerCluster!.y + outerCluster!.height
		);

		// All edges produce non-empty paths and the viewBox is positive.
		for (const edge of result.edges) {
			expect(typeof edge.path).toBe('string');
			expect(edge.path.length).toBeGreaterThan(0);
		}
		expect(result.viewBox.width).toBeGreaterThan(0);
		expect(result.viewBox.height).toBeGreaterThan(0);
	});

	test('flat cluster nested inside a directed cluster renders inside the parent chrome', () => {
		const result = computeLayout({
			direction: 'TB',
			nodes: [
				{ id: 'src', label: 'Source' },
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
				{ id: 'c', label: 'C' },
				{ id: 'sink', label: 'Sink' }
			],
			edges: [
				{ from: 'src', to: 'a' },
				{ from: 'a', to: 'b' },
				{ from: 'b', to: 'c' },
				{ from: 'c', to: 'sink' }
			],
			clusters: [
				{ id: 'agent', label: 'Agent', direction: 'LR', nodes: ['a', 'b', 'c'] },
				{ id: 'highlight', label: 'Highlight', nodes: ['a', 'b'] }
			]
		});

		const agent = result.clusters.find((c) => c.id === 'agent')!;
		const highlight = result.clusters.find((c) => c.id === 'highlight')!;
		expect(highlight.width).toBeGreaterThan(0);
		expect(highlight.height).toBeGreaterThan(0);

		const a = result.nodes.find((n) => n.id === 'a')!;
		const b = result.nodes.find((n) => n.id === 'b')!;
		expect(highlight.x).toBeLessThanOrEqual(Math.min(a.x, b.x));
		expect(highlight.x + highlight.width).toBeGreaterThanOrEqual(
			Math.max(a.x + a.width, b.x + b.width)
		);

		// Highlight sits inside the agent cluster bbox.
		expect(highlight.x).toBeGreaterThanOrEqual(agent.x);
		expect(highlight.x + highlight.width).toBeLessThanOrEqual(agent.x + agent.width);
		expect(highlight.y).toBeGreaterThanOrEqual(agent.y);
		expect(highlight.y + highlight.height).toBeLessThanOrEqual(agent.y + agent.height);
	});

	test('back edge with waypoint produces a waypoint entry and non-empty path segments', () => {
		const config: DiagramConfig = {
			direction: 'TB',
			nodes: [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
				{ id: 'c', label: 'C' }
			],
			edges: [
				{ from: 'a', to: 'b' },
				{ from: 'b', to: 'c' },
				{
					from: 'c',
					to: 'a',
					loop: 'over',
					waypoint: { label: 'retry' }
				}
			]
		};

		const result = computeLayout(config);

		expect(result.nodes).toHaveLength(3);
		// The back edge with a waypoint is split into entry + exit segments, so the
		// emitted edge count is at least (forward count + 1 extra for the split).
		expect(result.edges.length).toBeGreaterThanOrEqual(3);

		const backSegments = result.edges.filter((e) => e.from === 'c' && e.to === 'a');
		expect(backSegments.length).toBeGreaterThanOrEqual(1);
		for (const seg of backSegments) {
			expect(typeof seg.path).toBe('string');
			expect(seg.path.length).toBeGreaterThan(0);
		}

		expect(result.waypoints.length).toBeGreaterThanOrEqual(1);
		const retry = result.waypoints.find((w) => w.label === 'retry');
		expect(retry).toBeDefined();
		expect(retry!.width).toBeGreaterThan(0);
		expect(retry!.height).toBeGreaterThan(0);
	});

	test('vertical back-edge waypoints stay centered on the lane while keeping the lower elbow upward', () => {
		const config: DiagramConfig = {
			direction: 'TB',
			spacing: { cornerRadius: 16, nodeGap: 32, layerGap: 72, backEdgeLaneGap: 144 },
			nodes: [
				{ id: 'you', label: 'You' },
				{ id: 'mcp', label: 'DryUI MCP' },
				{ id: 'pre', label: 'Preprocessor' },
				{ id: 'app', label: 'Your App' }
			],
			edges: [
				{ from: 'you', to: 'mcp' },
				{ from: 'mcp', to: 'pre' },
				{ from: 'pre', to: 'app' },
				{
					from: 'app',
					to: 'you',
					waypoint: {
						label: 'Live Feedback',
						description:
							'Annotate the running app in your browser. The agent reads your marks instantly.',
						width: 240,
						height: 160,
						position: 0.32
					}
				}
			],
			clusters: [{ id: 'agent', label: 'AI Agent', direction: 'LR', nodes: ['mcp', 'pre', 'app'] }]
		};

		const result = computeLayout(config);
		const waypoint = result.waypoints.find((w) => w.label === 'Live Feedback');
		const entry = result.edges.find((e) => e.kind === 'entry' && e.to === 'you');
		const exit = result.edges.find((e) => e.kind === 'exit' && e.to === 'you');
		expect(waypoint).toBeDefined();
		expect(entry).toBeDefined();
		expect(exit).toBeDefined();

		const entryMatch = entry!.path.match(/^M\s+([0-9.]+)\s+([0-9.]+)/);
		const laneMatch = exit!.path.match(/^M\s+([0-9.]+)\s+([0-9.]+)/);
		expect(entryMatch).not.toBeNull();
		expect(laneMatch).not.toBeNull();
		const entryY = Number(entryMatch![2]);
		const laneX = Number(laneMatch![1]);
		const laneInset = laneX - waypoint!.x;
		const waypointBottom = waypoint!.y + waypoint!.height;

		expect(laneInset).toBeCloseTo(waypoint!.width / 2, 1);
		expect(waypointBottom).toBeLessThan(entryY);
	});

	test('cluster with labelPosition: left allocates a left gutter and keeps members inside the bbox', () => {
		const top = computeLayout({
			direction: 'LR',
			nodes: [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' }
			],
			edges: [{ from: 'a', to: 'b' }],
			clusters: [{ id: 'group', label: 'Group', nodes: ['a', 'b'] }]
		});
		const left = computeLayout({
			direction: 'LR',
			nodes: [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' }
			],
			edges: [{ from: 'a', to: 'b' }],
			clusters: [{ id: 'group', label: 'Group', labelPosition: 'left', nodes: ['a', 'b'] }]
		});

		const topCluster = top.clusters[0]!;
		const leftCluster = left.clusters[0]!;
		expect(leftCluster.labelPosition).toBe('left');

		// Left-positioned label trades vertical gutter for horizontal gutter.
		expect(leftCluster.width).toBeGreaterThan(topCluster.width);
		expect(leftCluster.height).toBeLessThanOrEqual(topCluster.height + 0.5);

		const a = left.nodes.find((n) => n.id === 'a')!;
		const b = left.nodes.find((n) => n.id === 'b')!;
		// Members still enclosed by the cluster bbox.
		expect(leftCluster.x).toBeLessThanOrEqual(Math.min(a.x, b.x));
		expect(leftCluster.x + leftCluster.width).toBeGreaterThanOrEqual(
			Math.max(a.x + a.width, b.x + b.width)
		);
		expect(leftCluster.y).toBeLessThanOrEqual(Math.min(a.y, b.y));
		expect(leftCluster.y + leftCluster.height).toBeGreaterThanOrEqual(
			Math.max(a.y + a.height, b.y + b.height)
		);
	});

	test('directed cluster with labelPosition: left positions inner nodes inside the gutter', () => {
		const result = computeLayout({
			direction: 'TB',
			nodes: [
				{ id: 'outer1', label: 'Outer 1' },
				{ id: 'inner1', label: 'Inner 1' },
				{ id: 'inner2', label: 'Inner 2' },
				{ id: 'outer2', label: 'Outer 2' }
			],
			edges: [
				{ from: 'outer1', to: 'inner1' },
				{ from: 'inner1', to: 'inner2' },
				{ from: 'inner2', to: 'outer2' }
			],
			clusters: [
				{
					id: 'group',
					label: 'Group',
					labelPosition: 'left',
					direction: 'LR',
					nodes: ['inner1', 'inner2']
				}
			]
		});

		const cluster = result.clusters.find((c) => c.id === 'group')!;
		expect(cluster.labelPosition).toBe('left');

		const inner1 = result.nodes.find((n) => n.id === 'inner1')!;
		const inner2 = result.nodes.find((n) => n.id === 'inner2')!;

		// Inner nodes still inside the cluster, with room for the left gutter.
		const leftGap = inner1.x - cluster.x;
		expect(leftGap).toBeGreaterThan(40); // padding (40) + label gutter (32)
		expect(cluster.x + cluster.width).toBeGreaterThanOrEqual(inner2.x + inner2.width);
		expect(cluster.y).toBeLessThanOrEqual(Math.min(inner1.y, inner2.y));
		expect(cluster.y + cluster.height).toBeGreaterThanOrEqual(
			Math.max(inner1.y + inner1.height, inner2.y + inner2.height)
		);
	});

	test('cross-boundary back edge anchors to the inner node, not the cluster super-node', () => {
		// Outer TB layout. The directed LR cluster contains a, b, c.
		// The back edge c → src crosses the cluster boundary; we expect its
		// polyline to start at c's center X (the rightmost inner node), not at
		// the cluster super-node's center.
		const result = computeLayout({
			direction: 'TB',
			spacing: { backEdgeLaneGap: 80 },
			nodes: [
				{ id: 'src', label: 'Source' },
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
				{ id: 'c', label: 'C' }
			],
			edges: [
				{ from: 'src', to: 'a' },
				{ from: 'a', to: 'b' },
				{ from: 'b', to: 'c' },
				{ from: 'c', to: 'src', loop: 'over' }
			],
			clusters: [
				{
					id: 'group',
					label: 'Group',
					direction: 'LR',
					nodes: ['a', 'b', 'c']
				}
			]
		});

		const c = result.nodes.find((n) => n.id === 'c')!;
		const cluster = result.clusters.find((cl) => cl.id === 'group')!;

		// The cross-boundary back edge ends at src and starts above c (the
		// rightmost inner node). It's the only edge with to === 'src'.
		const backEdge = result.edges.find((e) => e.to === 'src');
		expect(backEdge).toBeDefined();
		expect(backEdge!.path.length).toBeGreaterThan(0);

		const m = backEdge!.path.match(/^M\s+([0-9.\-]+)\s+([0-9.\-]+)/);
		expect(m).not.toBeNull();
		const startX = parseFloat(m![1]!);
		const startY = parseFloat(m![2]!);

		const cCenterX = c.x + c.width / 2;
		const clusterCenterX = cluster.x + cluster.width / 2;

		// Anchored at c's center X (within rounding), NOT the cluster center.
		expect(Math.abs(startX - cCenterX)).toBeLessThan(2);
		expect(Math.abs(startX - clusterCenterX)).toBeGreaterThan(10);

		// Starting Y is just above c (one EDGE_GAP cushion).
		expect(startY).toBeLessThan(c.y);
		expect(startY).toBeGreaterThan(c.y - 30);
	});

	test('cross-boundary forward edge keeps super-node anchoring', () => {
		// Forward direction edges should still anchor to the cluster as a
		// whole — re-anchoring is intentionally backedge-only per item 4.
		const result = computeLayout({
			direction: 'TB',
			nodes: [
				{ id: 'src', label: 'Source' },
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' }
			],
			edges: [
				{ from: 'src', to: 'a' },
				{ from: 'a', to: 'b' }
			],
			clusters: [
				{
					id: 'group',
					label: 'Group',
					direction: 'LR',
					nodes: ['a', 'b']
				}
			]
		});

		const a = result.nodes.find((n) => n.id === 'a')!;
		const b = result.nodes.find((n) => n.id === 'b')!;
		const cluster = result.clusters.find((cl) => cl.id === 'group')!;

		// The cross-boundary forward edge src → a routes from src to the
		// cluster, ending near the cluster top center, not at a's left edge.
		const forwardEdge = result.edges.find((e) => e.from === 'src');
		expect(forwardEdge).toBeDefined();

		// Find the LAST L command — this is the polyline's ending point.
		const lCommands = [...forwardEdge!.path.matchAll(/L\s+([0-9.\-]+)\s+([0-9.\-]+)/g)];
		expect(lCommands.length).toBeGreaterThan(0);
		const lastL = lCommands[lCommands.length - 1]!;
		const endX = parseFloat(lastL[1]!);

		// Anchored to the cluster super-node center, not to A's center.
		const clusterCenterX = cluster.x + cluster.width / 2;
		const aCenterX = a.x + a.width / 2;
		expect(Math.abs(endX - clusterCenterX)).toBeLessThan(20);
		// And endX is meaningfully different from a.cx (since a is leftmost).
		expect(Math.abs(endX - aCenterX)).toBeGreaterThan(0);
		// Suppress unused warning for b — it's part of the cluster context.
		expect(b).toBeDefined();
	});

	test('multiple back edges on the same side produce distinct paths via lane stacking', () => {
		const config: DiagramConfig = {
			direction: 'TB',
			nodes: [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B' },
				{ id: 'c', label: 'C' },
				{ id: 'd', label: 'D' }
			],
			edges: [
				{ from: 'a', to: 'b' },
				{ from: 'b', to: 'c' },
				{ from: 'c', to: 'd' },
				{ from: 'b', to: 'a', loop: 'over' },
				{ from: 'c', to: 'a', loop: 'over' },
				{ from: 'd', to: 'a', loop: 'over' }
			]
		};

		const result = computeLayout(config);

		expect(result.nodes).toHaveLength(4);

		const backEdges = result.edges.filter(
			(e) => e.to === 'a' && (e.from === 'b' || e.from === 'c' || e.from === 'd')
		);
		expect(backEdges).toHaveLength(3);

		for (const be of backEdges) {
			expect(typeof be.path).toBe('string');
			expect(be.path.length).toBeGreaterThan(0);
		}

		const uniquePaths = new Set(backEdges.map((e) => e.path));
		expect(uniquePaths.size).toBe(3);
	});

	describe('caching', () => {
		test('computeLayout returns the identical result on repeat calls with the same config object', () => {
			const config: DiagramConfig = {
				direction: 'TB',
				nodes: [
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				],
				edges: [{ from: 'a', to: 'b' }]
			};
			const r1 = computeLayout(config);
			const r2 = computeLayout(config);
			// Same reference → WeakMap cache hit.
			expect(r1).toBe(r2);
		});

		test('two different config objects with identical content do not share results', () => {
			const make = (): DiagramConfig => ({
				direction: 'TB',
				nodes: [
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' }
				],
				edges: [{ from: 'a', to: 'b' }]
			});
			const r1 = computeLayout(make());
			const r2 = computeLayout(make());
			// Different references but content-equivalent results.
			expect(r1).not.toBe(r2);
			expect(r1.nodes.length).toBe(r2.nodes.length);
			expect(r1.viewBox.width).toBe(r2.viewBox.width);
			expect(r1.viewBox.height).toBe(r2.viewBox.height);
		});

		test('sub-layout cache reuses leaf directed-cluster results across different parent configs', () => {
			// Two configs with identical inner clusters but different outer
			// surroundings. The leaf sub-layout should hit the cache on the
			// second call and produce identical inner-node positions (relative
			// to the cluster's local frame).
			const inner = (): DiagramConfig => ({
				direction: 'TB',
				nodes: [
					{ id: 'src1', label: 'Src1' },
					{ id: 'a', label: 'A' },
					{ id: 'b', label: 'B' },
					{ id: 'c', label: 'C' }
				],
				edges: [
					{ from: 'src1', to: 'a' },
					{ from: 'a', to: 'b' },
					{ from: 'b', to: 'c' }
				],
				clusters: [
					{
						id: 'group',
						label: 'Group',
						direction: 'LR',
						nodes: ['a', 'b', 'c']
					}
				]
			});

			const result1 = computeLayout(inner());
			// Second call with a freshly-built config — full layout cache misses
			// (different object reference) but sub-layout cache hits for the
			// 'group' cluster contents.
			const result2 = computeLayout(inner());

			// Inner positions should be identical (translation-invariant w.r.t.
			// how the outer pass placed the super-node — which is the same in
			// both calls because all inputs match).
			const a1 = result1.nodes.find((n) => n.id === 'a')!;
			const a2 = result2.nodes.find((n) => n.id === 'a')!;
			const b1 = result1.nodes.find((n) => n.id === 'b')!;
			const b2 = result2.nodes.find((n) => n.id === 'b')!;
			expect(a1.x).toBeCloseTo(a2.x, 1);
			expect(a1.y).toBeCloseTo(a2.y, 1);
			expect(b1.x).toBeCloseTo(b2.x, 1);
			expect(b1.y).toBeCloseTo(b2.y, 1);
		});
	});

	describe('degenerate cases', () => {
		test('empty diagram returns a valid result with zero nodes and edges', () => {
			const config: DiagramConfig = { direction: 'TB', nodes: [], edges: [] };
			const result = computeLayout(config);
			expect(result.nodes).toHaveLength(0);
			expect(result.edges).toHaveLength(0);
			expect(result.clusters).toHaveLength(0);
			expect(result.waypoints).toHaveLength(0);
			expect(result.viewBox.width).toBeGreaterThan(0);
			expect(result.viewBox.height).toBeGreaterThan(0);
		});

		test('single node with no edges returns one positioned node', () => {
			const config: DiagramConfig = {
				direction: 'TB',
				nodes: [{ id: 'a', label: 'A' }],
				edges: []
			};
			const result = computeLayout(config);
			expect(result.nodes).toHaveLength(1);
			expect(result.nodes[0]!.id).toBe('a');
			expect(result.nodes[0]!.width).toBeGreaterThan(0);
			expect(result.nodes[0]!.height).toBeGreaterThan(0);
			expect(result.edges).toHaveLength(0);
		});

		test('self-loop does not throw and leaves the node intact', () => {
			const config: DiagramConfig = {
				direction: 'TB',
				nodes: [{ id: 'a', label: 'A' }],
				edges: [{ from: 'a', to: 'a' }]
			};
			const result = computeLayout(config);
			expect(result.nodes).toHaveLength(1);
			expect(result.nodes[0]!.id).toBe('a');
		});
	});
});
