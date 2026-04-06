import { beforeAll, describe, expect, it, mock } from 'bun:test';

type CanvasModule = typeof import('../../../packages/canvas/src/index.ts');
type BridgeModule = typeof import('../../../apps/studio/src/lib/ai/command-bridge.ts');

let CommandBus: CanvasModule['CommandBus'];
let createDocument: CanvasModule['createDocument'];
let createCommandBridge: BridgeModule['createCommandBridge'];

beforeAll(async () => {
	const [factoryModule, queryModule, specModule, templateModule, busModule] = await Promise.all([
		import('../../../packages/canvas/src/ast/factory.ts'),
		import('../../../packages/canvas/src/ast/query.ts'),
		import('../../../packages/canvas/src/spec.ts'),
		import('../../../packages/canvas/src/registry/templates.ts'),
		import('../../../packages/canvas/src/commands/bus.svelte.ts')
	]);

	const canvasModule = {
		...factoryModule,
		...queryModule,
		...specModule,
		...templateModule,
		...busModule
	};
	const canvasPath = new URL('../../../packages/canvas/src/index.ts', import.meta.url).pathname;

	mock.module('@dryui/canvas', () => canvasModule);
	mock.module(canvasPath, () => canvasModule);

	({ CommandBus } = canvasModule);
	({ createDocument } = canvasModule);
	({ createCommandBridge } = await import('../../../apps/studio/src/lib/ai/command-bridge.ts'));
});

describe('command bridge', () => {
	it('builds and applies an insert preview for component prompts', () => {
		const bus = new CommandBus(createDocument('Studio'));
		const bridge = createCommandBridge(bus);

		const preview = bridge.buildPreview('Add button', {
			document: bus.document,
			selectedNodeId: null
		});

		expect(preview).not.toBeNull();
		expect(preview?.summary).toBe('Insert Button into the live canvas');
		expect(preview?.commands).toHaveLength(2);

		const result = bridge.applyPreview(preview!);

		expect(result.applied).toBe(true);
		expect(bus.document.root.children.at(-1)?.component).toBe('Button');
	});

	it('builds an undo preview when history exists', () => {
		const bus = new CommandBus(createDocument('Studio'));
		const bridge = createCommandBridge(bus);

		const insertPreview = bridge.buildPreview('Add card', {
			document: bus.document,
			selectedNodeId: null
		});
		bridge.applyPreview(insertPreview!);

		const undoPreview = bridge.buildPreview('Undo that', {
			document: bus.document,
			selectedNodeId: bus.selection.activeNodeId
		});

		expect(undoPreview?.mode).toBe('undo');

		const result = bridge.applyPreview(undoPreview!);
		expect(result.applied).toBe(true);
	});

	it('builds a preview from server-supplied commands', () => {
		const bus = new CommandBus(createDocument('Studio'));
		const bridge = createCommandBridge(bus);

		const preview = bridge.buildPreviewFromCommands('Add button from server', [
			{
				type: 'insert-node',
				parentId: bus.document.root.id,
				index: bus.document.root.children.length,
				node: {
					id: 'server-button',
					component: 'Button',
					part: null,
					props: {},
					cssVarOverrides: {},
					style: {
						layout: 'block',
						gap: 'none'
					},
					children: [],
					locked: false,
					visible: true
				}
			}
		]);

		expect(preview?.summary).toBe('Insert Button into the root canvas');
		expect(preview?.lines).toHaveLength(1);
	});
});
