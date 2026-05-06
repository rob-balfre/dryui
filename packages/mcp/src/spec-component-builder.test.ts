import { describe, expect, test } from 'bun:test';
import { buildComponentSpec, type ComponentSpecBuilderFs } from './spec-component-builder.ts';

function createMemoryFs(files: Record<string, string>): ComponentSpecBuilderFs {
	return {
		async readText(filePath) {
			const source = files[filePath];
			if (source === undefined) throw new Error(`Missing fixture: ${filePath}`);
			return source;
		},
		async listFileNames(dirPath) {
			const prefix = `${dirPath}/`;
			return Object.keys(files)
				.filter((filePath) => filePath.startsWith(prefix))
				.map((filePath) => filePath.slice(prefix.length))
				.filter((fileName) => !fileName.includes('/'));
		}
	};
}

describe('buildComponentSpec', () => {
	test('builds a UI component from source plus primitive fallback', async () => {
		const fs = createMemoryFs({
			'/ui/input/input.svelte': `
				<script lang="ts">
					let { label = 'Email', value = $bindable('') } = $props();
				</script>
				<input data-input-root />
				<style>
					.input {
						--dry-input-border: red;
					}
				</style>
			`
		});

		const spec = await buildComponentSpec({
			name: 'Input',
			meta: {
				description: 'Collects text input.',
				category: 'Forms',
				tags: ['form']
			},
			source: {
				dirPath: '/ui/input',
				indexPath: '/ui/input/index.ts',
				indexContent: `
					export interface InputProps {
						label?: string;
					}
				`
			},
			primitiveSource: {
				dirPath: '/primitives/input',
				indexPath: '/primitives/input/index.ts',
				indexContent: `
					export interface InputProps {
						value?: string;
					}
				`
			},
			importPath: '@dryui/ui',
			uiSrc: '/ui',
			fs
		});

		expect(spec).toMatchObject({
			import: '@dryui/ui',
			description: 'Collects text input.',
			category: 'Forms',
			tags: ['form'],
			compound: false,
			cssVars: {
				'--dry-input-border': 'Border color'
			}
		});
		expect(spec.dataAttributes.map((attr) => attr.name)).toEqual(['data-input-root']);
		expect(spec.props?.label).toMatchObject({ type: 'string', default: "'Email'" });
		expect(spec.props?.value).toMatchObject({
			type: 'string',
			default: "''",
			bindable: true
		});
	});
});
