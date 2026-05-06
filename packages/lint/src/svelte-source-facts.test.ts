import { describe, expect, test } from 'bun:test';
import {
	collectDryUiImports,
	collectSvelteComponentUsages,
	collectSvelteScriptBlocks,
	collectSvelteStyleBlocks,
	stripSvelteScriptAndStyleBlocks
} from './svelte-source-facts.js';

describe('svelte source facts', () => {
	test('collects script and style blocks with source lines', () => {
		const source = `<script>
  import { Button } from '@dryui/ui';
</script>

<Button />

<style>
  .x { color: red; }
</style>`;

		expect(collectSvelteScriptBlocks(source)).toMatchObject([
			{ content: "\n  import { Button } from '@dryui/ui';\n", line: 1 }
		]);
		expect(collectSvelteStyleBlocks(source)).toMatchObject([
			{ content: '\n  .x { color: red; }\n', line: 7 }
		]);
	});

	test('strips script and style blocks while preserving line count', () => {
		const source = `<script>
  const value = '<Button />';
</script>
<Button />`;

		const stripped = stripSvelteScriptAndStyleBlocks(source);
		expect(stripped.split('\n')).toHaveLength(source.split('\n').length);
		expect(stripped).not.toContain("'<Button />'");
		expect(stripped).toContain('<Button />');
	});

	test('collects DryUI imports including subpaths', () => {
		const imports = collectDryUiImports(`
import { Button, Grid } from '@dryui/ui';
import { Stack } from '@dryui/ui/stack';
import { Dialog } from '@dryui/primitives';
`);

		expect(imports.map((dryImport) => [dryImport.name, dryImport.specifier])).toEqual([
			['Button', '@dryui/ui'],
			['Grid', '@dryui/ui'],
			['Stack', '@dryui/ui/stack'],
			['Dialog', '@dryui/primitives']
		]);
	});

	test('collects component usages and props using current scanner semantics', () => {
		const template = `<Avatar {src} fallback="RB" bind:value --avatar-size="2rem" {...rest} />
<Tabs.Trigger value="one">One</Tabs.Trigger>`;

		expect(collectSvelteComponentUsages(template)).toMatchObject([
			{
				name: 'Avatar',
				line: 1,
				props: ['src', 'bind:value', '--avatar-size', 'fallback'],
				hasSpread: true,
				selfClosing: true
			},
			{
				name: 'Tabs.Trigger',
				line: 2,
				props: ['value'],
				hasSpread: false,
				selfClosing: false
			}
		]);
	});
});
