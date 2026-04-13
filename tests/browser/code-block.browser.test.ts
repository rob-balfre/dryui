import { describe, expect, it } from 'vitest';
import CodeBlock from '../../packages/ui/src/code-block/code-block.svelte';
import { render } from './_harness';

function renderCodeBlock(props: { code: string; language?: string }) {
	return render(CodeBlock, props).target;
}

describe('CodeBlock', () => {
	it('renders single-line code without injected layout whitespace', () => {
		const code = '<Button>Click me</Button>';
		const target = renderCodeBlock({ code, language: 'svelte' });
		const renderedCode = target.querySelector('[data-code-block] code');
		const root = target.querySelector('[data-code-block]');

		expect(root?.getAttribute('data-single-line')).toBe('true');
		expect(renderedCode?.textContent).toBe(code);
	});

	it('renders multiline code without extra blank lines between tokens', () => {
		const code = `<script lang="ts">
  let value = $state(['bold']);
</script>`;
		const target = renderCodeBlock({ code, language: 'svelte' });
		const renderedCode = target.querySelector('[data-code-block] code');

		expect(renderedCode?.textContent).toBe(code);
	});
});
