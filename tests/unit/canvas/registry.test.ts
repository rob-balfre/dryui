import { beforeAll, describe, expect, it, mock } from 'bun:test';
import spec from '../../../packages/mcp/src/spec.json';

type RegistryModule = typeof import('../../../packages/canvas/src/registry/index.js');
type TemplatesModule = typeof import('../../../packages/canvas/src/registry/templates.js');

let componentRegistry: RegistryModule['componentRegistry'];
let createTemplateForComponent: TemplatesModule['createTemplateForComponent'];

beforeAll(async () => {
	const uiPath = new URL('../../../packages/ui/src/index.ts', import.meta.url).pathname;
	const uiMock = () => {
		const placeholder = () => null;

		return Object.fromEntries(
			Object.entries(spec.components).map(([name, definition]) => [
				name,
				definition.compound
					? Object.fromEntries(
							Object.keys(definition.parts ?? {}).map((part) => [part, placeholder])
						)
					: placeholder
			])
		);
	};

	mock.module('@dryui/ui', uiMock);
	mock.module(uiPath, uiMock);

	const registryModule = await import('../../../packages/canvas/src/registry/index.js');
	const templatesModule = await import('../../../packages/canvas/src/registry/templates.js');

	componentRegistry = registryModule.componentRegistry;
	createTemplateForComponent = templatesModule.createTemplateForComponent;
});

describe('component registry', () => {
	it('registers every component from spec.json', () => {
		const specComponents = Object.keys(spec.components);
		expect(Object.keys(componentRegistry)).toHaveLength(specComponents.length);
		expect(Object.keys(componentRegistry).sort()).toEqual(specComponents.sort());
	});

	it('resolves all compound parts for Card', () => {
		const card = componentRegistry.Card;

		expect(card?.compound).toBe(true);
		expect(Object.keys(card.parts)).toEqual(['Root', 'Header', 'Content', 'Footer']);
	});

	it('builds default templates using the part order from spec', () => {
		const template = createTemplateForComponent('Card');

		expect(template.part).toBe('Root');
		expect(template.children.map((child) => child.part)).toEqual(
			Object.keys(spec.components.Card.parts ?? {}).filter((part) => part !== 'Root')
		);
	});
});
