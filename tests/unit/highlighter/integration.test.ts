import { describe, it, expect } from 'bun:test';
import { highlight } from '../../../packages/ui/src/code-block/highlighter/index.js';

describe('Svelte highlighting integration', () => {
	it('highlights a complete Svelte component snippet', () => {
		const code = `<DataGrid.Root items={employees} pageSize={5} striped>
  <DataGrid.Table>
    <DataGrid.Header>
      <DataGrid.Row>
        <DataGrid.Column key="name" sortable>Name</DataGrid.Column>
      </DataGrid.Row>
    </DataGrid.Header>
  </DataGrid.Table>
</DataGrid.Root>`;

		const tokens = highlight(code, 'svelte');

		const components = tokens.filter((t) => t.type === 'component');
		expect(components.length).toBeGreaterThan(0);
		expect(code.slice(components[0].start, components[0].end)).toBe('DataGrid.Root');

		const attrs = tokens.filter((t) => t.type === 'attribute');
		expect(attrs.some((t) => code.slice(t.start, t.end) === 'items')).toBe(true);
		expect(attrs.some((t) => code.slice(t.start, t.end) === 'sortable')).toBe(true);

		const strs = tokens.filter((t) => t.type === 'string');
		expect(strs.some((t) => code.slice(t.start, t.end) === '"name"')).toBe(true);

		const nums = tokens.filter((t) => t.type === 'number');
		expect(nums.some((t) => code.slice(t.start, t.end) === '5')).toBe(true);
	});

	it('highlights a script block with runes', () => {
		const code = `let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(count);
});`;

		const tokens = highlight(code, 'svelte');

		const runes = tokens.filter((t) => t.type === 'rune');
		expect(runes.some((t) => code.slice(t.start, t.end) === '$state')).toBe(true);
		expect(runes.some((t) => code.slice(t.start, t.end) === '$derived')).toBe(true);
		expect(runes.some((t) => code.slice(t.start, t.end) === '$effect')).toBe(true);

		const keywords = tokens.filter((t) => t.type === 'keyword');
		expect(keywords.some((t) => code.slice(t.start, t.end) === 'let')).toBe(true);
	});

	it('highlights Svelte template blocks', () => {
		const code = `{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}`;

		const tokens = highlight(code, 'svelte');

		const svelteKws = tokens.filter((t) => t.type === 'svelte-keyword');
		expect(svelteKws.some((t) => code.slice(t.start, t.end) === '#each')).toBe(true);
		expect(svelteKws.some((t) => code.slice(t.start, t.end) === '/each')).toBe(true);
	});

	it('does not produce overlapping tokens', () => {
		const code = '<Button variant="solid" onclick={() => count++}>Click</Button>';
		const tokens = highlight(code, 'svelte');

		const sorted = [...tokens].sort((a, b) => a.start - b.start);
		for (let i = 1; i < sorted.length; i++) {
			expect(sorted[i].start).toBeGreaterThanOrEqual(sorted[i - 1].end);
		}
	});

	it('handles the full DataGrid example from docs', () => {
		const code = `<DataGrid.Root items={employees} pageSize={5} striped>
  <DataGrid.Table>
    <DataGrid.Header>
      <DataGrid.Row>
        <DataGrid.Column key="name" sortable>Name</DataGrid.Column>
        <DataGrid.Column key="department" sortable filterable>Department</DataGrid.Column>
        <DataGrid.Column key="salary" sortable>Salary</DataGrid.Column>
        <DataGrid.Column key="status">Status</DataGrid.Column>
      </DataGrid.Row>
    </DataGrid.Header>
    <DataGrid.Body>
      {#snippet children({ items })}
        {#each items as row (row.id)}
          <DataGrid.Row>
            <DataGrid.Cell>{row.name}</DataGrid.Cell>
            <DataGrid.Cell>{row.department}</DataGrid.Cell>
            <DataGrid.Cell>\${row.salary.toLocaleString()}</DataGrid.Cell>
            <DataGrid.Cell>{row.status}</DataGrid.Cell>
          </DataGrid.Row>
        {/each}
      {/snippet}
    </DataGrid.Body>
  </DataGrid.Table>
</DataGrid.Root>`;

		const tokens = highlight(code, 'svelte');

		// Verify key token types are present
		expect(tokens.some((t) => t.type === 'component')).toBe(true);
		expect(tokens.some((t) => t.type === 'attribute')).toBe(true);
		expect(tokens.some((t) => t.type === 'string')).toBe(true);
		expect(tokens.some((t) => t.type === 'svelte-keyword')).toBe(true);
		expect(tokens.some((t) => t.type === 'number')).toBe(true);
		expect(tokens.some((t) => t.type === 'function')).toBe(true); // toLocaleString

		// No overlaps
		const sorted = [...tokens].sort((a, b) => a.start - b.start);
		for (let i = 1; i < sorted.length; i++) {
			expect(sorted[i].start).toBeGreaterThanOrEqual(sorted[i - 1].end);
		}
	});
});
